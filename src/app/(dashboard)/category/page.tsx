"use client";

import React, { useEffect, useState } from "react";
import styles from "./category.module.css";

import { getCategories } from "@/services/category.service";
import { Category } from "@/types/category";


export default function CategoryPage() {

  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {

  const fetchCategories = async () => {
    const data = await getCategories();
    setCategories(data);
  };

  fetchCategories();

}, []);
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1>Store Categories</h1>
          <p>Organize your inventory with high-level classifications</p>
        </div>
        <button className={styles.createButton}>
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
    </div>
  );
}