'use client'
import styles from './editpage.module.css';
import { useParams } from "next/navigation";
import { getVariantsByProductId } from "@/services/product-create.service";
import { updateProduct } from "@/services/product-create.service";
import { useEffect,useState} from "react";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { getBrands } from "@/services/brand.service";
import { getProductById,getCategories } from "@/services/product-create.service";
import { ArrowLeft, Info ,FileText,ImageIcon, PlusCircle, Upload,Layers, Plus, Settings} from "lucide-react";
import { uploadImagesToS3 } from "@/services/upload.service";
import { deleteImageFromS3 } from "@/services/upload.service";
export default function EditProductPage() {
  
const params = useParams();
const productId = params.id;
const [variants, setVariants] = useState<any[]>([]);
const [categories, setCategories] = useState<any[]>([]);
const [brands, setBrands] = useState<any[]>([]);
const [imageFiles, setImageFiles] = useState<File[]>([]);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const data = await getCategories();

      // ✅ remove duplicates by name
      const unique = Array.from(
        new Map(data.map((c: any) => [c.name, c])).values()
      );

      setCategories(unique);

    } catch (err) {
      console.error(err);
    }
  };

  fetchCategories();
}, []);

useEffect(() => {
  const fetchBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchBrands();
}, []);


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
const [form, setForm] = useState({
  name: "",
  description: "",
  brandId: "",
  categoryId: "",
  images: [] as string[],
  metaInfo: [] as any[],
  tagIds: [] as number[],
  variants: variants
});

const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;

  const fileArray = Array.from(files);

  setImageFiles((prev) => [...prev, ...fileArray]);

  // preview immediately
  const previews = fileArray.map((file) => URL.createObjectURL(file));

  setForm((prev) => ({
    ...prev,
    images: [...prev.images, ...previews],
  }));
};

useEffect(() => {
  const fetchProduct = async () => {
    if (!productId) return;

    try {
      const data = await getProductById(Number(productId));

      setForm({
            name: data.name || "",
            description: data.description || "",
            brandId: data.brandId || "",
            categoryId: data.categoryId || "",
            images: data.images || [],
            metaInfo: data.metaInfo || [],
            tagIds: data.tagIds || [],
            variants: [] as any[]
        });

    } catch (err) {
      console.error(err);
    }
  };

  fetchProduct();
}, [productId]);

const handleUpdate = async () => {
  if (!productId) return;

  try {
    let finalImages = [...form.images];

    // 🔥 upload new images (only if selected)
    if (imageFiles.length) {
      const uploadedUrls = await uploadImagesToS3(imageFiles);

      // ❌ remove blob preview URLs
      finalImages = finalImages.filter((img) => !img.startsWith("blob:"));

      // ✅ add S3 URLs
      finalImages = [...finalImages, ...uploadedUrls];
    }

    const payload = {
      name: form.name,
      description: form.description,
      brandId: Number(form.brandId),
      categoryId: Number(form.categoryId),
      images: finalImages, // ✅ FINAL FIX
      metaInfo: form.metaInfo,
      tagIds: form.tagIds
    };

    await updateProduct(Number(productId), payload);

    alert("Product updated successfully ✅");

  } catch (err: any) {
    console.error(err);
    alert(err.message);
  }
};

