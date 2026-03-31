"use client";

import { useEffect, useRef } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";
import styles from "./DeleteConfirmModal.module.css";

interface Props {
  isOpen: boolean;
  productName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal = ({
  isOpen,
  productName,
  isDeleting,
  onConfirm,
  onCancel,
}: Props) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Trap focus & keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    // Auto-focus the cancel button (safer default)
    confirmBtnRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  // Prevent body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className={`${styles.modal} ${isOpen ? styles.modalEnter : ""}`}>
        {/* Close button */}
        <button
          className={styles.closeBtn}
          onClick={onCancel}
          aria-label="Close"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className={styles.iconWrap}>
          <div className={styles.iconRing}>
            <AlertTriangle size={26} className={styles.alertIcon} />
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h2 id="delete-modal-title" className={styles.title}>
            Delete Product?
          </h2>
          <p className={styles.desc}>
            You are about to permanently delete{" "}
            <strong className={styles.productNameHighlight}>
              "{productName}"
            </strong>
            . This action cannot be undone and will remove all associated
            variants, images, and data.
          </p>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            className={styles.deleteBtn}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className={styles.spinner} />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={15} />
                Delete Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
