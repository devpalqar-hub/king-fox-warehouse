"use client";

import { Plus, X } from "lucide-react";
import styles from "@/app/(dashboard)/products/addproduct/addproduct.module.css";
import RichTextEditor from "@/components/editor/RichTextEditor";

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

  const removeMeta = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateMeta = (index: number, field: string, val: string) => {
    const updated = [...value];
    updated[index][field as keyof MetaItem] = val;
    onChange(updated);
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
            <input
              type="text"
              placeholder="Enter Image URL"
              value={meta.imageUrl}
              onChange={(e) => updateMeta(index, "imageUrl", e.target.value)}
            />
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