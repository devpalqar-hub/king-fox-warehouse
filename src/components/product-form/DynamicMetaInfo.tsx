"use client";

import { Plus, X } from "lucide-react";
import styles from "@/app/(dashboard)/products/addproduct/addproduct.module.css";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { uploadSingleImageToS3 } from "@/services/upload.service";
import { deleteMediaFromS3 } from "@/services/upload.service";
export interface MetaItem {
  title: string;
  text: string;
  imageUrl: string;
}

interface Props {
  value: MetaItem[];
  onChange: (value: MetaItem[]) => void;
}

export default function DynamicMetaInfo({ value, onChange }: Props) {

  const addMeta = () => {
    onChange([...value, { title: "", text: "", imageUrl: "" }]);
  };

  const removeMeta = async (index: number) => {
  try {
    const imageUrl = value[index]?.imageUrl;

    if (imageUrl) {
      await deleteMediaFromS3(imageUrl);
    }

    onChange(value.filter((_, i) => i !== index));
  } catch (err) {
    console.error(err);
  }
};

  const updateMeta = (index: number, field: string, val: string) => {
    const updated = [...value];
    updated[index][field as keyof MetaItem] = val;
    onChange(updated);
  };


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

    onChange(
      value.map((item, i) =>
        i === index
          ? { ...item, imageUrl: uploadedUrl }
          : item
      )
    );

  } catch (err) {
    console.error(err);
  }
};
const handleRemoveMetaImage = async (index: number) => {
  try {
    const imageUrl = value[index].imageUrl;

    // Optional: delete from S3
    if (imageUrl) {
      await deleteMediaFromS3(imageUrl);
    }

    const updated = [...value];
    updated[index].imageUrl = "";

    onChange(updated);
  } catch (err) {
    console.error(err);
  }
};
  return (
    <section className={styles.formCard}>

      <div className={styles.sectionTitle}>
        <h2>3. Product Meta Information</h2>
      </div>

      {value.map((meta, index) => (
        <div key={index} className={styles.metaCard}>

          {/* HEADER */}
          <div className={styles.metaHeader}>
            <input
              className={styles.metaTitleInput}
              placeholder="Enter Title (Material, Size Guide...)"
              value={meta.title}
              onChange={(e) => updateMeta(index, "title", e.target.value)}
            />

            <button 
                className={styles.metaRemoveBtn}
                onClick={() => removeMeta(index)}
                >
                <X size={14}/>
                </button>
          </div>

          {/* TEXT */}
          <div className={styles.editorArea}>
            <RichTextEditor
              value={meta.text}
              onChange={(val) => updateMeta(index, "text", val)}
            />
          </div>

          {/* IMAGE */}
          <div className={styles.metaImage}>
  
  {/* Upload Input */}
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

  {/* Preview + Remove Button */}
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
        <X size={14} />
      </button>

    </div>
  )}
</div>

        </div>
      ))}

      {/* ADD BUTTON */}
      <button className={styles.addMetaBtn} onClick={addMeta}>
        <Plus size={18}/> Add Meta Section
      </button>

    </section>
  );
}