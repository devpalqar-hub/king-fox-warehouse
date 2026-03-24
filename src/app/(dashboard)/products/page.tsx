"use client";
import { useRouter } from "next/navigation";
import React from 'react';
import styles from './products.module.css';
import { Search, Plus, Upload, Edit2, Trash2, ChevronDown, X } from 'lucide-react';
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProducts } from "@/services/product.service";
import { Product } from "@/types/product";
import { getCategories } from "@/services/category.service";
import { Category } from "@/types/category";

const ProductsPage = () => {

  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  useEffect(() => {
  const fetchProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  fetchProducts();
}, []);

// Fetch Products When Searching
useEffect(() => {

  const delay = setTimeout(() => {
    const fetchProducts = async () => {
      const data = await getProducts({
        search,
        categoryId
      });
      setProducts(data);
    };
    fetchProducts();
  }, 500);
  return () => clearTimeout(delay);
}, [search, categoryId]);

useEffect(() => {
  const fetchCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  fetchCategories();
}, []);


  return (
    <div className={styles.container}>
      {/* Header Section */}
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

      {/* Filter Card */}
      <section className={styles.filterCard}>
        <div className={styles.searchRow}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
                type="text"
                placeholder="Search by name, SKU, or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                />
          </div>
          <div className={styles.selectWrapper}>
            <select onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">All Categories</option>

                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                    {category.name}
                    </option>
                ))}
            </select>
            <ChevronDown className={styles.selectArrow} size={16} />
          </div>
          <div className={styles.selectWrapper}>
            <select>
              <option>status</option>
            </select>
            <ChevronDown className={styles.selectArrow} size={16} />
          </div>
        </div>
        {/* <div className={styles.tagRow}>
          <span className={styles.tag}>New Arrivals <X size={14} /></span>
          <span className={styles.tag}>Best Sellers <X size={14} /></span>
          <button className={styles.clearBtn}>Clear all</button>
        </div> */}
      </section>

      {/* Table Section */}
      <section className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>PRODUCT</th>
              <th>CATEGORY</th>
              <th>BRAND</th>
              <th>PRICE RANGE</th>
              <th>VARIANTS</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
  {products.map((product) => {

    const prices = product.variants?.map(v => Number(v.sellingPrice)) || [];

    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;

    return (
      <tr key={product.id}>
        <td>
          <div className={styles.productCell}>
            <div className={styles.productImg}>
              {product.images?.length ? (
                <img src={product.images[0]} width={40} />
              ) : (
                "📦"
              )}
            </div>

            <div>
              <div className={styles.productName}>{product.name}</div>
              <div className={styles.productSku}>
                SKU: {product.variants?.[0]?.sku || "N/A"}
              </div>
            </div>
          </div>
        </td>

        <td>
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
          {product.category?.name}
        </span>
        </td>

        <td className={styles.textMuted}>{product.brand?.name}</td>

        <td className={styles.priceText}>
          ${minPrice} - ${maxPrice}
        </td>

        <td className={styles.textMuted}>
          {product.variants?.length || 0} Variants
        </td>

        <td>
          <div className={`${styles.status} ${styles.active}`}>
            <span className={styles.dot}></span> Active
          </div>
        </td>

        <td>
          <div className={styles.actions}>
            <Edit2
              size={18}
              className={styles.editIcon}
              onClick={() => router.push(`/products/editproduct/${product.id}`)}
            />
            <Trash2 size={18} className={styles.deleteIcon} />
          </div>
        </td>
      </tr>
    );
  })}
</tbody>
        </table>

        {/* Pagination */}
        <footer className={styles.pagination}>
          <p>Showing 1 to 10 of 48 products</p>
          <div className={styles.pagerBtns}>
            <button disabled>Previous</button>
            <button className={styles.activePage}>1</button>
            <button>2</button>
            <button>3</button>
            <button>Next</button>
          </div>
        </footer>
      </section>
    </div>
  );
};

export default ProductsPage;