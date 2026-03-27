"use client";

import { useEffect, useState } from "react";
import styles from "./inventory.module.css";
import { Search, ChevronDown, Edit2, Plus } from "lucide-react";
import { getInventory } from "@/services/inventory.service";
import { getCategories } from "@/services/category.service";
import { InventoryVariant } from "@/types/variant";
import Link from "next/link";
import { useRouter } from "next/navigation";

const InventoryPage = () => {
  const [variants, setVariants] = useState<InventoryVariant[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const router = useRouter();
  // fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);

  // fetch inventory
  useEffect(() => {
    const delay = setTimeout(async () => {
      const data = await getInventory({
        search,
        categoryId,
        page,
      });

      setVariants(data);
    }, 400);

    return () => clearTimeout(delay);
  }, [search, categoryId, page]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Inventory Management</h1>
          <p>Monitor and adjust stock levels</p>
        </div>
      </header>

      {/* Filters */}
      <section className={styles.filterCard}>
        <div className={styles.searchRow}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              placeholder="Search SKU, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.selectWrapper}>
            <select onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">All Categories</option>

              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>PRODUCT NAME</th>
              <th>VARIANT</th>
              <th>SKU</th>
              <th>TOTAL STOCK</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {variants.map((item) => (
              <tr key={item.id}>
                <td className={styles.productName} data-label="Product Name">
                  {item.product.name}
                </td>

                <td data-label="Variant">
                  <span className={styles.variantBadge}>
                    {item.size} / {item.color}
                  </span>
                </td>

                <td className={styles.textMuted} data-label="SKU">
                  {item.sku}
                </td>

                <td data-label="Total Stock">
                  <span
                    className={`${styles.stock} ${
                      item.lowStock ? styles.lowStock : styles.goodStock
                    }`}
                  >
                    {item.totalStock}
                  </span>
                </td>

                <td data-label="Actions">
                  <Edit2
                    size={18}
                    className={styles.editIcon}
                    onClick={() => router.push(`/inventory/${item.id}`)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination (future-ready) */}
        <footer className={styles.pagination}>
          <p>Showing results</p>

          <div className={styles.pagerBtns}>
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))}>
              Previous
            </button>

            <button className={styles.activePage}>{page}</button>

            <button onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </footer>
      </section>
    </div>
  );
};

export default InventoryPage;
