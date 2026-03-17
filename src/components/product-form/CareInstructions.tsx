"use client";

import { ShieldCheck, Eraser } from "lucide-react";
import styles from "@/app/(dashboard)/products/addproduct/addproduct.module.css";
import RichTextEditor from "@/components/editor/RichTextEditor";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function CareInstructions({ value, onChange }: Props) {

  return (
    <section className={styles.formCard}>

      <div className={styles.sectionTitle}>
        <div className={styles.iconCircle}>
          <ShieldCheck size={18}/>
        </div>
        <h2>6. Care Instructions</h2>
      </div>

      <div className={styles.careContainer}>

        <div className={styles.careHeader}>
          <span className={styles.careLabel}>CARE INSTRUCTIONS</span>

          <div className={styles.careToolbar}>
            <Eraser size={16}/>
          </div>

        </div>

        <div className={styles.careContent}>

          <RichTextEditor
            value={value}
            onChange={onChange}
          />

        </div>

      </div>

    </section>
  );
}