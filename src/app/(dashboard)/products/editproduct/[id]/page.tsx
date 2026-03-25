'use client'
import styles from './editpage.module.css';
import { useParams } from "next/navigation";
import { getVariantsByProductId } from "@/services/product-create.service";
import { updateProduct } from "@/services/product-create.service";
import { updateVariant } from "@/services/product-create.service";
import { useEffect,useState} from "react";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { getProductById,getCategories } from "@/services/product-create.service";
import { ArrowLeft, Info ,FileText,ImageIcon, PlusCircle, Upload,Layers, Plus, Settings} from "lucide-react";
import { uploadImagesToS3 } from "@/services/upload.service";
import { deleteImageFromS3 } from "@/services/upload.service";
import { useToast } from "@/components/toast/ToastProvider";
import { uploadSingleImageToS3 } from "@/services/upload.service";
import { useRouter } from "next/navigation";
export default function EditProductPage() {
  const router = useRouter();
const { showToast } = useToast();
const params = useParams();
const productId = params.id;
const [variants, setVariants] = useState<any[]>([]);
const [categories, setCategories] = useState<any[]>([]);
const [brands, setBrands] = useState<any[]>([]);
const [imageFiles, setImageFiles] = useState<File[]>([]);
const [loading, setLoading] = useState(false);

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

const fixFileType = (file: File) => {
  if (!file.type || file.type === "application/octet-stream") {
    const ext = file.name.split(".").pop()?.toLowerCase();

    const mimeMap: any = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif"
    };

    const correctType = mimeMap[ext || ""];

    if (correctType) {
      return new File([file], file.name, { type: correctType });
    }
  }
  return file;
};

const handleMetaImageUpload = async (index: number, file: File) => {
  try {
    const fixedFile = fixFileType(file);

    const uploadedUrl = await uploadSingleImageToS3(fixedFile);

    const updated = [...form.metaInfo];
    updated[index].imageUrl = uploadedUrl;

    setForm(prev => ({
      ...prev,
      metaInfo: updated
    }));

  } catch (err) {
    console.error(err);
    showToast("Image upload failed", "error");
  }
};
const handleRemoveMetaImage = async (index: number) => {
  try {
    const imageUrl = form.metaInfo[index].imageUrl;

    if (imageUrl) {
      await deleteImageFromS3(imageUrl);
    }

    const updated = [...form.metaInfo];
    updated[index].imageUrl = "";

    setForm(prev => ({
      ...prev,
      metaInfo: updated
    }));

  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  const fetchVariants = async () => {
    if (!productId) return;

    try {
      const data = await getVariantsByProductId(Number(productId));
      setVariants(
      data.map((v: any) => ({
        ...v,
        costPrice: v.costPrice ?? 0,
        sellingPrice: v.sellingPrice ?? 0
      }))
    );
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
  metaInfo: [] as {
    title: string;
    text: string;
    imageUrl: string;
  }[],
  tagIds: [] as number[],
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

    const data = await getProductById(Number(productId));

    setForm({
      name: data?.name || "",
      description: data?.description || "",
      brandId: data?.brandId || "",
      categoryId: data?.categoryId || "",
      images: data?.images || [],

      metaInfo: (data?.metaInfo || []).map((m: any) => ({
  title: m.title || "",
  text:
    m.text && m.text.trim() !== ""
      ? `<p>${m.text}</p>`
      : "<p></p>",
  imageUrl: m.imageUrl || ""
})),
      tagIds: data?.tagIds || [],
    });
  };

  fetchProduct();
}, [productId]);

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

    const payload = {
      name: form.name,
      description: form.description,      
      categoryId: Number(form.categoryId),
      images: finalImages,
      metaInfo: cleanedMeta.map((m) => ({
        ...m,
        text: htmlToText(m.text),
      })),
      tagIds: form.tagIds
    };

     await updateProduct(Number(productId), payload);
       // ✅ UPDATE VARIANTS (🔥 THIS YOU MISSED)
    await Promise.all(
  variants.map((v) =>
    updateVariant(v.id, {
      sku: v.sku,
      size: v.size,
      color: v.color,
      costPrice: Number(v.costPrice),
      sellingPrice: Number(v.sellingPrice),
    })
  )
);
    showToast("Product updated successfully ", "success");

  } catch (err: any) {
    console.error(err);
    showToast(err.message || "Update failed ", "error");
  } finally {
    setLoading(false);
  }
};

