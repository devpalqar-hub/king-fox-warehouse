"use client";

import styles from "./dashboard.module.css";
import { Star } from "lucide-react";

// Mock data — replace with API
const MOCK_FEEDBACK = [
  {
    id: 1,
    product: "Premium Cotton T-Shirt",
    rating: 5,
    review:
      "The fit is perfect and the quality of the fabric exceeded expectations!",
    time: "2 mins ago",
  },
  {
    id: 2,
    product: "Slim Fit Denim",
    rating: 4,
    review: "Good quality, but shipping took a day longer than promised.",
    time: "1 hour ago",
  },
  {
    id: 3,
    product: "Silk Ethnic Saree",
    rating: 5,
    review: "Absolutely stunning craftsmanship. Will definitely order again!",
    time: "4 hours ago",
  },
];

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

const LatestFeedback = () => (
  <div className={styles.feedbackCard}>
    <div className={styles.feedbackHeader}>
      <h2 className={styles.sectionTitle}>Latest Feedback</h2>
      <span className={styles.feedbackBadge}>Real-time NPS</span>
    </div>

    <div className={styles.feedbackList}>
      {MOCK_FEEDBACK.map((fb) => (
        <div key={fb.id} className={styles.feedbackItem}>
          <div className={styles.feedbackTop}>
            <Stars count={fb.rating} />
            <span className={styles.feedbackTime}>{fb.time}</span>
          </div>
          <p className={styles.feedbackProduct}>{fb.product}</p>
          <p className={styles.feedbackReview}>"{fb.review}"</p>
        </div>
      ))}
    </div>
  </div>
);

export default LatestFeedback;
