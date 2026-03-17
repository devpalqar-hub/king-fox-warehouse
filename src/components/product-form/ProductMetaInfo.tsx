"use client";

import { FileText, Bold, Italic, List, Link } from "lucide-react";
import styles from "@/app/(dashboard)/products/addproduct/addproduct.module.css";
import RichTextEditor from "@/components/editor/RichTextEditor";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function ProductMetaInfo({ value, onChange }: Props) {
  return (
    <section className={styles.formCard}>
      <div className={styles.sectionTitle}>
        <div className={styles.iconCircle}>
          <FileText size={18}/>
        </div>
        <h2>3. Product Meta Information</h2>
      </div>

      <div className={styles.editorContainer}>
        <div className={styles.editorHeader}>
          <span className={styles.editorLabel}>PRODUCT DETAILS</span>

          <div className={styles.editorToolbar}>
            <Bold size={16}/>
            <Italic size={16}/>
            <List size={16}/>
            <Link size={16}/>
          </div>
        </div>

        <div className={styles.editorContent}>
          <RichTextEditor
            value={value}
            onChange={onChange}
          />
        </div>
      </div>
    </section>
  );
}