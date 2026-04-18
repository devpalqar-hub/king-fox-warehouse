"use client";

import styles from "./banner.module.css";
import {
  Plus,
  Pencil,
  Trash2,
  ImageIcon,
  Video,
  Link2,
  Calendar,
  AlertTriangle,
  X,
  Image,
  UploadCloud,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "@/services/banner.service";
import {
  uploadSingleImageToS3,
  uploadVideoToS3,
  deleteMediaFromS3,
} from "@/services/upload.service";
import type { Banner } from "@/types/banner.types";

/* ── Helpers ────────────────────────────────── */
const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/* ── Empty Banner Form ──────────────────────── */
const emptyForm = {
  title: "",
  redirectLink: "",
  order: 1,
  mediaUrl: "",
};

/* ── Component ──────────────────────────────── */
const BannerListPage = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  /* Modal state */
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm);

  /* Upload state */
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Save state */
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  /* Delete modal */
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  /* ── Fetch ─────────────────────────────────── */
  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBanners();
      setBanners(res.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (err) {
      console.error(err);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  /* ── Open Modals ───────────────────────────── */
  const openCreate = () => {
    setForm(emptyForm);
    setLocalFile(null);
    setLocalPreview(null);
    setFormError(null);
    setEditTarget(null);
    setModalMode("create");
  };

  const openEdit = (banner: Banner) => {
    setForm({
      title: banner.title,
      redirectLink: banner.redirectLink,
      order: banner.displayOrder,
      mediaUrl: banner.mediaUrl,
    });
    setLocalFile(null);
    setLocalPreview(null);
    setFormError(null);
    setEditTarget(banner);
    setModalMode("edit");
  };

  const closeModal = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setModalMode(null);
    setEditTarget(null);
    setLocalFile(null);
    setLocalPreview(null);
    setFormError(null);
  };

  /* ── File Handling ─────────────────────────── */
  const handleFileSelect = (file: File) => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalFile(file);
    setLocalPreview(URL.createObjectURL(file));
    setForm((f) => ({ ...f, mediaUrl: "" }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const clearMedia = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalFile(null);
    setLocalPreview(null);
    setForm((f) => ({ ...f, mediaUrl: "" }));
  };

  /* ── Save ──────────────────────────────────── */
  const handleSave = async () => {
    setFormError(null);

    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!localFile && !form.mediaUrl.trim()) {
      setFormError("Please upload a media file or enter a media URL.");
      return;
    }

    setSaving(true);
    try {
      let mediaUrl = form.mediaUrl;

      /* Upload new file if selected */
      if (localFile) {
        setUploading(true);
        const isVid = localFile.type.startsWith("video/");
        mediaUrl = isVid
          ? await uploadVideoToS3(localFile)
          : await uploadSingleImageToS3(localFile);
        setUploading(false);
      }

      const payload = {
        title: form.title.trim(),
        mediaUrl,
        order: Number(form.order),
        redirectLink: form.redirectLink.trim(),
      };

      if (modalMode === "create") {
        await createBanner(payload);
      } else if (editTarget) {
        await updateBanner(editTarget.id, payload);
      }

      closeModal();
      fetchBanners();
    } catch (err: any) {
      setUploading(false);
      setFormError(err.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ────────────────────────────────── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteBanner(deleteTarget.id);
      /* Optionally delete from S3 too */
      try {
        await deleteMediaFromS3(deleteTarget.mediaUrl);
      } catch {
        /* Non-blocking */
      }
      setDeleteTarget(null);
      fetchBanners();
    } catch (err: any) {
      setDeleteError(err.message ?? "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  /* ── Stats ─────────────────────────────────── */
  const imageCount = banners.filter((b) => !isVideo(b.mediaUrl)).length;
  const videoCount = banners.filter((b) => isVideo(b.mediaUrl)).length;

  /* Media preview (in modal) */
  const previewSrc = localPreview || form.mediaUrl;
  const previewIsVideo = localFile
    ? localFile.type.startsWith("video/")
    : isVideo(previewSrc);

  /* ── Render ────────────────────────────────── */
  return (
    <div className={styles.container}>
      {/* ── Stats ── */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p>Total Banners</p>
          <h2>{banners.length}</h2>
        </div>
        <div className={styles.statCard}>
          <p>Images</p>
          <h2>{imageCount}</h2>
        </div>
        <div className={styles.statCard}>
          <p>Videos</p>
          <h2>{videoCount}</h2>
        </div>
      </section>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div>
          <h1>Banners</h1>
          <p>Manage homepage banners &amp; promotional media</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>
          <Plus size={18} /> Add Banner
        </button>
      </header>

      {/* ── Grid ── */}
      {loading ? (
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonMedia} />
              <div className={styles.skeletonBody}>
                <div className={styles.skeletonLine} style={{ width: "70%" }} />
                <div className={styles.skeletonLine} style={{ width: "45%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className={styles.emptyState}>
          <Image size={48} className={styles.emptyIcon} />
          <p>No banners yet. Add your first banner!</p>
        </div>
      ) : (
        <div className={styles.bannerGrid}>
          {banners.map((b) => {
            const vid = isVideo(b.mediaUrl);
            return (
              <div key={b.id} className={styles.bannerCard}>
                {/* Media */}
                <div className={styles.mediaWrapper}>
                  {vid ? (
                    <video
                      className={styles.bannerVideo}
                      src={b.mediaUrl}
                      muted
                      loop
                      playsInline
                      onMouseEnter={(e) =>
                        (e.currentTarget as HTMLVideoElement).play()
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget as HTMLVideoElement).pause()
                      }
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={styles.bannerMedia}
                      src={b.mediaUrl}
                      alt={b.title}
                    />
                  )}
                  <span
                    className={`${styles.mediaBadge} ${vid ? styles.badgeVideo : styles.badgeImage}`}
                  >
                    {vid ? <Video size={10} /> : <ImageIcon size={10} />}
                    {vid ? "Video" : "Image"}
                  </span>
                  <span className={styles.orderBadge}>#{b.displayOrder}</span>
                </div>

                {/* Body */}
                <div className={styles.cardBody}>
                  <p className={styles.cardTitle}>{b.title}</p>
                  {b.redirectLink && (
                    <div className={styles.cardMeta}>
                      <Link2 size={12} />
                      <a href={b.redirectLink} target="_blank" rel="noreferrer">
                        {b.redirectLink}
                      </a>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className={styles.cardFooter}>
                  <div className={styles.dateCell}>
                    <Calendar size={12} />
                    {formatDate(b.createdAt)}
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      title="Edit"
                      onClick={() => openEdit(b)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.danger}`}
                      title="Delete"
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteTarget(b);
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {modalMode && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (
              modalRef.current &&
              !modalRef.current.contains(e.target as Node)
            )
              closeModal();
          }}
        >
          <div
            className={`${styles.modal} ${styles.modalLarge}`}
            ref={modalRef}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                {modalMode === "create" ? (
                  <>
                    <Plus size={16} /> Add Banner
                  </>
                ) : (
                  <>
                    <Pencil size={16} /> Edit Banner
                  </>
                )}
              </div>
              <button className={styles.drawerClose} onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Title */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Title *</label>
                <input
                  className={styles.formInput}
                  placeholder="e.g. Summer Sale Banner"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
              </div>

              {/* Display Order */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Display Order</label>
                <input
                  className={styles.formInput}
                  type="number"
                  min={1}
                  value={form.order}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, order: Number(e.target.value) }))
                  }
                />
              </div>

              {/* Redirect Link */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Redirect Link</label>
                <input
                  className={styles.formInput}
                  placeholder="e.g. /products?campaign=summer"
                  value={form.redirectLink}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, redirectLink: e.target.value }))
                  }
                />
              </div>

              {/* Media Upload */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Media (Image / Video) *
                </label>

                {previewSrc ? (
                  <div className={styles.uploadPreview}>
                    {previewIsVideo ? (
                      <video src={previewSrc} controls muted />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewSrc} alt="preview" />
                    )}
                    <button className={styles.clearMedia} onClick={clearMedia}>
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <UploadCloud size={28} className={styles.uploadIcon} />
                    <p>Click or drag &amp; drop to upload</p>
                    <span>Supports: JPG, PNG, WebP, GIF, MP4, WebM, MOV</span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  className={styles.hiddenInput}
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                    e.target.value = "";
                  }}
                />

                {/* OR paste URL */}
                {!localFile && (
                  <input
                    className={styles.formInput}
                    placeholder="…or paste a media URL"
                    value={form.mediaUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, mediaUrl: e.target.value }))
                    }
                    style={{ marginTop: 8 }}
                  />
                )}

                {/* Upload progress indicator */}
                {uploading && (
                  <div className={styles.uploadProgress}>
                    <span>Uploading…</span>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: "70%" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {formError && <div className={styles.errorMsg}>{formError}</div>}

              <div className={styles.modalActions}>
                <button
                  className={styles.btnSecondary}
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? uploading
                      ? "Uploading…"
                      : "Saving…"
                    : modalMode === "create"
                      ? "Create Banner"
                      : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (
              modalRef.current &&
              !modalRef.current.contains(e.target as Node)
            )
              setDeleteTarget(null);
          }}
        >
          <div className={styles.modal} ref={modalRef}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleDanger}>
                <AlertTriangle size={18} />
                Delete Banner
              </div>
              <button
                className={styles.drawerClose}
                onClick={() => setDeleteTarget(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.deleteMsg}>
                Are you sure you want to delete{" "}
                <strong>{deleteTarget.title}</strong>? This action cannot be
                undone.
              </p>
              {deleteError && (
                <div className={styles.errorMsg}>{deleteError}</div>
              )}
              <div className={styles.modalActions}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  className={styles.btnDanger}
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerListPage;
