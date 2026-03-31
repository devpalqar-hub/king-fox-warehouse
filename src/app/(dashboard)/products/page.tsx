"use client";

import { useRouter } from "next/navigation";
import styles from "./products.module.css";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useCallback, useState } from "react";
import { getProducts, deleteProduct } from "@/services/product.service";
import type { ProductMeta } from "@/services/product.service";
import { Product } from "@/types/product";
import { getCategories } from "@/services/category.service";
import { Category } from "@/types/category";
import DeleteConfirmModal from "@/components/DeleteConfirmModal/DeleteConfirmModal";

const PAGE_LIMIT = 10;

const ProductsPage = () => {
  const router = useRouter();

  // ── Data state ──────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ProductMeta>({
    total: 0,
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  // ── Filter state ─────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  // ── Categories ───────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);

  // ── Delete modal state ───────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"];

  // ── Fetch products ────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getProducts({
        search,
        categoryId,
        status,
        page,
        limit: PAGE_LIMIT,
      });
      setProducts(res.data);
      setMeta(res.meta);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryId, status, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounce search → reset page
  useEffect(() => {
    const delay = setTimeout(() => setPage(1), 400);
    return () => clearTimeout(delay);
  }, [search]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [categoryId, status]);

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // ── Delete handlers ───────────────────────────────────────
  const handleDeleteClick = (product: Product) => {
    setDeleteTarget(product);
  };

  const handleDeleteCancel = () => {
    if (isDeleting) return; // prevent close while in-flight
    setDeleteTarget(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);

      // If the deleted item was the only one on this page, step back
      const newTotal = meta.total - 1;
      const newTotalPages = Math.max(1, Math.ceil(newTotal / PAGE_LIMIT));
      if (page > newTotalPages) {
        setPage(newTotalPages); // triggers fetchProducts
      } else {
        fetchProducts(); // re-fetch same page
      }
    } catch (err) {
      console.error("Delete failed:", err);
      // Optionally show an error toast here
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Pagination helpers ────────────────────────────────────
  const { total, totalPages } = meta;
  const startItem = total === 0 ? 0 : (page - 1) * PAGE_LIMIT + 1;
  const endItem = Math.min(page * PAGE_LIMIT, total);

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    const delta = 2;
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);
    const range: (number | "...")[] = [1];

    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push("...");
    range.push(totalPages);
    return range;
  };

  return (
    <>
      <div className={styles.container}>
        {/* ── Header ──────────────────────────────────────── */}
        <header className={styles.header}>
          <div className={styles.titleArea}>
            <h1>Products</h1>
            <p>Manage and monitor your store inventory</p>
          </div>
          <div className={styles.buttonGroup}>
            <Link href="/products/addproduct" className={styles.btnPrimary}>
              <Plus size={18} /> Add Product
            </Link>
          </div>
        </header>

        {/* ── Filter Card ─────────────────────────────────── */}
        <section className={styles.filterCard}>
          <div className={styles.searchRow}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search by product name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className={styles.selectWrapper}>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className={styles.selectArrow} size={16} />
            </div>

            <div className={styles.selectWrapper}>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All Status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className={styles.selectArrow} size={16} />
            </div>
          </div>
        </section>

        {/* ── Table Section ───────────────────────────────── */}
        <section
          className={`${styles.tableWrapper} ${isLoading ? styles.tableLoading : ""}`}
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price Range</th>
                <th>Variants</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6} className={styles.emptyRow}>
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const prices =
                    product.variants?.map((v) => Number(v.sellingPrice)) || [];
                  const minPrice = prices.length ? Math.min(...prices) : 0;
                  const maxPrice = prices.length ? Math.max(...prices) : 0;
                  const productStatus = (
                    product.status ?? "ACTIVE"
                  ).toUpperCase();

                  return (
                    <tr
                      key={product.id}
                      className={isLoading ? styles.rowFaded : ""}
                    >
                      <td data-label="Product">
                        <div className={styles.productCell}>
                          <div className={styles.productImg}>
                            {product.images?.length ? (
                              <img
                                src={product.images[0]}
                                width={40}
                                height={40}
                                alt={product.name}
                              />
                            ) : (
                              "📦"
                            )}
                          </div>
                          <div>
                            <div className={styles.productName}>
                              {product.name}
                            </div>
                            <div className={styles.productSku}>
                              SKU: {product.variants?.[0]?.sku || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td data-label="Category">
                        <span
                          className={`${styles.categoryBadge} ${
                            styles[
                              product.category?.name
                                ?.toLowerCase()
                                .replace(/\s/g, "")
                                .replace(/-/g, "")
                            ] || styles.defaultCategory
                          }`}
                        >
                          {product.category?.name ?? "—"}
                        </span>
                      </td>

                      <td data-label="Price Range" className={styles.priceText}>
                        {prices.length
                          ? `$${minPrice}${minPrice !== maxPrice ? ` – $${maxPrice}` : ""}`
                          : "—"}
                      </td>

                      <td data-label="Variants" className={styles.textMuted}>
                        {product.variants?.length || 0} Variants
                      </td>

                      <td data-label="Status">
                        <div
                          className={`${styles.status} ${productStatus === "ACTIVE" ? styles.active : styles.inactive}`}
                        >
                          <span className={styles.dot} />
                          {productStatus === "ACTIVE" ? "Active" : "Inactive"}
                        </div>
                      </td>

                      <td data-label="Actions">
                        <div className={styles.actions}>
                          <button
                            className={styles.actionBtn}
                            title="Edit"
                            onClick={() =>
                              router.push(`/products/editproduct/${product.id}`)
                            }
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.actionDanger}`}
                            title="Delete"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* ── Pagination Footer ──────────────────────────── */}
          {total > 0 && (
            <footer className={styles.pagination}>
              <p className={styles.paginationInfo}>
                Showing{" "}
                <strong>
                  {startItem}–{endItem}
                </strong>{" "}
                of <strong>{total}</strong> products
              </p>

              <div className={styles.pagerBtns}>
                <button
                  className={styles.pagerIcon}
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  title="First page"
                >
                  <ChevronsLeft size={15} />
                </button>
                <button
                  className={styles.pagerIcon}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  title="Previous page"
                >
                  <ChevronLeft size={15} />
                </button>

                <div className={styles.pageNumbers}>
                  {getPageNumbers().map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${i}`}
                        className={styles.pageEllipsis}
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        className={`${styles.pageNumber} ${page === p ? styles.activePage : ""}`}
                        onClick={() => setPage(p as number)}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>

                <button
                  className={styles.pagerIcon}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  title="Next page"
                >
                  <ChevronRight size={15} />
                </button>
                <button
                  className={styles.pagerIcon}
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  title="Last page"
                >
                  <ChevronsRight size={15} />
                </button>
              </div>
            </footer>
          )}
        </section>
      </div>

      {/* ── Delete Confirmation Modal (outside main div, rendered in portal-like fashion) */}
      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        productName={deleteTarget?.name ?? ""}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
};

export default ProductsPage;
