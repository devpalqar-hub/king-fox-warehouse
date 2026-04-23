"use client";

import styles from "./luckydraw-view.module.css";
import {
  ArrowLeft,
  Calendar,
  Download,
  StopCircle,
  MapPin,
  Ticket,
  Users,
  Clock,
  Pencil,
  PlayCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getCampaignById,
  updateCampaignStatus,
} from "@/services/luckydraw.service";
import { useToast } from "@/components/toast/ToastProvider";
import { AlertTriangle, X } from "lucide-react";
import { formatExportDate, requestExport } from "@/services/export.service";

type CampaignBranch = {
  id: number;
  name: string;
};

type CampaignVoucher = {
  id: number;
  voucherCode: string;
  issuedAt: string;
  branch?: CampaignBranch | null;
  customer?: {
    name?: string | null;
    phone?: string | null;
  } | null;
};

type Campaign = {
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  image?: string | null;
  totalVouchersLimit: number;
  vouchersIssued: number;
  priority?: string | null;
  filterType?: string | null;
  branches?: CampaignBranch[];
  vouchers?: CampaignVoucher[];
};

const LuckyDrawViewPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusChanging, setStatusChanging] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportEmail, setExportEmail] = useState("");
  const [exportFormat, setExportFormat] = useState<"EXCEL" | "PDF">("EXCEL");

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return;

    try {
      const parsed = JSON.parse(rawUser);
      if (parsed.email) setExportEmail(parsed.email);
    } catch {}
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCampaignById(id as string);
        setCampaign(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleStatusChange = async (newStatus: "ACTIVE" | "CLOSED") => {
    if (!campaign) return;
    setStatusChanging(true);
    try {
      await updateCampaignStatus(id as string, newStatus);
      setCampaign({ ...campaign, status: newStatus });
      showToast(
        `Campaign ${newStatus === "ACTIVE" ? "activated" : "closed"} successfully`,
        "success",
      );
      setShowCloseModal(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to update campaign status", "error");
    } finally {
      setStatusChanging(false);
    }
  };

  const handleCloseCampaign = () => {
    handleStatusChange("CLOSED");
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Loading campaign…</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className={styles.loadingWrapper}>
        <p>Campaign not found.</p>
        <Link href="/luckydraw" className={styles.backLink}>
          ← Back to Lucky Draws
        </Link>
      </div>
    );
  }

  const statusClass = campaign.status?.toLowerCase();
  const startDate = new Date(campaign.startDate);
  const endDate = new Date(campaign.endDate);
  const today = new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const participants = campaign.vouchers?.length ?? 0;
  const uniqueBranches: CampaignBranch[] = campaign.branches?.length
    ? campaign.branches
    : Array.from(
        new Map(
          (campaign.vouchers ?? [])
            .map((voucher) => voucher.branch)
            .filter((branch): branch is CampaignBranch =>
              Boolean(branch && Number.isFinite(branch.id)),
            )
            .map((branch) => [branch.id, branch]),
        ).values(),
      );
  const campaignBranchIds = uniqueBranches.map((branch) => branch.id);

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!exportEmail.trim()) {
      showToast("Please enter an email", "error");
      return;
    }

    setIsExporting(true);

    try {
      await requestExport({
        type: "VOUCHERS",
        format: exportFormat,
        email: exportEmail,
        startDate: formatExportDate(campaign.startDate),
        endDate: formatExportDate(campaign.endDate),
        branchIds: campaignBranchIds,
      });

      showToast(
        `Export requested. ${exportFormat} will be sent to your email.`,
        "success",
      );

      setIsExportModalOpen(false);
    } catch (err) {
      showToast("Failed to export", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Back nav */}
      <button
        className={styles.backBtn}
        onClick={() => router.push("/luckydraw")}
      >
        <ArrowLeft size={16} />
        Back to Campaigns
      </button>

      {/* ── Hero Banner ────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroOverlay} />
        {campaign.image && (
          <img
            src={campaign.image}
            alt={campaign.name}
            className={styles.heroBg}
          />
        )}

        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <span className={`${styles.statusBadge} ${styles[statusClass]}`}>
              <span className={styles.statusDot} />
              {campaign.status.charAt(0) +
                campaign.status.slice(1).toLowerCase()}{" "}
              Status
            </span>
            <h1 className={styles.heroTitle}>{campaign.name}</h1>
            <p className={styles.heroDesc}>{campaign.description}</p>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatLabel}>TOTAL VOUCHERS</span>
              <span className={styles.heroStatValue}>
                {campaign.totalVouchersLimit}
              </span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatLabel}>REDEEMED</span>
              <span className={styles.heroStatValue}>
                {campaign.vouchersIssued}
              </span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatLabel}>PARTICIPANTS</span>
              <span className={styles.heroStatValue}>{participants}</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={`${styles.heroStat} ${styles.heroStatHighlight}`}>
              <span className={styles.heroStatLabel}>DAYS LEFT</span>
              <span className={styles.heroStatValue}>{daysLeft}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────── */}
      <div className={styles.body}>
        {/* Main column */}
        <div className={styles.mainCol}>
          {/* Campaign Details */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Campaign Details</h2>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Campaign Name</span>
              <span className={styles.detailValue}>{campaign.name}</span>
            </div>
            <div className={styles.divider} />

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Launch Date</span>
              <span className={styles.detailValue}>
                {startDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className={styles.divider} />

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Closing Date</span>
              <span className={styles.detailValue}>
                {endDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className={styles.divider} />

            <div className={`${styles.detailRow} ${styles.detailRowTop}`}>
              <span className={styles.detailLabel}>Active Branches</span>
              <div className={styles.branchTags}>
                {uniqueBranches.length > 0 ? (
                  uniqueBranches.map((branch) => (
                    <span key={branch.id} className={styles.branchTag}>
                      {branch.name.toUpperCase()}
                    </span>
                  ))
                ) : (
                  <span className={styles.detailValueMuted}>All Branches</span>
                )}
              </div>
            </div>
          </section>

          {/* Vouchers Table */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Issued Vouchers</h2>
              <span className={styles.voucherCount}>
                {campaign.vouchers?.length ?? 0} total
              </span>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Voucher Code</th>
                    <th>Customer</th>
                    <th>Branch</th>
                    <th>Issued At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!campaign.vouchers || campaign.vouchers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={styles.emptyState}>
                        No vouchers issued yet.
                      </td>
                    </tr>
                  ) : (
                    campaign.vouchers.map((voucher) => {
                      const v = voucher;

                      return (
                        <tr key={voucher.id}>
                          <td>
                            <span className={styles.voucherCode}>
                              {voucher.voucherCode}
                            </span>
                          </td>
                          <td>
                            <div className={styles.customerCell}>
                              <div className={styles.avatar}>
                                {voucher.customer?.name?.charAt(0) ?? "?"}
                              </div>
                              <div>
                                <div className={styles.customerName}>
                                  {v.customer?.name ?? "—"}
                                </div>
                                <div className={styles.customerPhone}>
                                  {v.customer?.phone ?? ""}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={styles.branchName}>
                              {v.branch?.name ?? "—"}
                            </span>
                          </td>
                          <td>
                            <div className={styles.dateCell}>
                              <Calendar size={12} />
                              {new Date(v.issuedAt).toLocaleDateString(
                                "en-US",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`${styles.statusPill} ${styles.pillActive}`}
                            >
                              ISSUED
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.card}>
            <h3 className={styles.sidebarTitle}>Quick Actions</h3>

            <button
              className={styles.btnExport}
              onClick={() => setIsExportModalOpen(true)}
              disabled={isExporting}
              title="Email campaign details as PDF"
            >
              <Download size={15} />
              {isExporting ? "Requesting..." : "Export PDF"}
            </button>

            <Link href={`/luckydraw/${id}/edit`} className={styles.btnEdit}>
              <Pencil size={15} />
              Edit Campaign
            </Link>

            {campaign.status === "DRAFT" && (
              <button
                className={styles.btnActivate}
                onClick={() => handleStatusChange("ACTIVE")}
                disabled={statusChanging}
              >
                <PlayCircle size={15} />
                {statusChanging ? "Activating..." : "Activate Campaign"}
              </button>
            )}

            {campaign.status === "ACTIVE" && (
              <button
                className={styles.btnEnd}
                onClick={() => setShowCloseModal(true)}
                disabled={statusChanging}
              >
                <StopCircle size={15} />
                {statusChanging ? "Closing..." : "Close Campaign"}
              </button>
            )}
          </div>

          {/* Mini stats */}
          <div className={styles.card}>
            <h3 className={styles.sidebarTitle}>Overview</h3>
            <div className={styles.overviewList}>
              <div className={styles.overviewItem}>
                <div className={styles.overviewIcon}>
                  <Ticket size={14} />
                </div>
                <div>
                  <p className={styles.overviewLabel}>Vouchers Issued</p>
                  <p className={styles.overviewVal}>
                    {campaign.vouchersIssued} / {campaign.totalVouchersLimit}
                  </p>
                </div>
              </div>
              <div className={styles.overviewItem}>
                <div className={styles.overviewIcon}>
                  <Users size={14} />
                </div>
                <div>
                  <p className={styles.overviewLabel}>Participants</p>
                  <p className={styles.overviewVal}>{participants}</p>
                </div>
              </div>
              <div className={styles.overviewItem}>
                <div className={styles.overviewIcon}>
                  <MapPin size={14} />
                </div>
                <div>
                  <p className={styles.overviewLabel}>Branches</p>
                  <p className={styles.overviewVal}>
                    {uniqueBranches.length || "All"}
                  </p>
                </div>
              </div>
              <div className={styles.overviewItem}>
                <div className={styles.overviewIcon}>
                  <Clock size={14} />
                </div>
                <div>
                  <p className={styles.overviewLabel}>Days Left</p>
                  <p className={styles.overviewVal}>{daysLeft}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Close Campaign Confirmation Modal */}
      {showCloseModal && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCloseModal(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="close-modal-title"
        >
          <div className={styles.modal}>
            {/* Close button */}
            <button
              className={styles.modalCloseBtn}
              onClick={() => setShowCloseModal(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className={styles.modalIconWrap}>
              <div className={styles.modalIconRing}>
                <AlertTriangle size={32} className={styles.modalAlertIcon} />
              </div>
            </div>

            {/* Content */}
            <div className={styles.modalContent}>
              <h2 id="close-modal-title" className={styles.modalTitle}>
                Close Campaign?
              </h2>
              <p className={styles.modalDesc}>
                Are you sure you want to close the campaign{" "}
                <strong className={styles.modalHighlight}>
                  &quot;{campaign.name}&quot;
                </strong>
                ? Once closed, customers will no longer be able to redeem
                vouchers. This action cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setShowCloseModal(false)}
                disabled={statusChanging}
              >
                Keep Campaign Open
              </button>
              <button
                className={styles.modalConfirmBtn}
                onClick={handleCloseCampaign}
                disabled={statusChanging}
              >
                {statusChanging ? "Closing..." : "Close Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isExportModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsExportModalOpen(false);
          }}
        >
          <div className={styles.modal}>
            <button
              className={styles.modalCloseBtn}
              onClick={() => setIsExportModalOpen(false)}
            >
              ✕
            </button>

            <h2>Export Vouchers</h2>

            <form onSubmit={handleExport}>
              <div className={styles.fieldGroup}>
                <label>Email</label>
                <input
                  type="email"
                  className={styles.fieldInput}
                  value={exportEmail}
                  onChange={(e) => setExportEmail(e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Format</label>
                <select
                  className={styles.fieldInput}
                  value={exportFormat}
                  onChange={(e) =>
                    setExportFormat(e.target.value as "EXCEL" | "PDF")
                  }
                >
                  <option value="EXCEL">EXCEL</option>
                  <option value="PDF">PDF</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button
                className={styles.secondaryBtn}
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                >
                  Cancel
                </button>

                <button type="submit" className={styles.primaryBtn}>
                  {isExporting ? "Requesting..." : "Submit Export"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LuckyDrawViewPage;
