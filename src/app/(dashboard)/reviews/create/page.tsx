"use client";

import styles from "./createReview.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createMockReview } from "@/services/review.service";
import { getProducts } from "@/services/product.service";
import { Product } from "@/types/product";
import BackButton from "@/components/backButton/backButton";
import { useToast } from "@/components/toast/ToastProvider";
import { uploadImagesToS3 } from "@/services/upload.service";

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
        const res = await getProducts();

        setProducts(res.data);

        if (res.data.length > 0) {
          setSelectedProductId(String(res.data[0].id));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  const validateForm = () => {
    if (!selectedProductId) {
      showToast("Please select a product", "error");
      return false;
    }

    if (!form.reviewerName.trim()) {
      showToast("Customer name is required", "error");
      return false;
    }

    if (!form.reviewerEmail.trim()) {
      showToast("Email is required", "error");
      return false;
    }

    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.reviewerEmail)) {
      showToast("Invalid email format", "error");
      return false;
    }

    if (!form.reviewerPhone.trim()) {
      showToast("Phone number is required", "error");
      return false;
    }

    // Optional: Indian phone validation
    if (!/^[6-9]\d{9}$/.test(form.reviewerPhone)) {
      showToast("Invalid phone number", "error");
      return false;
    }

    if (!form.title.trim()) {
      showToast("Title is required", "error");
      return false;
    }

    if (!form.body.trim()) {
      showToast("Review content is required", "error");
      return false;
    }

    if (form.rating < 1 || form.rating > 5) {
      showToast("Please select a valid rating", "error");
      return false;
    }

    return true;
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRating = (value: number) => {
    setForm({ ...form, rating: value });
  };

  const handleImageUpload = async (e: any) => {
    try {
      const files = Array.from(e.target.files);

      const previewUrls = files.map((file: any) =>
        URL.createObjectURL(file)
      );
      setPreview(previewUrls);

      const uploadedUrls = await uploadImagesToS3(files as File[]);

      setForm({ ...form, images: uploadedUrls });

    } catch (err) {
      console.error(err);
      showToast("Image upload failed", "error");
    }
  };

  const handleSubmit = async () => {
    try {
      const isValid = validateForm();
      if (!isValid) return;

      await createMockReview(selectedProductId, form);
      showToast("Review created successfully", "success");
      router.push("/reviews");
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
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

            <label className={styles.uploadBtn}>
              Choose Images
              <input
                type="file"
                multiple
                onChange={handleImageUpload}
                className={styles.hiddenInput}
              />
            </label>

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
