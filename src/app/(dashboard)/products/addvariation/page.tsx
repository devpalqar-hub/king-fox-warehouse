"use client";
import { Package,UploadCloud, Plus,Trash2, 
  PencilLine, 
  SlidersHorizontal, 
  Download, 
  ChevronLeft, 
  ChevronRight } from "lucide-react";
import React, { useState } from 'react';
import styles from './addvariation.module.css';
import Image from 'next/image';

export default function AddVariationPage() {
  const [variation, setVariation] = useState({
    size: 'S',
    color: 'Maroon',
    costPrice: '0.00',
    sellingPrice: '0.00'
  });
  const variationsList = [
    { id: 1, sku: 'UF-PCT-001-M-MA', size: 'M', color: 'Maroon', colorHex: '#800000', cost: '$12.50', selling: '$29.99', image: '/tshirt.png' },
    { id: 2, sku: 'UF-PCT-001-L-NB', size: 'L', color: 'Navy Blue', colorHex: '#000080', cost: '$12.50', selling: '$29.99', image: '/tshirt.png' },
    { id: 3, sku: 'UF-PCT-001-S-FG', size: 'S', color: 'Forest Green', colorHex: '#228B22', cost: '$12.50', selling: '$29.99', image: '/tshirt.png' },
    { id: 4, sku: 'UF-PCT-001-XL-CH', size: 'XL', color: 'Charcoal', colorHex: '#36454F', cost: '$13.50', selling: '$32.99', image: '/tshirt.png' },
  ];

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.breadcrumb}>Products / Create Product / <span>Add Variations</span></div>
        <div className={styles.headerActions}>
          <h1>Add Product Variations</h1>
          <div className={styles.buttonGroup}>
            <button className={styles.discardBtn}>Discard</button>
            <button className={styles.saveBtn}>Save All Variations</button>
          </div>
        </div>
        <p className={styles.subtitle}>Define sizes, colors, and specific pricing for each variant</p>
      </header>

      {/* Base Product Card */}
      <section className={styles.card}>
  <div className={styles.baseProduct}>

    <div className={styles.productImage}>
      <img src="/tshirt.png" alt="Product" />
    </div>

    <div className={styles.productInfo}>
      <span className={styles.badge}>BASE PRODUCT</span>

      <h2 className={styles.productTitle}>
        UrbanFit Premium Cotton T-Shirt
      </h2>

      <div className={styles.productMeta}>
        <span className={styles.productMetaItem}>
          <Package size={16}/>
          Apparel
        </span>

        <span className={styles.sku}>
          # SKU: UF-PCT-001
        </span>
      </div>
    </div>

  </div>
</section>

      {/* Form Section */}
      {/* Configure New Variation Section */}
<section className={styles.card}>
  <div className={styles.cardHeader}>
    <h3>Configure New Variation</h3>
  </div>
  
  <div className={styles.configContent}>
    {/* Left: Image Upload */}
    <div className={styles.uploadSection}>
      <label className={styles.fieldLabel}>Variation Image</label>
      <div className={styles.uploadBox}>
        <div className={styles.uploadPlaceholder}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>Upload Image</span>
        </div>
      </div>
    </div>

    {/* Right: Form Fields */}
    <div className={styles.formSection}>
      <div className={styles.inputRow}>
        <div className={styles.inputGroup}>
          <label className={styles.fieldLabel}>Size</label>
          <select className={styles.selectField}>
            <option>S</option>
            <option>M</option>
            <option>L</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.fieldLabel}>Color</label>
          <select className={styles.selectField}>
            <option>Maroon</option>
            <option>Navy Blue</option>
            <option>Charcoal</option>
          </select>
        </div>
      </div>

      <div className={styles.inputRow}>
        <div className={styles.inputGroup}>
          <label className={styles.fieldLabel}>Cost Price ($)</label>
          <input type="text" placeholder="0.00" className={styles.inputField} />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.fieldLabel}>Selling Price ($)</label>
          <input type="text" placeholder="0.00" className={styles.inputField} />
        </div>
      </div>

      <div className={styles.actionRow}>
        <button className={styles.addToListBtn}>
          <span>+</span> Add to List
        </button>
      </div>
    </div>
  </div>
</section>
<section className={styles.variantsCard}>
        <div className={styles.variantsHeader}>
          <h3>Existing Variants (10)</h3>
          <div className={styles.variantsActions}>
            <button className={styles.iconBtn}><SlidersHorizontal size={18} /></button>
            <button className={styles.iconBtn}><Download size={18} /></button>
          </div>
        </div>

        <table className={styles.variantsTable}>
          <thead>
            <tr>
              <th>IMAGE</th>
              <th>SKU</th>
              <th>SIZE</th>
              <th>COLOR</th>
              <th>COST</th>
              <th>SELLING PRICE</th>
              <th style={{ textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {variationsList.map((variant) => (
              <tr key={variant.id}>
                <td>
                  <div className={styles.tableImgWrapper}>
                    {/* Replace with <Image /> if you have the assets */}
                    <div className={styles.placeholderImg} style={{backgroundColor: variant.colorHex}}></div>
                  </div>
                </td>
                <td className={styles.skuText}>{variant.sku}</td>
                <td className={styles.sizeText}>{variant.size}</td>
                <td>
                  <div className={styles.colorWrapper}>
                    <span className={styles.colorDot} style={{ backgroundColor: variant.colorHex }}></span>
                    {variant.color}
                  </div>
                </td>
                <td className={styles.priceText}>{variant.cost}</td>
                <td className={styles.sellingPriceText}>{variant.selling}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={styles.editBtn}><PencilLine size={18} /></button>
                    <button className={styles.deleteBtn}><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.tableFooter}>
          <p className={styles.variantsLeft}>6 more variants listed below...</p>
        </div>

        <div className={styles.paginationRow}>
          <p>Showing 4 of 10 variations</p>
          <div className={styles.paginationControls}>
            <button className={styles.prevBtn} disabled>Previous</button>
            <button className={`${styles.pageBtn} ${styles.activePage}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.nextBtn}>Next</button>
          </div>
        </div>
      </section>

    </div>
  );
}