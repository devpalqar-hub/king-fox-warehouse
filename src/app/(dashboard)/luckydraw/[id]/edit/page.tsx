"use client";

import styles from "./luckydraw-edit.module.css";
import { ArrowLeft, Save, Calendar, FileText, Hash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCampaignById } from "@/services/luckydraw.service";

const LuckyDrawEditPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    totalVouchersLimit: "",
    status: "DRAFT",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCampaignById(id as string);
        setForm({
          name: res.name ?? "",
          description: res.description ?? "",
          startDate: res.startDate ? res.startDate.split("T")[0] : "",
          endDate: res.endDate ? res.endDate.split("T")[0] : "",
          totalVouchersLimit: String(res.totalVouchersLimit ?? ""),
          status: res.status ?? "DRAFT",
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // TODO: wire up update API when available
    // await updateCampaign(id, form);
    setTimeout(() => {
      setSaving(false);
      router.push(`/luckydraw/${id}`);
    }, 800);
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Loading campaign…</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Back nav */}
      <button className={styles.backBtn} onClick={() => router.back()}>
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Edit Campaign</h1>
          <p className={styles.pageSubtitle}>
            Update the details for this lucky draw campaign
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formLayout}>
          {/* ── Main form ──────────────────────── */}
          <div className={styles.mainCol}>
            {/* Basic Info */}
            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <FileText size={16} />
                <h2 className={styles.sectionTitle}>Basic Information</h2>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Campaign Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Summer Lucky Draw 2025"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the campaign…"
                  className={styles.textarea}
                  rows={4}
                />
              </div>
            </section>

            {/* Schedule */}
            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <Calendar size={16} />
                <h2 className={styles.sectionTitle}>Schedule</h2>
              </div>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Launch Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Closing Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Vouchers */}
            <section className={styles.card}>
              <div className={styles.sectionHeader}>
                <Hash size={16} />
                <h2 className={styles.sectionTitle}>Voucher Settings</h2>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Total Voucher Limit</label>
                <input
                  type="number"
                  name="totalVouchersLimit"
                  value={form.totalVouchersLimit}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  className={styles.input}
                  min={1}
                  required
                />
                <span className={styles.hint}>
                  Maximum number of vouchers that can be issued for this
                  campaign.
                </span>
              </div>
            </section>
          </div>

          {/* ── Sidebar ────────────────────────── */}
          <aside className={styles.sidebar}>
            <div className={styles.card}>
              <h3 className={styles.sidebarLabel}>Campaign Status</h3>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <div className={styles.statusPreview}>
                <span
                  className={`${styles.statusPill} ${styles[form.status.toLowerCase()]}`}
                >
                  {form.status.charAt(0) + form.status.slice(1).toLowerCase()}
                </span>
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.sidebarLabel}>Actions</h3>

              <button
                type="submit"
                className={styles.btnSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className={styles.btnSpinner} />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save Changes
                  </>
                )}
              </button>

              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => router.back()}
              >
                Discard
              </button>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
};

export default LuckyDrawEditPage;
