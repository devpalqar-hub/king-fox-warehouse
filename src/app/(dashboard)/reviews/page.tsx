"use client";

import styles from "./reviews.module.css";
import { Eye, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getReviews } from "@/services/review.service";
import { Review } from "@/types/review";

const ReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [page, setPage] = useState(1);

  const [productName, setProductName] = useState("");
  const [rating, setRating] = useState<number | undefined>();

  const fetchReviews = async () => {
    try {
      const res = await getReviews(productName, rating, page);
      setReviews(res.data);
      setSummary(res.summary);
    } catch (err) {
      console.error(err);
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const handleFilter = () => {
    setPage(1);
    fetchReviews();
  };

  const renderStars = (count: number) => {
    return "★".repeat(count);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1>Product Reviews</h1>
          <p>Manage customer feedback and monitor satisfaction</p>
        </div>

        <Link href="/reviews/create" className={styles.btnPrimary}>
          <Plus size={18} /> Add Mock Review
        </Link>
      </header>

      {/* Stats */}
      {summary && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h2>{summary.averageRating.toFixed(1)}</h2>
            <p>Average Rating</p>
          </div>

          <div className={styles.statCard}>
            <h2>{summary.total}</h2>
            <p>Total Reviews</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={styles.filterInput}
          placeholder="Search product..."
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />

        <select
          className={styles.filterSelect}
          onChange={(e) => setRating(Number(e.target.value) || undefined)}
        >
          <option value="">All Ratings</option>
          <option value="5">5 ★</option>
          <option value="4">4 ★</option>
          <option value="3">3 ★</option>
          <option value="2">2 ★</option>
          <option value="1">1 ★</option>
        </select>

        <button className={styles.btnFilter} onClick={handleFilter}>
          Apply Filters
        </button>
      </div>

      {/* Table */}
      <section className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>PRODUCT</th>
              <th>REVIEWER</th>
              <th>RATING</th>
              <th>REVIEW</th>
              <th>DATE</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className={styles.codeCell}>
                    <span className={styles.code}>{r.product.name}</span>
                  </div>
                </td>

                <td>{r.customer.name}</td>

                <td className={styles.stars}>{renderStars(r.rating)}</td>

                <td>{r.body}</td>

                <td>{new Date(r.createdAt).toLocaleDateString("en-IN")}</td>

                <td>
                  <Link href={`/reviews/${r.id}`}><Eye size={16} className={styles.eye}/></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className={styles.pagination}>
          <span>Page {page}</span>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className={styles.btnPage}
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>

            <button
              className={styles.btnPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next 
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReviewsPage;
