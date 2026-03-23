"use client";

import React, { useEffect, useState } from "react";
import styles from "./category.module.css";
import { createCategory } from "@/services/category.service";
import { getCategories } from "@/services/category.service";
import { Category } from "@/types/category";
import { useToast } from "@/components/toast/ToastProvider";

export default function CategoryPage() {
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {

  const fetchCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  fetchCategories();

}, []);

const handleCreateCategory = async () => {
  if (!newCategory.trim()) {
    return showToast("Enter category name", "error");
  }

  try {
    setLoading(true);

    const created = await createCategory(newCategory);

    setCategories(prev => [...prev, created]);

    setNewCategory("");
    setShowModal(false);

    showToast("Category created successfully ", "success");

  } catch (err) {
    console.error(err);
    showToast("Failed to create category ", "error");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1>Store Categories</h1>
          <p>Organize your inventory with high-level classifications</p>
        </div>
        <button
          className={styles.createButton}
          onClick={() => setShowModal(true)}
        >
          <span>+</span> Create Category
        </button>
      </header>

      <div className={styles.grid}>
        {categories.map((category) => (
          <div key={category.id} className={styles.card}>
            <h3>{category.name}</h3>
            <p>Category ID: {category.id}</p>
          </div>
        ))}
      </div>
      {showModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modal}>
      <h2>Create Category</h2>

      <input
        type="text"
        placeholder="Enter category name"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        className={styles.input}
      />

      <div className={styles.modalActions}>
        <button
          className={styles.cancelBtn}
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>

        <button
          className={styles.saveBtn}
          onClick={handleCreateCategory}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}