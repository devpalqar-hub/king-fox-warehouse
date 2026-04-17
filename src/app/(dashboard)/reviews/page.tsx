"use client";

import styles from "./reviews.module.css";
import { Eye, Plus, Star, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getReviews } from "@/services/review.service";
import { Review } from "@/types/review";

/* ── Star renderer ─────────────────────────────────────── */
const StarRating = ({ count }: { count: number }) => (
  <div className={styles.starRow}>
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={13}
        className={i < count ? styles.starFilled : styles.starEmpty}
        fill={i < count ? "#f59e0b" : "none"}
      />
    ))}
  </div>
);

/* ── Rating badge (compact, used in mobile cards) ──────── */
const RatingBadge = ({ count }: { count: number }) => (
  <span className={styles.ratingBadge}>
    {"★".repeat(count)}
    {"☆".repeat(5 - count)}
  </span>
);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleFilter();
  };

  return (
    <div className={styles.container}>
      {/* ── Header ─────────────────────────────────────── */}
      <header className={styles.header}>
        <div>
          <h1>Product Reviews</h1>
          <p>Manage customer feedback and monitor satisfaction</p>
        </div>
        <Link href="/reviews/create" className={styles.btnPrimary}>
          <Plus size={18} /> Add Mock Review
        </Link>
      </header>

      {/* ── Stats ──────────────────────────────────────── */}
      {summary && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconYellow}`}>
              <Star size={18} fill="#f59e0b" />
            </div>
            <div>
              <h2>{summary.averageRating.toFixed(1)}</h2>
              <p>Average Rating</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.iconBlue}`}>
              <Eye size={18} />
            </div>
            <div>
              <h2>{summary.total}</h2>
              <p>Total Reviews</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Filters ────────────────────────────────────── */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={14} className={styles.searchIcon} />
          <input
            className={styles.filterInput}
            placeholder="Search product…"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className={styles.selectWrap}>
          <select
            className={styles.filterSelect}
            value={rating ?? ""}
            onChange={(e) => setRating(Number(e.target.value) || undefined)}
          >
            <option value="">All Ratings</option>
            <option value="5">5 ★★★★★</option>
            <option value="4">4 ★★★★☆</option>
            <option value="3">3 ★★★☆☆</option>
            <option value="2">2 ★★☆☆☆</option>
            <option value="1">1 ★☆☆☆☆</option>
          </select>
        </div>

        <button className={styles.btnFilter} onClick={handleFilter}>
          Apply Filters
        </button>
      </div>

      {/* ── Table Wrapper ───────────────────────────────── */}
      <section className={styles.tableWrapper}>
        {/* Desktop table */}
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyRow}>
                    No reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className={styles.productName}>
                        {r.product.name}
                      </span>
                    </td>
                    <td>
                      <div className={styles.reviewerCell}>
                        <div className={styles.avatar}>
                          {r.customer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className={styles.reviewerName}>
                          {r.customer.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <StarRating count={r.rating} />
                    </td>
                    <td>
                      <span className={styles.reviewBody}>{r.body}</span>
                    </td>
                    <td className={styles.dateText}>
                      {new Date(r.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <Link
                        href={`/reviews/${r.id}`}
                        className={styles.actionBtn}
                        title="View"
                      >
                        <Eye size={15} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className={styles.mobileCardList}>
          {reviews.length === 0 ? (
            <div className={styles.emptyMobile}>No reviews found.</div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className={styles.mobileCard}>
                {/* Top: product name + action */}
                <div className={styles.mobileCardTop}>
                  <span className={styles.productName}>{r.product.name}</span>
                  <Link
                    href={`/reviews/${r.id}`}
                    className={styles.actionBtn}
                    title="View"
                  >
                    <Eye size={14} />
                  </Link>
                </div>

                {/* Reviewer row */}
                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}>Reviewer</span>
                  <div className={styles.reviewerCell}>
                    <div className={`${styles.avatar} ${styles.avatarSm}`}>
                      {r.customer.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className={styles.reviewerName}>
                      {r.customer.name}
                    </span>
                  </div>
                </div>

                {/* Rating row */}
                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}>Rating</span>
                  <StarRating count={r.rating} />
                </div>

                {/* Review body */}
                <p className={styles.mobileReviewBody}>"{r.body}"</p>

                {/* Date */}
                <div className={styles.mobileCardBottom}>
                  <span className={styles.dateText}>
                    {new Date(r.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            {reviews.length === 0 ? "No reviews" : `Page ${page}`}
          </span>
          <div className={styles.paginationBtns}>
            <button
              className={styles.btnPage}
              disabled={page === 1 || reviews.length === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <button
              className={styles.btnPage}
              disabled={reviews.length === 0}
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
