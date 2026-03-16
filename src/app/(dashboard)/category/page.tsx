import React from 'react';
import styles from './category.module.css';

interface Category {
  id: number;
  name: string;
  productCount: number;
}

const categories: Category[] = [
  { id: 1, name: 'T-Shirts', productCount: 120 },
  { id: 2, name: 'Sarees', productCount: 85 },
  { id: 3, name: 'Ethnic Wear', productCount: 150 },
  { id: 4, name: 'Footwear', productCount: 60 },
  { id: 5, name: 'Accessories', productCount: 210 },
  { id: 6, name: 'Home Decor', productCount: 45 },
];

export default function CategoryPage() {
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
            <p>{category.productCount} Products</p>
          </div>
        ))}
      </div>
    </div>
  );
}