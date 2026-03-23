"use client";

import styles from "./reviewDetails.module.css";
import containerStyles from "../reviews.module.css";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProductReviews } from "@/services/review.service";
import BackButton from "@/components/backButton/backButton";

const ReviewDetailsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProductReviews(id as string);
        setData(res);
      } catch (err) {
        console.error(err);
      }
    };

    if (id) fetchData();
  }, [id]);

  const renderStars = (count: number) => "★".repeat(count);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div className={containerStyles.container}>
        <BackButton />
      {/* Breadcrumb */}
      <p className={styles.breadcrumb}>
        Reviews • <span>Review Details</span>
      </p>

      {/* Title */}
      <h1 className={styles.title}>Review Details</h1>

      {/* Cards */}
      {data.reviews.map((r: any) => (
        <div key={r.id} className={styles.card}>
          {/* Header */}
          <div className={styles.cardHeader}>
            <div className={styles.userInfo}>
              <div className={styles.avatar}>
                {getInitials(r.customer.name)}
              </div>

              <div>
                <div className={styles.name}>{r.customer.name}</div>
                <div className={styles.meta}>
                  <span className={styles.verifiedBadge}>✓ Verified</span>
                  <span className={styles.metaDot} />
                  {new Date(r.createdAt).toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className={styles.ratingBlock}>
              <div className={styles.starsRow}>
                <span className={styles.stars}>{renderStars(r.rating)}</span>
                <span className={styles.ratingNumber}>{r.rating}.0</span>
              </div>
              <div className={styles.titleLabel}>{r.title}</div>
            </div>
          </div>

          {/* Body */}
          <p className={styles.body}>{r.body}</p>

          {/* Images */}
          {r.images?.length > 0 && (
            <div className={styles.imageGrid}>
              {r.images.map((img: string, i: number) => (
                <img key={i} src={img} alt="review" className={styles.image} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewDetailsPage;
