"use client";

import React, { useEffect, useState, useRef } from "react";
import styles from "./category.module.css";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "@/services/category.service";
import { Category } from "@/types/category";
import { useToast } from "@/components/toast/ToastProvider";
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  ImageIcon,
} from "lucide-react";

type ModalMode = "create" | "edit";

export default function CategoryPage() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  /* Modal */
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editTarget, setEditTarget] = useState<Category | null>(null);

  /* Form fields */
  const [categoryName, setCategoryName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Delete modal */
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);

  /* ── Fetch ── */
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ── Open Modals ── */
  const openCreateModal = () => {
    setModalMode("create");
    setCategoryName("");
    setImageFile(null);
    setImagePreview(null);
    setEditTarget(null);
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setModalMode("edit");
    setEditTarget(cat);
    setCategoryName(cat.name);
    setImageFile(null);
    setImagePreview(cat.image ?? null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCategoryName("");
    setImageFile(null);
    setImagePreview(null);
    setEditTarget(null);
  };

  /* ── Image Handling ── */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      return showToast("Enter category name", "error");
    }

    try {
      setSubmitting(true);

      if (modalMode === "create") {
        const created = await createCategory(
          categoryName,
          imageFile ?? undefined,
        );
        setCategories((prev) => [...prev, created]);
        showToast("Category created successfully", "success");
      } else if (editTarget) {
        const updated = await updateCategory(
          editTarget.id,
          categoryName,
          imageFile ?? undefined,
        );
        setCategories((prev) =>
          prev.map((c) => (c.id === editTarget.id ? updated : c)),
        );
        showToast("Category updated successfully", "success");
      }

      closeModal();
    } catch (err) {
      console.error(err);
      showToast(
        modalMode === "create"
          ? "Failed to create category"
          : "Failed to update category",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Delete ── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteCategory(deleteTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Category deleted", "success");
    } catch (err: any) {
      setDeleteError(err.message ?? "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  /* ── Render ── */
  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1>Store Categories</h1>
          <p>Organize your inventory with high-level classifications</p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreateModal}>
          <Plus size={18} /> Create Category
        </button>
      </header>

      {/* ── Stats ── */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p>Total Categories</p>
          <h2>{loading ? "—" : categories.length}</h2>
        </div>
      </section>

      {/* ── Grid ── */}
      {loading ? (
        <div className={styles.loadingState}>Loading categories…</div>
      ) : categories.length === 0 ? (
        <div className={styles.emptyState}>
          <ImageIcon size={40} className={styles.emptyIcon} />
          <p>No categories yet. Create your first one!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {categories.map((cat) => (
            <div key={cat.id} className={styles.card}>
              {/* Background image */}
              {cat.image && (
                <img src={cat.image} alt={cat.name} className={styles.cardBg} />
              )}
              <div className={styles.cardOverlay} />
              <div className={styles.cardContent}>
                <span className={styles.cardName}>{cat.name}</span>
                <span className={styles.cardId}>ID: {cat.id}</span>
              </div>
              {/* Action buttons */}
              <div className={styles.cardActions}>
                <button
                  className={styles.cardActionBtn}
                  title="Edit"
                  onClick={() => openEditModal(cat)}
                >
                  <Pencil size={14} />
                </button>
                <button
                  className={`${styles.cardActionBtn} ${styles.danger}`}
                  title="Delete"
                  onClick={() => {
                    setDeleteError(null);
                    setDeleteTarget(cat);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
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
          <div className={styles.modal} ref={modalRef}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                {modalMode === "create" ? (
                  <Plus size={17} />
                ) : (
                  <Pencil size={17} />
                )}
                {modalMode === "create" ? "Create Category" : "Edit Category"}
              </div>
              <button className={styles.drawerClose} onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className={styles.modalBody}>
              {/* Name */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Shoes, Electronics…"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              {/* Image */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Category Image</label>
                <div
                  className={styles.imageUploadArea}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <div className={styles.imagePreviewWrap}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className={styles.imagePreview}
                      />
                      <button
                        className={styles.clearImageBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <ImageIcon size={28} />
                      <span>Click to upload image</span>
                      <span className={styles.imageHint}>
                        PNG, JPG, WEBP up to 5MB
                      </span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenInput}
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button
                className={styles.btnSecondary}
                onClick={closeModal}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? modalMode === "create"
                    ? "Creating…"
                    : "Saving…"
                  : modalMode === "create"
                    ? "Create"
                    : "Save Changes"}
              </button>
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
              deleteModalRef.current &&
              !deleteModalRef.current.contains(e.target as Node)
            )
              setDeleteTarget(null);
          }}
        >
          <div className={styles.modal} ref={deleteModalRef}>
            <div className={styles.modalHeader}>
              <div className={`${styles.modalTitle} ${styles.dangerTitle}`}>
                <AlertTriangle size={17} />
                Delete Category
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
                <strong>{deleteTarget.name}</strong>? This action cannot be
                undone.
              </p>
              {deleteError && (
                <div className={styles.errorMsg}>{deleteError}</div>
              )}
            </div>
            <div className={styles.modalFooter}>
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
      )}
    </div>
  );
}
