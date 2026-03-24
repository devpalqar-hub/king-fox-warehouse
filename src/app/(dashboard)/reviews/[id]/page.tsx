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

      <div className={styles.card}>
        {/* Header */}
        <div className={styles.cardHeader}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {getInitials(data.customer?.name || "U")}
            </div>

            <div>
              <h3 className={styles.title}>{data.title}</h3>
              <p className={styles.customerName}>{data.customer?.name}</p>
              <p className={styles.customerEmail}>{data.customer?.email}</p>
            </div>
          </div>

          <div className={styles.rating}>
            <span className={styles.stars}>{renderStars(data.rating)}</span>
            <span className={styles.ratingNumber}>{data.rating}/5</span>
          </div>
        </div>

        {/* Product Info */}
        <div className={styles.productBox}>
          <p className={styles.productLabel}>Product</p>
          <h4>{data.product?.name}</h4>
        </div>

        {/* Review Body */}
        <div className={styles.section}>
          <p className={styles.body}>{data.body}</p>
        </div>

        {/* Images */}
        {data.images && data.images.length > 0 && (
          <div className={styles.imageGrid}>
            {data.images.map((img: string, i: number) => (
              <img key={i} src={img} className={styles.image} />
            ))}
          </div>
        )}

        {/* Meta Info */}
        <div className={styles.meta}>
          <p>
            <strong>Phone:</strong> {data.customer?.phone}
          </p>
          <p>
            <strong>Created:</strong>{" "}
            {new Date(data.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Mock Review:</strong> {data.isMocked ? "Yes" : "No"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailsPage;
