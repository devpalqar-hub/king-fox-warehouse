"use client";

import styles from "./createReview.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createMockReview } from "@/services/review.service";
import { getProducts } from "@/services/product.service";
import { Product } from "@/types/product";
import BackButton from "@/components/backButton/backButton";
import { useToast } from "@/components/toast/ToastProvider";

const CreateReviewPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const { showToast } = useToast();

  const [form, setForm] = useState({
    reviewerName: "",
    reviewerEmail: "",
    reviewerPhone: "",
    title: "",
    body: "",
    rating: 4,
    images: [] as string[],
  });

  const [preview, setPreview] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);

        if (data.length > 0) {
          setSelectedProductId(String(data[0].id));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRating = (value: number) => {
    setForm({ ...form, rating: value });
  };

  const handleImageUpload = (e: any) => {
    const files = Array.from(e.target.files);

    const urls = files.map((file: any) => URL.createObjectURL(file));

    setPreview(urls);
    setForm({ ...form, images: urls });
  };

  const handleSubmit = async () => {
    try {
      if(!selectedProductId) {
        showToast("Please select a product", "error");
      }
      await createMockReview(selectedProductId, form);
      router.push("/reviews");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Add Mock Review</h2>
          <p>Simulate customer feedback for testing</p>
        </div>

        {/* Form */}
        <div className={styles.form}>
          <div>
            <label className={styles.label}>Customer Name</label>
            <input
              name="reviewerName"
              className={styles.input}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={styles.label}>Email</label>
            <input
              name="reviewerEmail"
              className={styles.input}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={styles.label}>Phone</label>
            <input
              name="reviewerPhone"
              className={styles.input}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={styles.label}>Select Product</label>
            <select
              className={styles.input}
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">-- Select Product --</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={styles.label}>Title</label>
            <input
              name="title"
              className={styles.input}
              onChange={handleChange}
            />
          </div>

          <div className={styles.full}>
            <label className={styles.label}>Review Content</label>
            <textarea
              name="body"
              className={styles.textarea}
              onChange={handleChange}
            />
          </div>

          {/* Image Upload */}
          <div className={styles.full}>
            <label className={styles.label}>Upload Images</label>
            <input type="file" multiple onChange={handleImageUpload} />

            <div className={styles.previewGrid}>
              {preview.map((img, i) => (
                <img key={i} src={img} className={styles.previewImg} />
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className={styles.full}>
            <label className={styles.label}>Rating</label>
            <p className={styles.labelSub}>How would you rate this product?</p>

            <div className={styles.starsWrapper}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`${styles.starBtn} ${n <= form.rating ? styles.starActive : styles.starInactive}`}
                  onClick={() => handleRating(n)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}

              <span className={styles.ratingLabel}>
                {
                  ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                    form.rating
                  ]
                }
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.btnGhost} onClick={() => router.back()}>
            Discard
          </button>

          <button className={styles.btnPrimary} onClick={handleSubmit}>
            Post Mock Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateReviewPage;
