"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  Info,
  ChevronDown,
  X,
  Image,
  Plus,
  Bold,
  Italic,
  List,
  Link,
  FileText,
  Ruler,
  LayoutGrid,
  ShieldCheck,
  Eraser,
} from "lucide-react";
import styles from "./addproduct.module.css";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { getBrands } from "@/services/brand.service";
import { getCategories } from "@/services/category.service";
import { Brand } from "@/types/brand";
import { Category } from "@/types/category";

import { createProduct } from "@/services/product-create.service";
import { useRef } from "react";
import BackButton from "@/components/backButton/backButton";

export default function AddProductPage() {
  const router = useRouter();
  const [metaDescription, setMetaDescription] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [materialFabric, setMaterialFabric] = useState("");
  const [sizeGuide, setSizeGuide] = useState("");
  const [careInstructions, setCareInstructions] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const productEditor = useRef<any>(null);
  const materialEditor = useRef<any>(null);
  const sizeEditor = useRef<any>(null);
  const careEditor = useRef<any>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    const newImages = Array.from(files).map((file) =>
      URL.createObjectURL(file),
    );

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };
  const handleSaveProduct = async () => {
    if (!name || !brandId || !categoryId) {
      alert("Please fill required fields");
      return;
    }

    const payload = {
      name,
      description,
      brandId: Number(brandId),
      categoryId: Number(categoryId),
      images: [],
      metaInfo: [
        {
          title: "Product Details",
          text: metaDescription || "Product details",
          imageUrl: "",
        },
        {
          title: "Material & Fabric",
          text: materialFabric || "Material information",
          imageUrl: "",
        },
        {
          title: "Size Guide",
          text: sizeGuide || "Size guide",
          imageUrl: "",
        },
        {
          title: "Care Instructions",
          text: careInstructions || "Care instructions",
          imageUrl: "",
        },
      ],
      tagIds: [],
    };

    try {
      const product = await createProduct(payload);
      router.push(`/products/addvariation?productId=${product.id}`);
    } catch (err) {
      console.error("Create product error:", err);
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
          <p>
            List a new product in your digital storefront by filling out the
            details below.
          </p>
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
              <span className={styles.tag}>
                Premium <X size={14} />
              </span>
              <span className={styles.tag}>
                Cotton <X size={14} />
              </span>
              <span className={styles.tag}>
                Eco-friendly <X size={14} />
              </span>
              <input
                type="text"
                placeholder="Add tags..."
                className={styles.ghostInput}
              />
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
                  <X size={14} />
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
            Drag and drop to reorder images. Supported formats: JPG, PNG, WEBP
            (Max 5MB each)
          </p>
        </section>

        {/* 3. PRODUCT META INFORMATION */}
        <section className={styles.formCard}>
          <div className={styles.sectionTitle}>
            <div className={styles.iconCircle}>
              <FileText size={18} />
            </div>
            <h2>3. Product Meta Information</h2>
          </div>

          {/* PRODUCT DETAILS */}
          <div className={styles.metaCard}>
            <div className={styles.metaHeader}>
              <span>PRODUCT DETAILS</span>
              <div className={styles.metaToolbar}>
                <button
                  onClick={() =>
                    productEditor.current?.editor
                      .chain()
                      .focus()
                      .toggleBold()
                      .run()
                  }
                >
                  <Bold size={16} />
                </button>

                <button
                  onClick={() =>
                    productEditor.current?.editor
                      .chain()
                      .focus()
                      .toggleItalic()
                      .run()
                  }
                >
                  <Italic size={16} />
                </button>

                <button
                  onClick={() =>
                    productEditor.current?.editor
                      .chain()
                      .focus()
                      .toggleBulletList()
                      .run()
                  }
                >
                  <List size={16} />
                </button>

                <button
                  onClick={() => {
                    const url = prompt("Enter URL");
                    if (url)
                      productEditor.current?.editor
                        .chain()
                        .focus()
                        .setLink({ href: url })
                        .run();
                  }}
                >
                  <Link size={16} />
                </button>
              </div>
            </div>

            <RichTextEditor
              ref={productEditor}
              value={metaDescription}
              onChange={setMetaDescription}
            />
          </div>

          {/* MATERIAL & FABRIC */}
          <div className={styles.metaCard}>
            <div className={styles.metaHeader}>
              <span>MATERIAL & FABRIC</span>
              <div className={styles.metaToolbar}>
                <button
                  onClick={() =>
                    materialEditor.current?.editor
                      .chain()
                      .focus()
                      .toggleBold()
                      .run()
                  }
                >
                  <Bold size={16} />
                </button>

                <button
                  onClick={() =>
                    materialEditor.current?.editor
                      .chain()
                      .focus()
                      .toggleBulletList()
                      .run()
                  }
                >
                  <List size={16} />
                </button>

                <button
                  onClick={() => {
                    const url = prompt("Enter image URL");
                    if (url) {
                      materialEditor.current?.editor
                        .chain()
                        .focus()
                        .setImage({ src: url })
                        .run();
                    }
                  }}
                >
                  <Image size={16} />
                </button>
              </div>
            </div>

            <RichTextEditor
              ref={materialEditor}
              value={materialFabric}
              onChange={setMaterialFabric}
            />
          </div>

          {/* SIZE GUIDE */}
          <div className={styles.metaCard}>
            <div className={styles.metaHeader}>
              <span>SIZE GUIDE</span>
              <div className={styles.metaToolbar}>
                <button
                  onClick={() => {
                    sizeEditor.current?.editor
                      ?.chain()
                      .focus()
                      .insertTable({
                        rows: 3,
                        cols: 3,
                        withHeaderRow: true,
                      })
                      .run();
                  }}
                >
                  <LayoutGrid size={16} />
                </button>

                <button>
                  <Info size={16} />
                </button>
              </div>
            </div>

            <RichTextEditor
              ref={sizeEditor}
              value={sizeGuide}
              onChange={setSizeGuide}
            />
          </div>

          {/* CARE INSTRUCTIONS */}
          <div className={styles.metaCard}>
            <div className={styles.metaHeader}>
              <span>CARE INSTRUCTIONS</span>
              <div className={styles.metaToolbar}>
                <button
                  onClick={() =>
                    careEditor.current?.editor
                      .chain()
                      .focus()
                      .clearNodes()
                      .unsetAllMarks()
                      .run()
                  }
                >
                  <Eraser size={16} />
                </button>
              </div>
            </div>

            <RichTextEditor
              ref={careEditor}
              value={careInstructions}
              onChange={setCareInstructions}
            />
          </div>
        </section>
        <section className={styles.bannerContainer}>
          {/* Left Side: Content */}
          <div className={styles.textGroup}>
            <h3 className={styles.title}>Ready to add variants?</h3>
            <p className={styles.subtitle}>
              You will be able to set prices, stock and sizes in the next step.
            </p>
          </div>

          {/* Right Side: Button */}
          <button className={styles.ctaButton} onClick={handleSaveProduct}>
            Save & Next: Variations
          </button>
        </section>
      </div>
    </>
  );
}
