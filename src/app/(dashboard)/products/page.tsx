"use client";
import { useRouter } from "next/navigation";
import React from 'react';
import styles from './products.module.css';
import { Search, Plus, Upload, Edit2, Trash2, ChevronDown, X } from 'lucide-react';
import Link from "next/link";
const ProductsPage = () => {
  const router = useRouter();
  const products = [
    { id: 1, name: 'Nike Air Max 270', sku: 'NK-AM270-001', category: 'Footwear', brand: 'Nike', price: '$150.00 - $180.00', variants: '8 Variants', status: 'Active', image: '👟' },
    { id: 2, name: 'Bose QuietComfort 45', sku: 'B-C45-BL', category: 'Electronics', brand: 'Bose', price: '$329.00', variants: '2 Variants', status: 'Active', image: '🎧' },
    { id: 3, name: 'Minimalist Watch', sku: 'MW-LV-01', category: 'Accessories', brand: 'MVMT', price: '$95.00', variants: '3 Variants', status: 'Draft', image: '⌚' },
    { id: 4, name: 'Classic Aviators', sku: 'RB-AV-GLD', category: 'Apparel', brand: 'Ray-Ban', price: '$165.00', variants: '5 Variants', status: 'Active', image: '🕶️' },
  ];

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Products</h1>
          <p>Manage and monitor your store inventory</p>
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.btnSecondary}><Upload size={18} /> Import</button>
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
            <input type="text" placeholder="Search by name, SKU, or brand..." />
          </div>
          <div className={styles.selectWrapper}>
            <select>
              <option>All Categories</option>
            </select>
            <ChevronDown className={styles.selectArrow} size={16} />
          </div>
          <div className={styles.selectWrapper}>
            <select>
              <option>Price Range</option>
            </select>
            <ChevronDown className={styles.selectArrow} size={16} />
          </div>
        </div>
        <div className={styles.tagRow}>
          <span className={styles.tag}>New Arrivals <X size={14} /></span>
          <span className={styles.tag}>Best Sellers <X size={14} /></span>
          <button className={styles.clearBtn}>Clear all</button>
        </div>
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
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className={styles.productCell}>
                    <div className={styles.productImg}>{product.image}</div>
                    <div>
                      <div className={styles.productName}>{product.name}</div>
                      <div className={styles.productSku}>SKU: {product.sku}</div>
                    </div>
                  </div>
                </td>
                <td><span className={styles.categoryBadge}>{product.category}</span></td>
                <td className={styles.textMuted}>{product.brand}</td>
                <td className={styles.priceText}>{product.price}</td>
                <td className={styles.textMuted}>{product.variants}</td>
                <td>
                  <div className={`${styles.status} ${styles[product.status.toLowerCase()]}`}>
                    <span className={styles.dot}></span> {product.status}
                  </div>
                </td>
                <td>
                  <div className={styles.actions}>
                    <div className={styles.actions}>
                    <Edit2
                        size={18}
                        className={styles.editIcon}
                        onClick={() => router.push("/products/editproduct")}
                    />
                    </div>
                    <Trash2 size={18} className={styles.deleteIcon} />
                  </div>
                </td>
              </tr>
            ))}
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