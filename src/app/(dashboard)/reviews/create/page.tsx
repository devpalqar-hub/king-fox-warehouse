"use client";

import styles from "./createReview.module.css";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { createMockReview } from "@/services/review.service";
import { getProducts } from "@/services/product.service";
import { Product } from "@/types/product";
import BackButton from "@/components/backButton/backButton";
import { useToast } from "@/components/toast/ToastProvider";
import { uploadImagesToS3 } from "@/services/upload.service";
import { useRef } from "react";

const CreateReviewPage = () => {
  const PRODUCT_LIMIT = 20;
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const { showToast } = useToast();
  const productRef = useRef<HTMLDivElement | null>(null);

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
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (productRef.current && !productRef.current.contains(target)) {
        setShowProductDropdown(false);
        setProductSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        setLoadingProducts(true);
        const res = await getProducts({
          search: productSearch.trim() || undefined,
          page: 1,
          limit: PRODUCT_LIMIT,
        });

        setProducts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProducts(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [productSearch]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRating = (value: number) => {
    setForm({ ...form, rating: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files ?? []);

      if (files.length === 0) return;

      const previewUrls = files.map((file) => URL.createObjectURL(file));
      setPreview(previewUrls);

      const uploadedUrls = await uploadImagesToS3(files as File[]);

      setForm({ ...form, images: uploadedUrls });
    } catch (err) {
      console.error(err);
      showToast("Image upload failed", "error");
    }
  };

  const productOptions =
    selectedProduct &&
    !products.some((product) => product.id === selectedProduct.id)
      ? [selectedProduct, ...products]
      : products;

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    const product =
      productOptions.find((item) => String(item.id) === productId) ?? null;
    setSelectedProduct(product);
    setShowProductDropdown(false);
    setProductSearch("");
  };

  const handleProductDropdownToggle = () => {
    setShowProductDropdown((prev) => {
      if (prev) {
        setProductSearch("");
      }

      return !prev;
    });
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
            <div className={styles.dropdownWrapper} ref={productRef}>
              <button
                type="button"
                onClick={handleProductDropdownToggle}
                className={styles.dropdownTrigger}
              >
                <span className={styles.dropdownText}>
                  {selectedProduct?.name || "Select product..."}
                </span>
                <ChevronDown
                  size={18}
                  className={showProductDropdown ? styles.chevronOpen : ""}
                />
              </button>

              {showProductDropdown && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownSearch}>
                    <Search size={16} className={styles.dropdownSearchIcon} />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products..."
                      className={styles.dropdownSearchInput}
                    />
                  </div>

                  {loadingProducts ? (
                    <div className={styles.emptyState}>
                      Searching products...
                    </div>
                  ) : productOptions.length === 0 ? (
                    <div className={styles.emptyState}>
                      {productSearch.trim()
                        ? `No products found for "${productSearch.trim()}".`
                        : "No products available"}
                    </div>
                  ) : (
                    productOptions.map((product) => (
                      <label key={product.id} className={styles.checkboxItem}>
                        <input
                          type="radio"
                          checked={selectedProductId === String(product.id)}
                          onChange={() =>
                            handleProductSelect(String(product.id))
                          }
                          className={styles.checkbox}
                        />
                        <span className={styles.checkboxLabel}>
                          {product.name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}

              {selectedProduct && (
                <div className={styles.selectedTags}>
                  <span className={styles.tag}>{selectedProduct.name}</span>
                </div>
              )}
            </div>
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
                <Image
                  key={i}
                  src={img}
                  alt={`Review upload preview ${i + 1}`}
                  width={80}
                  height={80}
                  className={styles.previewImg}
                  unoptimized
                />
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
