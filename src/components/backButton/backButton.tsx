"use client";

import { FaArrowLeft } from "react-icons/fa";
import styles from "./backButton.module.css";

interface BackButtonProps {
  label?: string;
  className?: string;
}

export default function BackButton({
  label = "Back",
  className = "",
}: BackButtonProps) {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <button
      type="button"
      className={`${styles.backLink} ${className}`}
      onClick={handleBack}
    >
      <FaArrowLeft className={styles.icon} />
      {label}
    </button>
  );
}