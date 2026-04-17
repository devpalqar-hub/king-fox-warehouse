"use client";
import styles from "./editpage.module.css";
import { useParams } from "next/navigation";
import {
  getVariantsByProductId,
  updateProduct,
  updateVariant,
  getProductById,
  getCategories,
} from "@/services/product-create.service";
import { useEffect, useState } from "react";
import DynamicMetaInfo from "@/components/product-form/DynamicMetaInfo";
import {
  ArrowLeft,
  Info,
  FileText,
  ImageIcon,
  Upload,
  Layers,
  Plus,
  X,
  Check,
  Pencil,
} from "lucide-react";
import {
  uploadImagesToS3,
  deleteImageFromS3,
  uploadSingleImageToS3,
} from "@/services/upload.service";
import { useToast } from "@/components/toast/ToastProvider";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

export default function EditProductPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const params = useParams();
  const productId = params.id;

  const [variants, setVariants] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [variantImageFile, setVariantImageFile] = useState<File | null>(null);
  const [variantImagePreview, setVariantImagePreview] = useState<string>("");
  const [variantEditLoading, setVariantEditLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    brandId: "",
    categoryId: "",
    images: [] as string[],
    metaInfo: [] as { title: string; text: string; imageUrl: string }[],
    tagIds: [] as number[],
    isFreeShipping: false,
    isOnlineAvailable: false,
  });

  // ── Fetch categories ──
  useEffect(() => {
    getCategories()
      .then((data) => {
        const unique = Array.from(
          new Map(data.map((c: any) => [c.name, c])).values(),
        );
        setCategories(unique);
      })
      .catch(console.error);
  }, []);

  // ── Fetch product ──
  useEffect(() => {
    if (!productId) return;
    getProductById(Number(productId)).then((data) => {
      setProduct(data);
      setForm({
        name: data?.name || "",
        description: data?.description || "",
        brandId: data?.brandId || "",
        categoryId: data?.categoryId || "",
        images: data?.images || [],
        metaInfo: (data?.metaInfo || []).map((m: any) => ({
          title: m.title || "",
          text: m.text || "",
          imageUrl: m.imageUrl || "",
        })),
        tagIds: data?.tagIds || [],
        isFreeShipping: data?.isFreeShipping ?? false,
        isOnlineAvailable: data?.isOnlineAvailable ?? false,
      });
    });
  }, [productId]);

  // ── Fetch variants ──
  useEffect(() => {
    if (!productId) return;
    getVariantsByProductId(Number(productId))
      .then((data) =>
        setVariants(
          data.map((v: any) => ({
            ...v,
            // Handle both camelCase and snake_case from backend
            costPrice: v.costPrice ?? v.cost_price ?? 0,
            sellingPrice: v.sellingPrice ?? v.selling_price ?? 0,
          })),
        ),
      )
      .catch(console.error);
  }, [productId]);

  const fixFileType = (file: File) => {
    if (!file.type || file.type === "application/octet-stream") {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const mimeMap: any = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        gif: "image/gif",
      };
      const correctType = mimeMap[ext || ""];
      if (correctType)
        return new File([file], file.name, { type: correctType });
    }
    return file;
  };

  const handleMetaImageUpload = async (index: number, file: File) => {
    try {
      const uploadedUrl = await uploadSingleImageToS3(fixFileType(file));
      const updated = [...form.metaInfo];
      updated[index].imageUrl = uploadedUrl;
      setForm((prev) => ({ ...prev, metaInfo: updated }));
    } catch {
      showToast("Image upload failed", "error");
    }
  };

  const handleRemoveMetaImage = async (index: number) => {
    try {
      const imageUrl = form.metaInfo[index].imageUrl;
      if (imageUrl) await deleteImageFromS3(imageUrl);
      const updated = [...form.metaInfo];
      updated[index].imageUrl = "";
      setForm((prev) => ({ ...prev, metaInfo: updated }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    setImageFiles((prev) => [...prev, ...fileArray]);
    const previews = fileArray.map((file) => URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...previews] }));
  };

  const handleUpdate = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      let finalImages = [...form.images];
      if (imageFiles.length) {
        const uploadedUrls = await uploadImagesToS3(imageFiles);
        finalImages = finalImages.filter((img) => !img.startsWith("blob:"));
        finalImages = [...finalImages, ...uploadedUrls];
      }
      await updateProduct(Number(productId), {
        name: form.name,
        description: form.description,
        categoryId: Number(form.categoryId),
        images: finalImages,
        metaInfo: form.metaInfo,
        tagIds: form.tagIds,
        isFreeShipping: form.isFreeShipping,
        isOnlineAvailable: form.isOnlineAvailable,
      });
      await Promise.all(
        variants.map((v) =>
          updateVariant(v.id, {
            sku: v.sku,
            size: v.size,
            color: v.color,
            costPrice: Number(v.costPrice),
            sellingPrice: Number(v.sellingPrice),
          }),
        ),
      );
      showToast("Product updated successfully", "success");
      router.push("/products");
    } catch (err: any) {
      showToast(err.message || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Open edit modal ──
  const openVariantModal = (v: any) => {
    setSelectedVariant({ ...v });
    setVariantImagePreview(v.image || "");
    setVariantImageFile(null);
    setIsModalOpen(true);
  };

  const handleVariantImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVariantImageFile(file);
    setVariantImagePreview(URL.createObjectURL(file));
  };

  const handleVariantSave = async () => {
    if (!selectedVariant) return;
    try {
      setVariantEditLoading(true);
      let imageUrl = selectedVariant.image || "";
      if (variantImageFile) {
        const uploaded = await uploadImagesToS3([variantImageFile]);
        imageUrl = uploaded[0];
      }
      const payload = {
        sku: selectedVariant.sku,
        size: selectedVariant.size,
        color: selectedVariant.color,
        costPrice: Number(selectedVariant.costPrice || 0),
        sellingPrice: Number(selectedVariant.sellingPrice || 0),
        weight: Number(selectedVariant.weight || 0),
        image: imageUrl,
      };
      const updated = await updateVariant(selectedVariant.id, payload);
      setVariants((prev) =>
        prev.map((v) =>
          v.id === selectedVariant.id ? { ...v, ...payload, ...updated } : v,
        ),
      );
      setIsModalOpen(false);
      showToast("Variant updated", "success");
    } catch (err: any) {
      showToast(err.message || "Update failed", "error");
    } finally {
      setVariantEditLoading(false);
    }
  };

  const handleVariantDelete = async (variantId: number) => {
    if (!confirm("Delete this variant?")) return;
    try {
      await deleteVariant(variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      showToast("Variant deleted", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to delete", "error");
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <a href="/products" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Products
          </a>
          <h1 className={styles.title}>Edit Product</h1>
          <p className={styles.subtitle}>
            ID: {productId} • Last updated recently
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.btnSecondary}
            onClick={() => {
              if (product?.slug) {
                const userSiteUrl =
                  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
                window.open(
                  `${userSiteUrl}/products/${product.slug}`,
                  "_blank",
                );
              } else {
                showToast("Product slug not available", "error");
              }
            }}
          >
            View on Store
          </button>
          {/* <button className={styles.btnDanger}>Archive</button> */}
        </div>
      </header>

      <div className={styles.mainGrid}>
        <div className={styles.leftCol}>
          {/* Basic Info */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <Info size={18} className={styles.icon} />
              <h3>Basic Information</h3>
            </div>
            <div className={styles.formGroup}>
              <label>Product Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div className={styles.formGroup}>
              <label>Category</label>
              <select
                value={String(form.categoryId)}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={form.isFreeShipping}
                  onChange={(e) =>
                    setForm({ ...form, isFreeShipping: e.target.checked })
                  }
                />
                <span>Free Shipping</span>
              </div>
              <p className={styles.checkboxDesc}>
                Enable this option to offer free shipping for this product.
              </p>
            </div>

            <div className={styles.formGroup}>
              <div className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={form.isOnlineAvailable}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isOnlineAvailable: e.target.checked,
                    })
                  }
                />
                <span>Online Available</span>
              </div>
              <p className={styles.checkboxDesc}>
                Enable this option to make the product available for online
                purchase.
              </p>
            </div>
          </section>

          {/* Media */}
          <section className={styles.card}>
            <div className={styles.mediaHeader}>
              <div className={styles.mediaTitle}>
                <ImageIcon size={20} className={styles.icon} />
                <h3>Media Management</h3>
              </div>
            </div>
            <div className={styles.mediaGrid}>
              {form.images.map((img, index) => (
                <div
                  key={index}
                  className={`${styles.mediaThumb} ${index === 0 ? styles.activeThumb : ""}`}
                >
                  {index === 0 && <span className={styles.badge}>MAIN</span>}
                  <img src={img} alt="product" />
                  <button
                    className={styles.removeBtn}
                    onClick={async () => {
                      try {
                        if (!img.startsWith("blob:"))
                          await deleteImageFromS3(img);
                        setForm((prev) => ({
                          ...prev,
                          images: prev.images.filter((_, i) => i !== index),
                        }));
                        setImageFiles((prev) =>
                          prev.filter((_, i) => i !== index),
                        );
                      } catch {
                        alert("Failed to delete image");
                      }
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <label className={styles.uploadBox}>
                <Upload size={28} />
                <span>Upload Media</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
              </label>
            </div>
          </section>

          {/* Detailed Specs */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <FileText size={20} className={styles.icon} />
              <h3>Detailed Specs</h3>
            </div>
            <DynamicMetaInfo
              value={form.metaInfo}
              onChange={(updatedMeta) =>
                setForm((prev) => ({ ...prev, metaInfo: updatedMeta }))
              }
            />
          </section>

          {/* Product Variants */}
          <section className={styles.card}>
            <div className={styles.variantHeader}>
              <div className={styles.variantTitle}>
                <Layers size={20} className={styles.icon} />
                <h3>Product Variants</h3>
              </div>
              <button
                className={styles.addVariantBtn}
                onClick={() => {
                  if (productId)
                    router.push(
                      `/products/addvariation?productId=${productId}`,
                    );
                }}
              >
                <Plus size={16} />
                Add Variant
              </button>
            </div>

            {variants.length === 0 ? (
              <p className={styles.emptyVariants}>
                No variants found. Click "Add Variant" to create one.
              </p>
            ) : (
              <>
                {/* Desktop Table */}
                <div className={styles.variantTable}>
                  <div className={styles.variantHead}>
                    <span>Image</span>
                    <span>Color</span>
                    <span>Size</span>
                    <span>SKU</span>
                    <span>Cost</span>
                    <span>Selling</span>
                    <span>Actions</span>
                  </div>

                  {variants.map((v, i) => (
                    <div key={v.id} className={styles.variantRow}>
                      {/* Image */}
                      <div className={styles.variantImgCell}>
                        <img
                          src={v.image || "/tshirt.png"}
                          alt={v.sku}
                          className={styles.variantThumb}
                        />
                      </div>

                      {/* Color */}
                      <div className={styles.colorCell}>
                        <span
                          className={styles.colorWhite}
                          style={{
                            background:
                              v.color?.toLowerCase() === "white"
                                ? "#f1f5f9"
                                : v.color?.toLowerCase() || "#e2e8f0",
                          }}
                        />
                        {v.color}
                      </div>

                      {/* Size */}
                      <span>
                        <span className={styles.sizePill}>{v.size}</span>
                      </span>

                      {/* SKU */}
                      <span className={styles.sku}>{v.sku}</span>

                      {/* Cost */}
                      <input
                        type="number"
                        placeholder="Cost"
                        className={styles.priceInput}
                        value={v.costPrice === "" ? "" : v.costPrice}
                        readOnly
                      />

                      {/* Selling */}
                      <input
                        type="number"
                        placeholder="Selling"
                        className={styles.priceInput}
                        value={v.sellingPrice ?? ""}
                        readOnly
                      />

                      {/* Actions */}
                      <div className={styles.actionCell}>
                        <button
                          className={styles.editIconBtn}
                          onClick={() => openVariantModal(v)}
                          title="Edit variant"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className={styles.deleteIconBtn}
                          onClick={() => handleVariantDelete(v.id)}
                          title="Delete variant"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile Variant Cards */}
                <div className={styles.mobileVariantList}>
                  {variants.map((v) => (
                    <div key={v.id} className={styles.mobileVariantCard}>
                      <div className={styles.mobileVariantRow}>
                        <div className={styles.mobileVariantImg}>
                          <img src={v.image || "/tshirt.png"} alt={v.sku} />
                        </div>
                        <div className={styles.mobileVariantInfo}>
                          <span className={styles.mobileSku}>{v.sku}</span>
                          <div className={styles.mobileMetaRow}>
                            <span className={styles.sizePill}>{v.size}</span>
                            <div
                              className={styles.colorCell}
                              style={{ gap: 6 }}
                            >
                              <span
                                className={styles.colorWhite}
                                style={{
                                  background:
                                    v.color?.toLowerCase() === "white"
                                      ? "#f1f5f9"
                                      : v.color?.toLowerCase() || "#e2e8f0",
                                }}
                              />
                              {v.color}
                            </div>
                          </div>
                          <div className={styles.mobilePrices}>
                            <span>
                              Cost: <b>₹{Number(v.costPrice).toFixed(2)}</b>
                            </span>
                            <span>
                              Sell: <b>₹{Number(v.sellingPrice).toFixed(2)}</b>
                            </span>
                          </div>
                        </div>
                        <div className={styles.mobileVariantActions}>
                          <button
                            className={styles.editIconBtn}
                            onClick={() => openVariantModal(v)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className={styles.deleteIconBtn}
                            onClick={() => handleVariantDelete(v.id)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      <div className={styles.saveActions}>
        <button
          className={styles.btnCancel}
          onClick={() => router.push("/products")}
        >
          Cancel
        </button>
        <button
          className={styles.saveBtn}
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* ── Variant Edit Modal ── */}
      {isModalOpen && selectedVariant && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Edit Variant</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Image upload */}
            <div className={styles.modalImageRow}>
              <div>
                <label className={styles.modalFieldLabel}>Variant Image</label>
                <div className={styles.modalImgUploadBox}>
                  {variantImagePreview ? (
                    <div className={styles.modalImgPreviewWrap}>
                      <img
                        src={variantImagePreview}
                        alt="variant"
                        className={styles.modalImgPreview}
                      />
                      <button
                        className={styles.modalImgRemoveBtn}
                        onClick={() => {
                          setVariantImagePreview("");
                          setVariantImageFile(null);
                          setSelectedVariant({ ...selectedVariant, image: "" });
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className={styles.modalImgUploadLabel}>
                      <Upload size={20} />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleVariantImageUpload}
                        hidden
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className={styles.modalImageRightInfo}>
                <p className={styles.modalImageHint}>
                  Upload a new image for this variant. Supported: JPG, PNG,
                  WEBP.
                </p>
                {selectedVariant.sku && (
                  <span className={styles.modalSkuBadge}>
                    SKU: {selectedVariant.sku}
                  </span>
                )}
              </div>
            </div>

            {/* Fields */}
            <div className={styles.modalFields}>
              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.modalFieldLabel}>Size</label>
                  <input
                    className={styles.modalInput}
                    value={selectedVariant.size}
                    onChange={(e) =>
                      setSelectedVariant({
                        ...selectedVariant,
                        size: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalFieldLabel}>Color</label>
                  <input
                    className={styles.modalInput}
                    value={selectedVariant.color}
                    onChange={(e) =>
                      setSelectedVariant({
                        ...selectedVariant,
                        color: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className={styles.modalRow}>
                <div className={styles.modalField}>
                  <label className={styles.modalFieldLabel}>
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    className={styles.modalInput}
                    value={selectedVariant.costPrice}
                    onChange={(e) =>
                      setSelectedVariant({
                        ...selectedVariant,
                        costPrice:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className={styles.modalField}>
                  <label className={styles.modalFieldLabel}>
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    className={styles.modalInput}
                    value={selectedVariant.sellingPrice}
                    onChange={(e) =>
                      setSelectedVariant({
                        ...selectedVariant,
                        sellingPrice:
                          e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className={styles.modalField}>
                <label className={styles.modalFieldLabel}>Weight (g)</label>
                <input
                  type="number"
                  className={styles.modalInput}
                  value={selectedVariant.weight || ""}
                  onChange={(e) =>
                    setSelectedVariant({
                      ...selectedVariant,
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
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className={styles.modalSaveBtn}
                onClick={handleVariantSave}
                disabled={variantEditLoading}
              >
                {variantEditLoading ? (
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
    </div>
  );
}
