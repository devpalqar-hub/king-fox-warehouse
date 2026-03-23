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
import { uploadImagesToS3 } from "@/services/upload.service";
import {  X } from "lucide-react";
import { useToast } from "@/components/toast/ToastProvider";

export default function AddVariationPage() {
const { showToast } = useToast();
const searchParams = useSearchParams();
const productId = searchParams.get("productId");
const [variants, setVariants] = useState<any[]>([]);
const [product, setProduct] = useState<any>(null);
const [imageFile, setImageFile] = useState<File | null>(null);
const [preview, setPreview] = useState<string>("");
const [loading, setLoading] = useState(false);
const [variation, setVariation] = useState({
  sku: "",
  size: "",
  color: "",
  costPrice: "",
  sellingPrice: "",
  barcode: "",
  image: ""
});

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setImageFile(file);
  setPreview(URL.createObjectURL(file));
};

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
    return showToast("Product ID missing", "error");
  }

  if (!variation.sku) {
    return showToast("SKU is required", "error");
  }

  try {
    setLoading(true);

    let imageUrl = "";

    if (imageFile) {
      const uploaded = await uploadImagesToS3([imageFile]);
      imageUrl = uploaded[0];
    }

    const payload = {
      sku: variation.sku,
      costPrice: Number(variation.costPrice || 0),
      sellingPrice: Number(variation.sellingPrice || 0),
      size: variation.size,
      color: variation.color,
      barcode: variation.barcode || Date.now().toString(),
      image: imageUrl || "https://via.placeholder.com/150"
    };

    const newVariant = await createVariant(Number(productId), payload);

    setVariants((prev) => [...prev, newVariant]);

    // reset form
    setVariation({
      sku: "",
      size: "",
      color: "",
      costPrice: "",
      sellingPrice: "",
      barcode: "",
      image: ""
    });

    setImageFile(null);
    setPreview("");

    showToast("Variant added successfully ", "success");

  } catch (error: any) {
    console.error(error);
    showToast(error.message || "Failed to add variant ", "error");
  } finally {
    setLoading(false);
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
          {preview ? (
            <div className={styles.previewWrapper}>
              <img src={preview} className={styles.previewImg} />

              {/* ✅ REMOVE BUTTON HERE */}
              <button
                className={styles.removeBtn}
                onClick={() => {
                  setPreview("");
                  setImageFile(null);
                }}
              >
                <X size={14} />
              </button>
               
            </div>
          ) : (
            <label className={styles.uploadPlaceholder}>
              <UploadCloud size={24} />
              <span>Upload Image</span>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />
            </label>
          )}
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
          disabled={loading}
        >
          {loading ? "Adding..." : <><span>+</span> Add to List</>}
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