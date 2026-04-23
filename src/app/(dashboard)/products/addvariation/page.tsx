"use client";
import { Package, UploadCloud, Trash2, X, Check, Pencil } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import styles from "./addvariation.module.css";
import { useSearchParams } from "next/navigation";
import {
  getProductById,
  createVariant,
  getVariantsByProductId,
  updateVariant,
} from "@/services/product-create.service";
import { uploadImagesToS3 } from "@/services/upload.service";
import { useToast } from "@/components/toast/ToastProvider";
import BackButton from "@/components/backButton/backButton";
import DeleteConfirmModal from "@/components/DeleteConfirmModal/DeleteConfirmModal";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/150";

type VariantWithImages = {
  image?: string | null;
  images?: (string | null | undefined)[];
};

const getVariantImages = (variant?: VariantWithImages | null): string[] => {
  if (Array.isArray(variant?.images)) {
    return variant.images.filter((image): image is string => Boolean(image));
  }
  return variant?.image ? [variant.image] : [];
};

const getVariantPrimaryImage = (variant: VariantWithImages) =>
  getVariantImages(variant)[0] || variant?.image || "/tshirt.png";

const normalizeVariantImages = <T extends VariantWithImages>(variant: T) => {
  const images = getVariantImages(variant);
  return {
    ...variant,
    images,
    image: images[0] || variant?.image || "",
  };
};

const deleteVariant = async (variantId: number) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/v1/products/variants/${variantId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete variant");
  }
};

