"use client";

import { Ruler, LayoutGrid, Info } from "lucide-react";
import styles from "@/app/(dashboard)/products/addproduct/addproduct.module.css";
import RichTextEditor from "@/components/editor/RichTextEditor";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SizeGuide({ value, onChange }: Props) {

  return (
    <section className={styles.formCard}>

      <div className={styles.sectionTitle}>
        <div className={styles.iconCircle}>
          <Ruler size={18}/>
        </div>
        <h2>5. Size Guide</h2>
      </div>

      <div className={styles.sizeGuideContainer}>

        <div className={styles.sizeGuideHeader}>
          <span className={styles.sizeGuideLabel}>SIZE GUIDE</span>

          <div className={styles.sizeGuideToolbar}>
            <LayoutGrid size={16}/>
            <Info size={16}/>
          </div>

        </div>

        <div className={styles.sizeGuideContent}>

          <RichTextEditor
            value={value}
            onChange={onChange}
          />

        </div>

      </div>

    </section>
  );
}