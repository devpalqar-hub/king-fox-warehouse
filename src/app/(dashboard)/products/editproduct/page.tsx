import React from 'react';
import styles from './editpage.module.css';
import { ArrowLeft, Info ,FileText,ImageIcon, PlusCircle, Upload,Layers, Plus, Settings} from "lucide-react";
export default function EditProductPage() {
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
              <input type="text" defaultValue="Premium Cotton Essential Tee" />
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea defaultValue="The ultimate everyday t-shirt. Crafted from 100% long-staple cotton for an incredibly soft feel and lasting durability." />
            </div>
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label>Brand</label>
                <input type="text" defaultValue="Essentials Co." />
              </div>
              <div className={styles.formGroup}>
                <label>Category</label>
                <select defaultValue="T-Shirts">
                  <option>T-Shirts</option>
                </select>
              </div>
            </div>
          </section>

        
          {/* Media Management */}
        <section className={styles.card}>
            <div className={styles.mediaHeader}>
                <div className={styles.mediaTitle}>
                <ImageIcon size={20} className={styles.icon}/>
                <h3>Media Management</h3>
                </div>

                <button className={styles.addImageBtn}>
                <PlusCircle size={16}/>
                Add Image
                </button>
            </div>

            <div className={styles.mediaGrid}>

                <div className={`${styles.mediaThumb} ${styles.activeThumb}`}>
                <span className={styles.badge}>MAIN</span>
                <img src="/images/product1.jpg" alt="product"/>
                </div>

                <div className={styles.mediaThumb}>
                <img src="/images/product2.jpg" alt="product"/>
                </div>

                <div className={styles.mediaThumb}>
                <img src="/images/product3.jpg" alt="product"/>
                </div>

                <div className={styles.uploadBox}>
                <Upload size={28}/>
                <span>Upload Media</span>
                </div>
            </div>
        </section>
        {/* Product Variants */}
<section className={styles.card}>

  <div className={styles.variantHeader}>
    <div className={styles.variantTitle}>
      <Layers size={20} className={styles.icon}/>
      <h3>Product Variants</h3>
    </div>

    <button className={styles.addVariantBtn}>
      <Plus size={16}/>
      Add Variant
    </button>
  </div>

  <div className={styles.variantTable}>

    <div className={styles.variantHead}>
      <span>Color</span>
      <span>Size</span>
      <span>SKU</span>
      <span>Price</span>
      <span>Stock</span>
      <span>Status</span>
    </div>


    {/* ROW 1 */}
    <div className={styles.variantRow}>
      <div className={styles.colorCell}>
        <span className={styles.colorWhite}></span>
        White
      </div>

      <span>Small</span>
      <span className={styles.sku}>TSH-WHI-SM</span>

      <input className={styles.priceInput} defaultValue="$ 29.00"/>

      <input className={styles.stockInput} defaultValue="45"/>

      <select className={styles.statusSelect}>
        <option>In Stock</option>
        <option>Low Stock</option>
        <option>Out of Stock</option>
      </select>
    </div>


    {/* ROW 2 */}
    <div className={styles.variantRow}>
      <div className={styles.colorCell}>
        <span className={styles.colorWhite}></span>
        White
      </div>

      <span>Medium</span>
      <span className={styles.sku}>TSH-WHI-MD</span>

      <input className={styles.priceInput} defaultValue="$ 29.00"/>

      <input className={styles.stockInput} defaultValue="12"/>

      <select className={styles.statusSelect}>
        <option>Low Stock</option>
        <option>In Stock</option>
        <option>Out of Stock</option>
      </select>
    </div>


    {/* ROW 3 */}
    <div className={styles.variantRow}>
      <div className={styles.colorCell}>
        <span className={styles.colorBlack}></span>
        Black
      </div>

      <span>Large</span>
      <span className={styles.sku}>TSH-BLK-LG</span>

      <input className={styles.priceInput} defaultValue="$ 32.00"/>

      <input className={styles.stockInput} defaultValue="0"/>

      <select className={styles.statusSelect}>
        <option>Out of Stock</option>
        <option>In Stock</option>
        <option>Low Stock</option>
      </select>
    </div>

  </div>

  <div className={styles.manageVariants}>
    <Settings size={16}/>
    Manage All Variations
  </div>

</section>
    </div>
        {/* Right Column */}
        <div className={styles.rightCol}>

        {/* Detailed Specs */}
        <section className={styles.card}>
            <div className={styles.cardHeader}>
            <FileText size={20} className={styles.icon}/>
            <h3>Detailed Specs</h3>
            </div>

            <div className={styles.formGroup}>
            <label>Material & Fabric</label>

            <div className={styles.richTextEditor}>
                <div className={styles.toolbar}>
                <b>B</b>
                <i>I</i>
                ☰
                </div>

                <textarea placeholder="e.g. 100% Organic Cotton..." />
            </div>
            </div>

            <div className={styles.formGroup}>
            <label>Size Guide</label>
            <textarea placeholder="Insert sizing dimensions..." />
            </div>

            <div className={styles.formGroup}>
            <label>Care Instructions</label>
            <textarea placeholder="e.g. Machine wash cold..." />
            </div>
        </section>


        {/* Publishing Status */}
        <section className={styles.card}>
            <h3 className={styles.publishTitle}>Publishing Status</h3>

            <div className={styles.statusRow}>
            <span>Visibility</span>
            <span className={styles.activeBadge}>Active</span>
            </div>

            <div className={styles.statusRow}>
            <span>Inventory Management</span>
            <label className={styles.switch}>
                <input type="checkbox" defaultChecked />
                <span className={styles.slider}></span>
            </label>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.timestamp}>
            <label>CREATED ON</label>
            <p>Oct 24, 2023, 10:45 AM</p>
            </div>
        </section> 
       </div>
      </div>
    </div>
  );
}