export default function AddVariationPage() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [variants, setVariants] = useState<any[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editPreviews, setEditPreviews] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [variation, setVariation] = useState({
    size: [] as string[],
    color: "",
    costPrice: "",
    sellingPrice: "",
    weight: "",
    image: "",
  });

  const sizeOptions = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "3XL",
    "4XL",
    "5XL",
    "6XL",
    "7XL",
  ];
  const numericalSizes = [
    "28",
    "29",
    "30",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
    "39",
    "40",
    "42",
    "44",
    "46",
  ];
  const colorOptions = [
    "Red",
    "Blue",
    "Green",
    "Yellow",
    "Black",
    "White",
    "Gray",
    "Purple",
    "Orange",
    "Pink",
    "Brown",
    "Navy",
    "Cyan",
    "Lime",
    "Magenta",
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!productId) return;
    getProductById(Number(productId))
      .then(setProduct)
      .catch((err) => console.error("Fetch product error:", err));
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    getVariantsByProductId(Number(productId))
      .then((data) =>
        setVariants(
          data.map((v: any) => ({
            ...normalizeVariantImages(v),
            // Handle both camelCase and snake_case from backend
            costPrice: Number(v.costPrice ?? v.cost_price ?? 0),
            sellingPrice: Number(v.sellingPrice ?? v.selling_price ?? 0),
          })),
        ),
      )
      .catch(console.error);
  }, [productId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImageFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddToList = async () => {
    if (!productId) return showToast("Product ID missing", "error");

    // Validation
    if (variation.size.length === 0) {
      return showToast("Please select at least one size", "error");
    }
    if (!variation.color.trim()) {
      return showToast("Please select or enter a color", "error");
    }
    const costPrice = Number(variation.costPrice);
    if (isNaN(costPrice) || costPrice <= 0) {
      return showToast(
        "Please enter a valid cost price greater than 0",
        "error",
      );
    }
    const sellingPrice = Number(variation.sellingPrice);
    if (isNaN(sellingPrice) || sellingPrice <= 0) {
      return showToast(
        "Please enter a valid selling price greater than 0",
        "error",
      );
    }
    if (costPrice < sellingPrice) {
      return showToast(
        "Cost price must be greater than or equal to selling price",
        "error",
      );
    }
    const weight = Number(variation.weight);
    if (isNaN(weight) || weight <= 0) {
      return showToast("Please enter a valid weight greater than 0", "error");
    }
    if (!imageFiles.length) {
      return showToast("Please upload at least one image for the variation", "error");
    }

    try {
      setLoading(true);
      const imageUrls = await uploadImagesToS3(imageFiles);
      const createdVariants: any[] = [];
      for (const size of variation.size) {
        const payload = {
          costPrice: Number(variation.costPrice || 0),
          sellingPrice: Number(variation.sellingPrice || 0),
          size,
          color: variation.color,
          weight: Number(variation.weight || 0),
          image: imageUrls[0] || PLACEHOLDER_IMAGE,
          images: imageUrls,
        };
        const newVariant = await createVariant(Number(productId), payload);
        const normalizedVariant = normalizeVariantImages({
          ...newVariant,
          image: newVariant.image || payload.image,
          images: getVariantImages(newVariant).length
            ? newVariant.images
            : payload.images,
        });
        // Ensure temporary ID if API doesn't return one
        if (!normalizedVariant.id) {
          normalizedVariant._tempId = `temp-${Date.now()}-${Math.random()}`;
        }
        createdVariants.push(normalizedVariant);
      }
      setVariants((prev) => [...prev, ...createdVariants]);
      setVariation({
        size: [],
        color: "",
        costPrice: "",
        sellingPrice: "",
        weight: "",
        image: "",
      });
      setImageFiles([]);
      setPreviews([]);
      showToast("Variant(s) added successfully", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to add variant", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (variant: any) => {
    setVariantToDelete(variant);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!variantToDelete) return;
    try {
      setIsDeleting(true);
      await deleteVariant(variantToDelete.id);
      setVariants((prev) => prev.filter((v) => v.id !== variantToDelete.id));
      showToast("Variant deleted", "success");
      setDeleteConfirmOpen(false);
      setVariantToDelete(null);
    } catch (error: any) {
      showToast(error.message || "Failed to delete variant", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setVariantToDelete(null);
  };

  const openEditModal = (variant: any) => {
    const normalizedVariant = normalizeVariantImages(variant);
    setEditingVariant(normalizedVariant);
    setEditPreviews(getVariantImages(normalizedVariant));
    setEditImageFiles([]);
    setEditModalOpen(true);
  };

  const handleEditImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setEditImageFiles((prev) => [...prev, ...files]);
    setEditPreviews((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
    e.target.value = "";
  };

  const removeEditImage = (index: number) => {
    const existingImages = getVariantImages(editingVariant);
    const existingCount = existingImages.length;

    if (index < existingCount) {
      const images = existingImages.filter((_, i) => i !== index);
      setEditingVariant({
        ...editingVariant,
        images,
        image: images[0] || "",
      });
    } else {
      const fileIndex = index - existingCount;
      setEditImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }

    setEditPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditSave = async () => {
    if (!editingVariant) return;

    // Validation
    if (!editingVariant.size.trim()) {
      return showToast("Please select a size", "error");
    }
    if (!editingVariant.color.trim()) {
      return showToast("Please select or enter a color", "error");
    }
    const costPrice = Number(editingVariant.costPrice);
    if (isNaN(costPrice) || costPrice <= 0) {
      return showToast(
        "Please enter a valid cost price greater than 0",
        "error",
      );
    }
    const sellingPrice = Number(editingVariant.sellingPrice);
    if (isNaN(sellingPrice) || sellingPrice <= 0) {
      return showToast(
        "Please enter a valid selling price greater than 0",
        "error",
      );
    }
    if (sellingPrice > costPrice) {
      return showToast(
        "Selling price must be less than or equal to cost price",
        "error",
      );
    }
    const weight = Number(editingVariant.weight);
    if (isNaN(weight) || weight <= 0) {
      return showToast("Please enter a valid weight greater than 0", "error");
    }
    const hasExistingImages = getVariantImages(editingVariant).length > 0;
    if (!editImageFiles.length && !hasExistingImages) {
      return showToast("Please upload at least one image for the variation", "error");
    }

    try {
      setEditLoading(true);
      const uploadedUrls = editImageFiles.length
        ? await uploadImagesToS3(editImageFiles)
        : [];
      const finalImages = [...getVariantImages(editingVariant), ...uploadedUrls];
      const payload = {
        size: editingVariant.size,
        color: editingVariant.color,
        costPrice: Number(editingVariant.costPrice || 0),
        sellingPrice: Number(editingVariant.sellingPrice || 0),
        weight: Number(editingVariant.weight || 0),
        image: finalImages[0] || "",
        images: finalImages,
      };
      const updated = await updateVariant(editingVariant.id, payload);
      setVariants((prev) =>
        prev.map((v) =>
          v.id === editingVariant.id
            ? normalizeVariantImages({ ...v, ...payload, ...updated })
            : v,
        ),
      );
      setEditModalOpen(false);
      showToast("Variant updated", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to update variant", "error");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <BackButton />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.breadcrumb}>
          Products / Create Product / <span>Add Variations</span>
        </div>
        <div className={styles.headerActions}>
          <h1>Add Product Variations</h1>
        </div>
        <p className={styles.subtitle}>
          Define sizes, colors, and specific pricing for each variant
        </p>
      </header>

      {/* Base Product Card */}
      <section className={styles.card}>
        <div className={styles.baseProduct}>
          <div className={styles.productImage}>
            <img src={product?.images?.[0] || "/tshirt.png"} alt="Product" />
          </div>
          <div className={styles.productInfo}>
            <span className={styles.badge}>BASE PRODUCT</span>
            <h2 className={styles.productTitle}>
              {product?.name || "Loading..."}
            </h2>
            <div className={styles.productMeta}>
              <span className={styles.productMetaItem}>
                <Package size={16} />
                {product?.category?.name || "Category"}
              </span>
              <span className={styles.sku}># SKU: {product?.sku || "N/A"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Configure New Variation */}
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>Configure New Variation</h3>
        </div>
        <div className={styles.configContent}>
          {/* Image Upload */}
          <div className={styles.uploadSection}>
            <label className={styles.fieldLabel}>Variation Images</label>
            <div className={styles.multiUploadBox}>
              {previews.map((preview, index) => (
                <div key={`${preview}-${index}`} className={styles.previewWrapper}>
                  <img
                    src={preview}
                    className={styles.previewImg}
                    alt="preview"
                  />
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeImage(index)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <label className={styles.uploadPlaceholder}>
                <UploadCloud size={24} />
                <span>{previews.length ? "Add Image" : "Upload Images"}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className={styles.formSection}>
            <div className={styles.inputRow}>
              {/* Size Multi-select */}
              <div className={styles.inputGroup}>
                <label className={styles.fieldLabel}>Size</label>
                <div className={styles.multiSelectWrapper} ref={dropdownRef}>
                  <div
                    className={styles.selectBox}
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    {variation.size.length > 0
                      ? variation.size.join(", ")
                      : "Select Sizes"}
                  </div>
                  {isOpen && (
                    <div className={styles.dropdown}>
                      {/* Standard Sizes Section */}
                      <div className={styles.sizeCategory}>
                        <div className={styles.categoryTitle}>
                          Standard Sizes
                        </div>
                        {sizeOptions.map((size) => (
                          <label key={size} className={styles.option}>
                            <input
                              type="checkbox"
                              checked={variation.size.includes(size)}
                              onChange={() => {
                                const updated = variation.size.includes(size)
                                  ? variation.size.filter((s) => s !== size)
                                  : [...variation.size, size];
                                setVariation({ ...variation, size: updated });
                              }}
                            />
                            {size}
                          </label>
                        ))}
                      </div>
                      {/* Numerical Sizes Section */}
                      <div className={styles.sizeCategory}>
                        <div className={styles.categoryTitle}>
                          Numerical Sizes
                        </div>
                        {numericalSizes.map((size) => (
                          <label key={size} className={styles.option}>
                            <input
                              type="checkbox"
                              checked={variation.size.includes(size)}
                              onChange={() => {
                                const updated = variation.size.includes(size)
                                  ? variation.size.filter((s) => s !== size)
                                  : [...variation.size, size];
                                setVariation({ ...variation, size: updated });
                              }}
                            />
                            {size}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Color */}
              <div className={styles.inputGroup}>
                <label className={styles.fieldLabel}>Color</label>
                <div className={styles.colorInputContainer}>
                  <select
                    className={styles.colorDropdown}
                    value={variation.color}
                    onChange={(e) =>
                      setVariation({ ...variation, color: e.target.value })
                    }
                  >
                    <option value="">Select a color</option>
                    {colorOptions.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                    <option value="" disabled>
                      ─────────────
                    </option>
                    <option value="" disabled>
                      Custom:
                    </option>
                  </select>
                  <input
                    type="text"
                    placeholder="or type custom color"
                    className={styles.inputField}
                    value={variation.color}
                    onChange={(e) =>
                      setVariation({ ...variation, color: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label className={styles.fieldLabel}>Cost Price (₹)</label>
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
                <label className={styles.fieldLabel}>Selling Price (₹)</label>
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
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.fieldLabel}>Weight (g)</label>
              <input
                type="number"
                className={styles.inputField}
                placeholder="e.g. 500"
                value={variation.weight}
                onChange={(e) =>
                  setVariation({ ...variation, weight: e.target.value })
                }
              />
            </div>

            <div className={styles.actionRow}>
              <button
                className={styles.addToListBtn}
                onClick={handleAddToList}
                disabled={loading}
              >
                {loading ? (
                  "Adding..."
                ) : (
                  <>
                    <span>+</span> Add to List
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Existing Variants Table */}
      <section className={styles.variantsCard}>
        <div className={styles.variantsHeader}>
          <h3>Existing Variants ({variants.length})</h3>
        </div>

        {variants.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No variants yet. Add one above.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className={styles.variantsTable}>
              <thead>
                <tr>
                  <th>IMAGE</th>
                  <th>SKU</th>
                  <th>SIZE</th>
                  <th>COLOR</th>
                  <th>COST</th>
                  <th>SELLING PRICE</th>
                  <th style={{ textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr
                    key={
                      variant.id ??
                      variant._tempId ??
                      `${variant.sku}-${variant.size}`
                    }
                  >
                    <td>
                      <div className={styles.tableImgWrapper}>
                        <img
                          src={getVariantPrimaryImage(variant)}
                          className={styles.placeholderImg}
                          alt={variant.sku}
                        />
                      </div>
                    </td>
                    <td className={styles.skuText}>{variant.sku}</td>
                    <td className={styles.sizeText}>
                      <span className={styles.sizeBadge}>{variant.size}</span>
                    </td>
                    <td>
                      <div className={styles.colorWrapper}>
                        <span
                          className={styles.colorDot}
                          style={{
                            background:
                              variant.color?.toLowerCase() === "white"
                                ? "#e2e8f0"
                                : variant.color?.toLowerCase() || "#cbd5e1",
                            border: "1px solid #e2e8f0",
                          }}
                        />
                        {variant.color}
                      </div>
                    </td>
                    <td className={styles.priceText}>
                      ${Number(variant.costPrice).toFixed(2)}
                    </td>
                    <td className={styles.sellingPriceText}>
                      ${Number(variant.sellingPrice).toFixed(2)}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.editBtn}
                          onClick={() => openEditModal(variant)}
                          title="Edit variant"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteClick(variant)}
                          title="Delete variant"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className={styles.mobileVariantList}>
              {variants.map((variant) => (
                <div
                  key={
                    variant.id ??
                    variant._tempId ??
                    `${variant.sku}-${variant.size}`
                  }
                  className={styles.mobileVariantCard}
                >
                  <div className={styles.mobileVariantTop}>
                    <div className={styles.mobileImgWrapper}>
                      <img
                        src={getVariantPrimaryImage(variant)}
                        alt={variant.sku}
                      />
                    </div>
                    <div className={styles.mobileVariantInfo}>
                      <span className={styles.mobileSkuText}>
                        {variant.sku}
                      </span>
                      <div className={styles.mobileMetaRow}>
                        <span className={styles.sizeBadge}>{variant.size}</span>
                        <div className={styles.colorWrapper}>
                          <span
                            className={styles.colorDot}
                            style={{
                              background:
                                variant.color?.toLowerCase() === "white"
                                  ? "#e2e8f0"
                                  : variant.color?.toLowerCase() || "#cbd5e1",
                              border: "1px solid #e2e8f0",
                            }}
                          />
                          {variant.color}
                        </div>
                      </div>
                      <div className={styles.mobilePriceRow}>
                        <span className={styles.mobilePriceLabel}>
                          Cost:{" "}
                          <strong>
                            ${Number(variant.costPrice).toFixed(2)}
                          </strong>
                        </span>
                        <span className={styles.mobilePriceLabel}>
                          Price:{" "}
                          <strong className={styles.sellingPriceText}>
                            ${Number(variant.sellingPrice).toFixed(2)}
                          </strong>
                        </span>
                      </div>
                    </div>
                    <div className={styles.mobileActions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => openEditModal(variant)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteClick(variant)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Edit Variant Modal */}
      {editModalOpen && editingVariant && (
        <div
          className={styles.modalOverlay}
          onClick={() => setEditModalOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Edit Variant</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setEditModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Variant Image */}
            <div className={styles.modalImageSection}>
              <label className={styles.fieldLabel}>Variant Images</label>
              <div className={styles.modalUploadGrid}>
                {editPreviews.map((preview, index) => (
                  <div
                    key={`${preview}-${index}`}
                    className={styles.previewWrapper}
                  >
                    <img
                      src={preview}
                      className={styles.previewImg}
                      alt="edit preview"
                    />
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeEditImage(index)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className={styles.uploadPlaceholder}>
                  <UploadCloud size={20} />
                  <span>{editPreviews.length ? "Add Image" : "Upload Images"}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleEditImageUpload}
                    hidden
                  />
                </label>
              </div>
            </div>

            {/* Fields */}
            <div className={styles.modalFields}>
              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Size</label>
                  <select
                    className={styles.inputField}
                    value={editingVariant.size}
                    onChange={(e) =>
                      setEditingVariant({
                        ...editingVariant,
                        size: e.target.value,
                      })
                    }
                  >
                    <option value="">Select a size</option>
                    <optgroup label="Standard Sizes">
                      {sizeOptions.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Numerical Sizes">
                      {numericalSizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Color</label>
                  <div className={styles.colorInputContainer}>
                    <select
                      className={styles.colorDropdown}
                      value={editingVariant.color}
                      onChange={(e) =>
                        setEditingVariant({
                          ...editingVariant,
                          color: e.target.value,
                        })
                      }
                    >
                      <option value="">Select a color</option>
                      {colorOptions.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                      <option value="" disabled>
                        ─────────────
                      </option>
                      <option value="" disabled>
                        Custom:
                      </option>
                    </select>
                    <input
                      className={styles.inputField}
                      placeholder="or type custom color"
                      value={editingVariant.color}
                      onChange={(e) =>
                        setEditingVariant({
                          ...editingVariant,
                          color: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Cost Price (₹)</label>
                  <input
                    type="number"
                    className={styles.inputField}
                    value={editingVariant.costPrice}
                    onChange={(e) =>
                      setEditingVariant({
                        ...editingVariant,
                        costPrice:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Selling Price (₹)</label>
                  <input
                    type="number"
                    className={styles.inputField}
                    value={editingVariant.sellingPrice}
                    onChange={(e) =>
                      setEditingVariant({
                        ...editingVariant,
                        sellingPrice:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className={styles.modalField}>
                <label className={styles.fieldLabel}>Weight (g)</label>
                <input
                  type="number"
                  className={styles.inputField}
                  value={editingVariant.weight || ""}
                  onChange={(e) =>
                    setEditingVariant({
                      ...editingVariant,
                      weight:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.modalCancelBtn}
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className={styles.modalSaveBtn}
                onClick={handleEditSave}
                disabled={editLoading}
              >
                {editLoading ? (
                  "Saving..."
                ) : (
                  <>
                    <Check size={15} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmOpen}
        productName={`${variantToDelete?.sku} - ${variantToDelete?.size} - ${variantToDelete?.color}`}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
