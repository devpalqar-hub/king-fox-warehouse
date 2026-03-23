"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from 'react';
import { Info, ChevronDown, X,Image, Plus,Bold, Italic, List, Link ,FileText,Ruler, LayoutGrid,ShieldCheck, Eraser} from 'lucide-react';
import styles from './addproduct.module.css';
import { getBrands } from "@/services/brand.service";
import { getCategories } from "@/services/category.service";
import { Brand } from "@/types/brand";
import { Category } from "@/types/category";
import DynamicMetaInfo, { MetaItem } from "@/components/product-form/DynamicMetaInfo";
import { createProduct } from "@/services/product-create.service";
import { useRef } from "react"
import { uploadImagesToS3 } from "@/services/upload.service";
import BackButton from "@/components/backButton/backButton";

export default function AddProductPage() {
const router = useRouter();
const [name, setName] = useState("");
const [description, setDescription] = useState("");
const [brandId, setBrandId] = useState("");
const [categoryId, setCategoryId] = useState("");
const [brands, setBrands] = useState<Brand[]>([]);
const [categories, setCategories] = useState<Category[]>([]);
const [imageFiles, setImageFiles] = useState<File[]>([]);
const [images, setImages] = useState<string[]>([]); // preview

const [metaInfo, setMetaInfo] = useState<MetaItem[]>([
  { title: "", text: "", imageUrl: "" }
]);

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  const fileArray = Array.from(files);

  // store actual files
  setImageFiles(prev => [...prev, ...fileArray]);

  // preview
  const previewUrls = fileArray.map(file => URL.createObjectURL(file));
  setImages(prev => [...prev, ...previewUrls]);
};

const removeImage = (index: number) => {
  setImages((prev) => prev.filter((_, i) => i !== index));
};
const handleSaveProduct = async () => {
  if (!name || !brandId || !categoryId) {
    alert("Please fill required fields");
    return;
  }

  try {
    // ✅ STEP 1: Upload images first
    const uploadedImageUrls = await uploadImagesToS3(imageFiles);

    // ✅ STEP 2: Clean meta
    const cleanedMeta = metaInfo
      .filter(meta => meta.title || meta.text || meta.imageUrl)
      .map(meta => ({
        title: meta.title || "",
        text: meta.text || "",
        imageUrl: meta.imageUrl || ""
      }));

    // ✅ STEP 3: Create payload
    const payload = {
      name,
      description,
      brandId: Number(brandId),
      categoryId: Number(categoryId),
      images: uploadedImageUrls, // 🔥 real S3 URLs
      metaInfo: cleanedMeta,
      tagIds: []
    };

    // ✅ STEP 4: Create product
    const product = await createProduct(payload);

    router.push(`/products/addvariation?productId=${product.id}`);

  } catch (err: any) {
    console.error(err);
    alert(err.message || "Something went wrong");
  }
};
useEffect(() => {

  const fetchData = async () => {
    try {

      const brandData = await getBrands();
      const categoryData = await getCategories();

      setBrands(brandData);
      setCategories(categoryData);

    } catch (error) {
      console.error("Dropdown fetch error:", error);
    }
  };

  fetchData();

}, []);
  return (
    <>
    <div className={styles.container}>
      <BackButton />
      <header className={styles.header}>
        <h1>Create New Product</h1>
        <p>List a new product in your digital storefront by filling out the details below.</p>
      </header>

      <section className={styles.formCard}>
        <div className={styles.sectionTitle}>
          <div className={styles.iconCircle}>
            <Info size={18} />
          </div>
          <h2>1. Basic Information</h2>
        </div>

        <div className={styles.formGroup}>
          <label>Product Name</label>
          <input
            type="text"
            placeholder="UrbanFit Premium Cotton T-Shirt"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Short Description</label>
          <textarea
            placeholder="Experience ultimate comfort..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Brand</label>
            <div className={styles.selectWrapper}>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
              >
                <option value="">Select Brand</option>

                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}

              </select>
              <ChevronDown className={styles.selectIcon} size={18} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Category</label>
            <div className={styles.selectWrapper}>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}

              </select>
              <ChevronDown className={styles.selectIcon} size={18} />
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Tags</label>
          <div className={styles.tagInputContainer}>
            <span className={styles.tag}>Premium <X size={14} /></span>
            <span className={styles.tag}>Cotton <X size={14} /></span>
            <span className={styles.tag}>Eco-friendly <X size={14} /></span>
            <input type="text" placeholder="Add tags..." className={styles.ghostInput} />
          </div>
        </div>
      </section>
      {/* --- Section 2: Media & Gallery --- */}
      <section className={styles.formCard}>
        <div className={styles.sectionTitle}>
          <div className={styles.iconCircle}>
            <Image size={18} />
          </div>
          <h2>2. Media & Gallery</h2>
        </div>

        <div className={styles.galleryGrid}>

          {images.map((img, index) => (
            <div key={index} className={styles.imagePreview}>
              <button
                className={styles.removeBtn}
                onClick={() => removeImage(index)}
              >
                <X size={14}/>
              </button>

              <img src={img} alt="preview" />
            </div>
          ))}

          <label className={styles.addMoreButton}>
            <Plus size={24} />
            <span>Add More</span>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              hidden
            />
          </label>

        </div>

        <p className={styles.helpText}>
          Drag and drop to reorder images. Supported formats: JPG, PNG, WEBP (Max 5MB each)
        </p>
      </section>
    
      {/* 3. PRODUCT META INFORMATION */}
      <DynamicMetaInfo value={metaInfo} onChange={setMetaInfo} />


      <section className={styles.bannerContainer}>
        {/* Left Side: Content */}
        <div className={styles.textGroup}>
          <h3 className={styles.title}>Ready to add variants?</h3>
          <p className={styles.subtitle}>
            You will be able to set prices, stock and sizes in the next step.
          </p>
        </div>

        {/* Right Side: Button */}
        <button 
            className={styles.ctaButton}
            onClick={handleSaveProduct}
            >
            Save & Next: Variations
        </button>

      </section>
    </div>
    </>
  );
}