"use client";

import styles from "./contact.module.css";
import {
  Plus,
  Calendar,
  Eye,
  X,
  Mail,
  User,
  MessageSquare,
  Tag,
  Clock,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getContacts, createContact } from "@/services/contact.service";
import type { ContactEntry, CreateContactPayload } from "@/types/contact";

/* ─── Status helpers ─────────────────────────── */
const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const STATUS_CSS: Record<string, string> = {
  NEW: "statusNew",
  IN_PROGRESS: "statusInProgress",
  RESOLVED: "statusResolved",
  CLOSED: "statusClosed",
};

const TABS = ["all", "NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

const emptyForm: CreateContactPayload = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

/* ─── Component ─────────────────────────────── */
const ContactPage = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [contacts, setContacts] = useState<ContactEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  /* Detail drawer */
  const [selected, setSelected] = useState<ContactEntry | null>(null);

  /* Add modal */
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateContactPayload>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  /* Fetch */
  const fetchContacts = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await getContacts(page);
      setContacts(response.data || []);
      setTotalPages(response.meta.totalPages);
      setCurrentPage(response.meta.page);
      setTotal(response.meta.total);
    } catch (err) {
      console.error(err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(1);
  }, []);

  /* Close on backdrop click */
  const handleBackdropClick = (
    e: React.MouseEvent,
    ref: React.RefObject<HTMLDivElement | null>,
    closer: () => void,
  ) => {
    if (ref.current && !ref.current.contains(e.target as Node)) closer();
  };

  /* Filtered list */
  const filtered = contacts.filter((c) =>
    activeTab === "all" ? true : c.status === activeTab,
  );

  /* Stats - from current page data */
  const pageNewCount = contacts.filter((c) => c.status === "NEW").length;
  const pageResolvedCount = contacts.filter(
    (c) => c.status === "RESOLVED",
  ).length;

  /* Form helpers */
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError(null);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.subject || !form.message) {
      setFormError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await createContact(form);
      setFormSuccess(res.message);
      setForm(emptyForm);
      /* refresh list - fetch first page */
      await fetchContacts(1);
      setTimeout(() => {
        setShowModal(false);
        setFormSuccess(null);
      }, 1800);
    } catch (err: any) {
      setFormError(err.message ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  /* ── Render ───────────────────────────────── */
  return (
    <div className={styles.container}>
      {/* ── Stats ── */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p>Total Inquiries</p>
          <h2>{total}</h2>
        </div>
        <div className={styles.statCard}>
          <p>New</p>
          <h2>{pageNewCount}</h2>
        </div>
        <div className={styles.statCard}>
          <p>Resolved</p>
          <h2>{pageResolvedCount}</h2>
        </div>
      </section>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div>
          <h1>Contact Us</h1>
          <p>Manage customer inquiries &amp; messages</p>
        </div>
        <button
          className={styles.btnPrimary}
          onClick={() => {
            setForm(emptyForm);
            setFormError(null);
            setFormSuccess(null);
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Add Inquiry
        </button>
      </header>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "all" ? "ALL" : STATUS_LABELS[tab].toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <colgroup>
            <col className={styles.colName} />
            <col className={styles.colEmail} />
            <col className={styles.colSubject} />
            <col className={styles.colStatus} />
            <col className={styles.colDate} />
            <col className={styles.colActions} />
          </colgroup>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Received</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.emptyState}>
                  No inquiries found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  {/* Name */}
                  <td data-label="Name">
                    <div className={styles.nameCell}>
                      <div className={styles.avatar}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={styles.nameText}>{c.name}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td data-label="Email">
                    <span className={styles.emailText}>{c.email}</span>
                  </td>

                  {/* Subject */}
                  <td data-label="Subject">
                    <span className={styles.subjectText}>{c.subject}</span>
                  </td>

                  {/* Status */}
                  <td data-label="Status">
                    <span
                      className={`${styles.status} ${styles[STATUS_CSS[c.status] ?? "statusNew"]}`}
                    >
                      {STATUS_LABELS[c.status] ?? c.status}
                    </span>
                  </td>

                  {/* Date */}
                  <td data-label="Received">
                    <div className={styles.dateCell}>
                      <Calendar size={13} />
                      {formatDate(c.createdAt)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td data-label="Actions">
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        title="View Details"
                        onClick={() => setSelected(c)}
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => fetchContacts(currentPage - 1)}
            className={styles.paginationBtn}
          >
            ← Previous
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => fetchContacts(currentPage + 1)}
            className={styles.paginationBtn}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Detail Drawer ── */}
      {selected && (
        <div
          className={styles.drawerOverlay}
          onClick={(e) =>
            handleBackdropClick(e, drawerRef, () => setSelected(null))
          }
        >
          <div className={styles.drawer} ref={drawerRef}>
            {/* Drawer Header */}
            <div className={styles.drawerHeader}>
              <div className={styles.drawerTitle}>
                <MessageSquare size={18} />
                Inquiry Details
              </div>
              <button
                className={styles.drawerClose}
                onClick={() => setSelected(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className={styles.drawerBody}>
              {/* Avatar + name block */}
              <div className={styles.drawerProfile}>
                <div className={styles.drawerAvatar}>
                  {selected.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className={styles.drawerName}>{selected.name}</div>
                  <div className={styles.drawerEmail}>{selected.email}</div>
                </div>
                <span
                  className={`${styles.status} ${styles[STATUS_CSS[selected.status] ?? "statusNew"]} ${styles.drawerStatusBadge}`}
                >
                  {STATUS_LABELS[selected.status] ?? selected.status}
                </span>
              </div>

              <div className={styles.drawerDivider} />

              {/* Meta fields */}
              <div className={styles.drawerMeta}>
                <div className={styles.drawerMetaItem}>
                  <span className={styles.drawerMetaIcon}>
                    <Tag size={14} />
                  </span>
                  <div>
                    <span className={styles.drawerMetaLabel}>Subject</span>
                    <span className={styles.drawerMetaValue}>
                      {selected.subject}
                    </span>
                  </div>
                </div>

                <div className={styles.drawerMetaItem}>
                  <span className={styles.drawerMetaIcon}>
                    <Mail size={14} />
                  </span>
                  <div>
                    <span className={styles.drawerMetaLabel}>Email</span>
                    <span className={styles.drawerMetaValue}>
                      {selected.email}
                    </span>
                  </div>
                </div>

                <div className={styles.drawerMetaItem}>
                  <span className={styles.drawerMetaIcon}>
                    <Clock size={14} />
                  </span>
                  <div>
                    <span className={styles.drawerMetaLabel}>Received</span>
                    <span className={styles.drawerMetaValue}>
                      {formatDateTime(selected.createdAt)}
                    </span>
                  </div>
                </div>

                <div className={styles.drawerMetaItem}>
                  <span className={styles.drawerMetaIcon}>
                    <User size={14} />
                  </span>
                  <div>
                    <span className={styles.drawerMetaLabel}>Inquiry #</span>
                    <span className={styles.drawerMetaValue}>
                      #{selected.id}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.drawerDivider} />

              {/* Message */}
              <div className={styles.drawerMessageSection}>
                <div className={styles.drawerMessageLabel}>
                  <MessageSquare size={14} />
                  Message
                </div>
                <div className={styles.drawerMessageBody}>
                  {selected.message}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Modal ── */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={(e) =>
            handleBackdropClick(e, modalRef, () => setShowModal(false))
          }
        >
          <div className={styles.modal} ref={modalRef}>
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <Plus size={18} />
                New Inquiry
              </div>
              <button
                className={styles.drawerClose}
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className={styles.modalBody}>
              {formSuccess ? (
                <div className={styles.successMsg}>{formSuccess}</div>
              ) : (
                <>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Name</label>
                      <input
                        className={styles.formInput}
                        name="name"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Email</label>
                      <input
                        className={styles.formInput}
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Subject</label>
                    <input
                      className={styles.formInput}
                      name="subject"
                      placeholder="Issue with my order"
                      value={form.subject}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Message</label>
                    <textarea
                      className={`${styles.formInput} ${styles.formTextarea}`}
                      name="message"
                      placeholder="Describe your issue…"
                      value={form.message}
                      onChange={handleFormChange}
                      rows={5}
                    />
                  </div>

                  {formError && (
                    <div className={styles.errorMsg}>{formError}</div>
                  )}

                  <div className={styles.modalActions}>
                    <button
                      className={styles.btnSecondary}
                      onClick={() => setShowModal(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.btnPrimary}
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? "Submitting…" : "Submit Inquiry"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactPage;
