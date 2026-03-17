"use client";

import { List, Bold, Image } from "lucide-react";
import styles from "@/app/(dashboard)/products/addproduct/addproduct.module.css";
import RichTextEditor from "@/components/editor/RichTextEditor";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function MaterialFabric({ value, onChange }: Props) {

  return (
    <section className={styles.formCard}>

      <div className={styles.sectionTitle}>
        <div className={styles.iconCircle}>
          <List size={18}/>
        </div>
        <h2>4. Material & Fabric</h2>
      </div>

      <div className={styles.materialEditor}>

        <div className={styles.materialHeader}>
          <span className={styles.materialLabel}>MATERIAL & FABRIC</span>

          <div className={styles.materialToolbar}>
            <Bold size={14}/>
            <List size={14}/>
            <Image size={14}/>
          </div>

        </div>

        <div className={styles.materialContent}>

          <RichTextEditor
            value={value}
            onChange={onChange}
          />

        </div>

      </div>

    </section>
  );
}