const getMetaValue = (title: string) => {
  return (
    form.metaInfo.find((m) =>
      m.title.toLowerCase().includes(title.toLowerCase())
    )?.text || ""
  );
};
const htmlToText = (html: string) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};
const textToHtml = (text: string) => {
  return `<p>${text}</p>`;
};
const updateMetaValue = (title: string, value: string) => {
  const updated = [...form.metaInfo];

  const index = updated.findIndex((m) =>
    m.title.toLowerCase().includes(title.toLowerCase())
  );

  const htmlValue = textToHtml(value);

  if (index !== -1) {
    updated[index].text = htmlValue;
  } else {
    updated.push({
      title,
      text: htmlValue,
      imageUrl: ""
    });
  }

  setForm({ ...form, metaInfo: updated });
};

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <a href="/products" className={styles.backLink}>
            <ArrowLeft size={16}/> Back to Products
          </a>
          <h1 className={styles.title}>Edit Product</h1>
          <p className={styles.subtitle}>
            ID: PROD-88291 • Last updated 2 hours ago
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary}>View on Store</button>
          <button className={styles.btnDanger}>Archive</button>
        </div>
      </header>

      <div className={styles.mainGrid}>
        {/* Left Column */}
        <div className={styles.leftCol}>
          
          {/* Basic Information */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <Info size={18} className={styles.icon}/>
              <h3>Basic Information</h3>
            </div>
            <div className={styles.formGroup}>
              <label>Product Name</label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
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
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Brand</label>

                <select
                    value={String(form.brandId)}
                    onChange={(e) =>
                    setForm({ ...form, brandId: e.target.value })
                    }
                >
                    <option value="">Select Brand</option>

                    {brands.map((brand) => (
                    <option key={brand.id} value={String(brand.id)}>
                        {brand.name}
                    </option>
                    ))}
                </select>
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
            </div>
          </section>

        
          {/* Media Management */}
    <section className={styles.card}>
  <div className={styles.mediaHeader}>
    <div className={styles.mediaTitle}>
      <ImageIcon size={20} className={styles.icon}/>
      <h3>Media Management</h3>
    </div>

    {/* Add Image Input */}
    <input
      type="text"
      placeholder="Paste image URL & press Enter"
      className={styles.imageInput}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const value = (e.target as HTMLInputElement).value;

          if (!value) return;

          setForm((prev) => ({
            ...prev,
            images: [...prev.images, value],
          }));

          (e.target as HTMLInputElement).value = "";
        }
      }}
    />
  </div>

  <div className={styles.mediaGrid}>
    
    {/* ✅ Dynamic Images */}
    {form.images.map((img, index) => (
      <div
        key={index}
        className={`${styles.mediaThumb} ${
          index === 0 ? styles.activeThumb : ""
        }`}
      >
        {index === 0 && <span className={styles.badge}>MAIN</span>}

        <img src={img} alt="product" />

        <button
        className={styles.removeBtn}
        onClick={async () => {
            const imgUrl = form.images[index];

            try {
            // 🔥 delete from S3 only if it's real image
            if (!imgUrl.startsWith("blob:")) {
                await deleteImageFromS3(imgUrl);
            }

            // ✅ remove from UI
            setForm((prev) => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index),
            }));

            // ✅ remove from file state
            setImageFiles((prev) => prev.filter((_, i) => i !== index));

            } catch (err) {
            console.error(err);
            alert("Failed to delete image");
            }
        }}
        >
        ✕
        </button>
      </div>
    ))}

    {/* ✅ Upload Placeholder (UI only) */}
    <label className={styles.uploadBox}>
    <Upload size={28}/>
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
    <FileText size={20} className={styles.icon}/>
    <h3>Detailed Specs</h3>
  </div>

  {/* 🔹 MATERIAL */}
  {(() => {
    const material = form.metaInfo.find((m) =>
      m.title.toLowerCase().includes("material")
    );

    return (
      <div className={styles.formGroup}>
        
        {/* Editable Title */}
        <input
          className={styles.metaTitleInput}
          value={material?.title || "Material"}
          onChange={(e) => {
            const updated = [...form.metaInfo];
            const index = updated.findIndex((m) =>
              m.title.toLowerCase().includes("material")
            );

            if (index !== -1) {
              updated[index].title = e.target.value;
            } else {
              updated.push({
                title: e.target.value,
                text: "",
                imageUrl: ""
              });
            }

            setForm({ ...form, metaInfo: updated });
          }}
        />

        {/* TipTap Editor */}
        <RichTextEditor
          value={material?.text || ""}
          onChange={(val) => {
            const updated = [...form.metaInfo];
            const index = updated.findIndex((m) =>
              m.title.toLowerCase().includes("material")
            );

            if (index !== -1) {
              updated[index].text = val;
            } else {
              updated.push({
                title: "Material",
                text: val,
                imageUrl: ""
              });
            }

            setForm({ ...form, metaInfo: updated });
          }}
        />
      </div>
    );
  })()}

  {/* 🔹 SIZE GUIDE */}
  {(() => {
    const size = form.metaInfo.find((m) =>
      m.title.toLowerCase().includes("size")
    );

    return (
      <div className={styles.formGroup}>
        <input
            className={styles.metaTitleInput} 
          value={size?.title || "Size Guide"}
          onChange={(e) => {
            const updated = [...form.metaInfo];
            const index = updated.findIndex((m) =>
              m.title.toLowerCase().includes("size")
            );

            if (index !== -1) {
              updated[index].title = e.target.value;
            } else {
              updated.push({
                title: e.target.value,
                text: "",
                imageUrl: ""
              });
            }

            setForm({ ...form, metaInfo: updated });
          }}
        />

        <RichTextEditor
          value={size?.text || ""}
          onChange={(val) => {
            const updated = [...form.metaInfo];
            const index = updated.findIndex((m) =>
              m.title.toLowerCase().includes("size")
            );

            if (index !== -1) {
              updated[index].text = val;
            } else {
              updated.push({
                title: "Size Guide",
                text: val,
                imageUrl: ""
              });
            }

            setForm({ ...form, metaInfo: updated });
          }}
        />
      </div>
    );
  })()}

  {/* 🔹 CARE */}
  {(() => {
    const care = form.metaInfo.find((m) =>
      m.title.toLowerCase().includes("care")
    );

    return (
      <div className={styles.formGroup}>
        <input
          className={styles.metaTitleInput} 
          value={care?.title || "Care Instructions"}
          onChange={(e) => {
            const updated = [...form.metaInfo];
            const index = updated.findIndex((m) =>
              m.title.toLowerCase().includes("care")
            );

            if (index !== -1) {
              updated[index].title = e.target.value;
            } else {
              updated.push({
                title: e.target.value,
                text: "",
                imageUrl: ""
              });
            }

            setForm({ ...form, metaInfo: updated });
          }}
        />

        <RichTextEditor
          value={care?.text || ""}
          onChange={(val) => {
            const updated = [...form.metaInfo];
            const index = updated.findIndex((m) =>
              m.title.toLowerCase().includes("care")
            );

            if (index !== -1) {
              updated[index].text = val;
            } else {
              updated.push({
                title: "Care Instructions",
                text: val,
                imageUrl: ""
              });
            }

            setForm({ ...form, metaInfo: updated });
          }}
        />
      </div>
    );
  })()}

