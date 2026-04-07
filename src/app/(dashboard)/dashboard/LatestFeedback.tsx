"use client";

import styles from "./dashboard.module.css";
import { Star } from "lucide-react";
import type { Feedback } from "@/types/dashboard";

interface LatestFeedbackProps {
  data: Feedback[];
  loading?: boolean;
}

const Stars = ({ count }: { count: number }) => (
  <div className={styles.stars}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={12}
        className={i < count ? styles.starFilled : styles.starEmpty}
        fill={i < count ? "#f59e0b" : "none"}
      />
    ))}
  </div>
);

const LatestFeedback = ({ data, loading = false }: LatestFeedbackProps) => (
  <div className={styles.feedbackCard}>
    <div className={styles.feedbackHeader}>
      <h2 className={styles.sectionTitle}>Latest Feedback</h2>
      <span className={styles.feedbackBadge}>Real-time NPS</span>
    </div>

    {loading ? (
      <div className={styles.feedbackList}>
        <p className={styles.loadingText}>Loading feedback...</p>
      </div>
    ) : data && data.length > 0 ? (
      <div className={styles.feedbackList}>
        {data.map((fb) => (
          <div key={fb.id} className={styles.feedbackItem}>
            <div className={styles.feedbackTop}>
              <Stars count={fb.stars} />
              <span className={styles.feedbackTime}>{fb.timeAgo}</span>
            </div>
            <p className={styles.feedbackProduct}>{fb.productName}</p>
            <p className={styles.feedbackReview}>"{fb.feedback}"</p>
          </div>
        ))}
      </div>
    ) : (
      <div className={styles.feedbackList}>
        <p className={styles.loadingText}>No feedback found</p>
      </div>
    )}
  </div>
);

export default LatestFeedback;
