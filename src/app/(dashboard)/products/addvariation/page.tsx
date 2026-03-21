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
import { useEffect } from "react";
import { getProductById } from "@/services/product-create.service";
import { useSearchParams } from "next/navigation";
import { createVariant } from "@/services/product-create.service";
import { getVariantsByProductId } from "@/services/product-create.service";

export default function AddVariationPage() {
const searchParams = useSearchParams();
const productId = searchParams.get("productId");
const [variants, setVariants] = useState<any[]>([]);
const [product, setProduct] = useState<any>(null);
const [variation, setVariation] = useState({
  sku: "",
  size: "",
  color: "",
  costPrice: "",
  sellingPrice: "",
  barcode: "",
  image: ""
});
// ✅ Fetch product
useEffect(() => {
  const fetchProduct = async () => {
    if (!productId) return;

    try {
      const data = await getProductById(Number(productId));
      setProduct(data);
    } catch (err) {
      console.error("Fetch product error:", err);
    }
  };

  fetchProduct();
}, [productId]);

// ✅ Fetch variants
useEffect(() => {
  const fetchVariants = async () => {
    if (!productId) return;

    try {
      const data = await getVariantsByProductId(Number(productId));
      setVariants(data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchVariants();
}, [productId]);
const handleAddToList = async () => {
  if (!productId) {
    alert("Product ID missing");
    return;
  }

  if (!variation.sku) {
    alert("SKU is required");
    return;
  }

  try {
    const payload = {
      sku: variation.sku,
      costPrice: variation.costPrice,
      sellingPrice: variation.sellingPrice,
      size: variation.size,
      color: variation.color,
      barcode: variation.barcode || Date.now().toString(),
      image: variation.image || "https://via.placeholder.com/150"
    };

    console.log("Sending:", payload);

    const newVariant = await createVariant(Number(productId), payload);

    setVariants((prev) => [...prev, newVariant]);

    alert("Variant added successfully ✅");

    setVariation({
      sku: "",
      size: "",
      color: "",
      costPrice: "",
      sellingPrice: "",
      barcode: "",
      image: ""
    });

  } catch (error: any) {
    console.error(error);
    alert(error.message);
  }
};
  

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.breadcrumb}>Products / Create Product / <span>Add Variations</span></div>
        <div className={styles.headerActions}>
          <h1>Add Product Variations</h1>
          <div className={styles.buttonGroup}>
          </div>
        </div>
        <p className={styles.subtitle}>Define sizes, colors, and specific pricing for each variant</p>
      </header>

      {/* Base Product Card */}
      <section className={styles.card}>
  <div className={styles.baseProduct}>

    <div className={styles.productImage}>
      <img 
        src={product?.images?.[0] || "/tshirt.png"} 
        alt="Product" 
      />
    </div>

    <div className={styles.productInfo}>
      <span className={styles.badge}>BASE PRODUCT</span>

      <h2 className={styles.productTitle}>
          {product?.name || "Loading..."}
        </h2>

        <div className={styles.productMeta}>
          <span className={styles.productMetaItem}>
            <Package size={16}/>
            {product?.category?.name || "Category"}
          </span>

          <span className={styles.sku}>
            # SKU: {product?.sku || "N/A"}
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
      {/* ✅ ADD SKU HERE */}
      <div className={styles.inputGroup}>
        <label className={styles.fieldLabel}>SKU</label>
        <input
          type="text"
          className={styles.inputField}
          value={variation.sku}
          onChange={(e) =>
            setVariation({ ...variation, sku: e.target.value })
          }
        />
      </div>
      <div className={styles.inputRow}>
        <div className={styles.inputGroup}>
          <label className={styles.fieldLabel}>Size</label>
          <input
            type="text"
            className={styles.inputField}
            placeholder="e.g. M, XL"
            value={variation.size}
            onChange={(e) =>
              setVariation({ ...variation, size: e.target.value })
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.fieldLabel}>Color</label>
          <input
            type="text"
            className={styles.inputField}
            placeholder="e.g. Navy Blue"
            value={variation.color}
            onChange={(e) =>
              setVariation({ ...variation, color: e.target.value })
            }
          />
        </div>
      </div>

      <div className={styles.inputRow}>
        <div className={styles.inputGroup}>
          <label className={styles.fieldLabel}>Cost Price ($)</label>
          <input
            type="number"
            placeholder="0.00"
            className={styles.inputField}
            value={variation.costPrice}
            onChange={(e) =>
              setVariation({ ...variation, costPrice: e.target.value })
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.fieldLabel}>Selling Price ($)</label>
          <input
            type="number"
            placeholder="0.00"
            className={styles.inputField}
            value={variation.sellingPrice}
            onChange={(e) =>
              setVariation({ ...variation, sellingPrice: e.target.value })
            }
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.fieldLabel}>Barcode</label>
          <input
            type="text"
            className={styles.inputField}
            placeholder="Enter barcode"
            value={variation.barcode}
            onChange={(e) =>
              setVariation({ ...variation, barcode: e.target.value })
            }
          />
        </div>
      </div>

      <div className={styles.actionRow}>
        <button 
          className={styles.addToListBtn} 
          onClick={handleAddToList}
        >
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
  {variants.map((variant) => (
    <tr key={variant.id}>
      <td>
        <div className={styles.tableImgWrapper}>
          <img
            src={variant.image || "/tshirt.png"}
            className={styles.placeholderImg}
          />
        </div>
      </td>

      <td className={styles.skuText}>{variant.sku}</td>
      <td className={styles.sizeText}>{variant.size}</td>

      <td>
        <div className={styles.colorWrapper}>
          {variant.color}
        </div>
      </td>

      <td className={styles.priceText}>
        ${Number(variant.costPrice)}
      </td>

      <td className={styles.sellingPriceText}>
        ${Number(variant.sellingPrice)}
      </td>

      <td>
        <div className={styles.actionButtons}>
          <button className={styles.editBtn}>
            <PencilLine size={18} />
          </button>
          <button className={styles.deleteBtn}>
            <Trash2 size={18} />
          </button>
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