</section>

        {/* Product Variants */}
<section className={styles.card}>

  <div className={styles.variantHeader}>
    <div className={styles.variantTitle}>
      <Layers size={20} className={styles.icon}/>
      <h3>Product Variants</h3>
    </div>

    <button className={styles.addVariantBtn}>
      <Plus size={16}/>
      Add Variant
    </button>
  </div>

  <div className={styles.variantTable}>

    <div className={styles.variantHead}>
      <span>Color</span>
      <span>Size</span>
      <span>SKU</span>
      <span>Price</span>
      <span>Status</span>
    </div>

    {/* ROW 1 */}
    {variants.map((v, i) => (
  <div key={i} className={styles.variantRow}>
    <div className={styles.colorCell}>
        <span className={styles.colorWhite}></span>
        {v.color}
</div>

    <span>{v.size}</span>
    <span className={styles.sku}>{v.sku}</span>

    <input
      className={styles.priceInput}
      value={v.price}
      onChange={(e) => {
        const updated = [...variants];
        updated[i].price = e.target.value;
        setVariants(updated);
      }}
    />



    <select
  className={styles.statusSelect}   // ✅ ADD THIS
  value={v.status}
  onChange={(e) => {
    const updated = [...variants];
    updated[i].status = e.target.value;
    setVariants(updated);
  }}
>
  <option>In Stock</option>
  <option>Low Stock</option>
  <option>Out of Stock</option>
</select>
  </div>
))}
  </div>

  <div className={styles.manageVariants}>
    <Settings size={16}/>
    Manage All Variations
  </div>

</section>
    </div>
   
      </div>
       <div className={styles.saveActions}>
        <button className={styles.btnCancel}>Cancel</button>
        <button className={styles.saveBtn} onClick={handleUpdate}>
            Save Changes
        </button>
        </div>
    </div>
    
  );
}