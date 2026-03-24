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
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCampaignById } from "@/services/luckydraw.service";

const LuckyDrawViewPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
  const uniqueBranches = campaign.branches?.length
    ? campaign.branches
    : Array.from(
        new Map(
          (campaign.vouchers ?? [])
            .map((v: any) => v.branch)
            .filter(Boolean)
            .map((b: any) => [b.id, b]),
        ).values(),
      );

  return (
    <div className={styles.container}>
      {/* Back nav */}
      <button className={styles.backBtn} onClick={() => router.back()}>
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
                  (uniqueBranches as any[]).map((b: any) => (
                    <span key={b.id} className={styles.branchTag}>
                      {b.name.toUpperCase()}
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
                    campaign.vouchers.map((v: any) => (
                      <tr key={v.id}>
                        <td>
                          <span className={styles.voucherCode}>
                            {v.voucherCode}
                          </span>
                        </td>
                        <td>
                          <div className={styles.customerCell}>
                            <div className={styles.avatar}>
                              {v.customer?.name?.charAt(0) ?? "?"}
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
                            {new Date(v.issuedAt).toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
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
                    ))
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

            <button className={styles.btnExport}>
              <Download size={15} />
              Export Report
            </button>

            <Link href={`/luckydraw/${id}/edit`} className={styles.btnEdit}>
              <Pencil size={15} />
              Edit Campaign
            </Link>

            <button className={styles.btnEnd}>
              <StopCircle size={15} />
              End Campaign
            </button>
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
    </div>
  );
};

export default LuckyDrawViewPage;