const getMetaValue = (title: string) => {
  return (
    form.metaInfo.find((m) =>
      m.title.toLowerCase().includes(title.toLowerCase())
    )?.text || ""
  );
};

const handleAddMeta = () => {
  setForm(prev => ({
    ...prev,
    metaInfo: [
      ...prev.metaInfo,
      { title: "", text: "<p></p>", imageUrl: "" }
    ]
  }));
};


const handleRemoveMeta = (index: number) => {
  setForm(prev => ({
    ...prev,
    metaInfo: prev.metaInfo.filter((_, i) => i !== index)
  }));
};

const handleMetaChange = (
  index: number,
  field: "title" | "text" | "imageUrl",
  value: string
) => {
  const updated = [...form.metaInfo];
  updated[index][field] = value;

  setForm(prev => ({
    ...prev,
    metaInfo: updated
  }));
};

const cleanedMeta = form.metaInfo;
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
         
          </section>

        
          {/* Media Management */}
    <section className={styles.card}>
  <div className={styles.mediaHeader}>
    <div className={styles.mediaTitle}>
      <ImageIcon size={20} className={styles.icon}/>
      <h3>Media Management</h3>
    </div>
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
  {/* Detailed Specs */}
<section className={styles.card}>
  <div className={styles.cardHeader}>
    <FileText size={20} className={styles.icon}/>
    <h3>Detailed Specs</h3>
  </div>

  {form.metaInfo.map((meta, index) => (
  <div key={index} className={styles.metaCard}>

    {/* HEADER */}
    <div className={styles.metaHeader}>
      <input
        className={styles.metaTitleInput}
        placeholder="Enter Title (Material, Size Guide...)"
        value={meta.title}
        onChange={(e) =>
          handleMetaChange(index, "title", e.target.value)
        }
      />

      <button
        className={styles.metaRemoveBtn}
        onClick={() => handleRemoveMeta(index)}
      >
        ✕
      </button>
    </div>

    {/* EDITOR */}
    <div className={styles.editorWrapper}>
      <RichTextEditor
        value={meta.text}
        onChange={(val) =>
          handleMetaChange(index, "text", val)
        }
      />
    </div>

    {/* IMAGE */}
    <div className={styles.metaImage}>

  {/* Upload */}
  <input
    type="file"
    accept="image/jpeg,image/png,image/webp,image/gif"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleMetaImageUpload(index, file);
      }
    }}
  />

  {/* Preview */}
  {meta.imageUrl && (
    <div className={styles.metaPreviewWrapper}>
      <img
        src={meta.imageUrl}
        alt="meta"
        className={styles.metaPreview}
      />

      <button
        type="button"
        className={styles.metaImageRemove}
        onClick={() => handleRemoveMetaImage(index)}
      >
        ✕
      </button>
    </div>
  )}

</div>

  </div>
))}

{/* ADD BUTTON */}
<button className={styles.addMetaBtn} onClick={handleAddMeta}>
  + Add Meta Section
</button>
</section>

        {/* Product Variants */}
<section className={styles.card}>

  <div className={styles.variantHeader}>
    <div className={styles.variantTitle}>
      <Layers size={20} className={styles.icon}/>
      <h3>Product Variants</h3>
    </div>

    <button
      className={styles.addVariantBtn}
      onClick={() => router.push("/products/addvariation")}
    >
      <Plus size={16}/>
      Add Variant
    </button>
  </div>

  <div className={styles.variantTable}>

    <div className={styles.variantHead}>
      <span>Color</span>
      <span>Size</span>
      <span>SKU</span>
      <span>Cost Price</span>
      <span>Selling Price</span>
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

   
  {/* COST PRICE */}
  <input
    type="number"
    placeholder="Cost"
    className={styles.priceInput}
    value={v.costPrice ?? ""}
    onChange={(e) => {
      const updated = [...variants];
      updated[i].costPrice = Number(e.target.value);
      setVariants(updated);
    }}
  />

  {/* SELLING PRICE */}
  <input
    type="number"
    placeholder="Selling"
    className={styles.priceInput}
    value={v.sellingPrice ?? ""}
    onChange={(e) => {
      const updated = [...variants];
      updated[i].sellingPrice = Number(e.target.value);
      setVariants(updated);
    }}
  />
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