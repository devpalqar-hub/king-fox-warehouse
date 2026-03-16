"use client"
import { useRouter } from "next/navigation";
import React from 'react';
import { Info, ChevronDown, X,Image, Plus,Bold, Italic, List, Link ,FileText,Ruler, LayoutGrid,ShieldCheck, Eraser} from 'lucide-react';
import styles from './addproduct.module.css';
export default function AddProductPage() {
  const router = useRouter();
  return (
    <>
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Create New Product</h1>
        <p>List a new product in your digital storefront by filling out the details below.</p>
      </header>

      <section className={styles.formCard}>
        <div className={styles.sectionTitle}>
          <div className={styles.iconCircle}>
            <Info size={18} />
          </div>
          <h2>1. Basic Information</h2>
        </div>

        <div className={styles.formGroup}>
          <label>Product Name</label>
          <input type="text" placeholder="UrbanFit Premium Cotton T-Shirt" />
        </div>

        <div className={styles.formGroup}>
          <label>Short Description</label>
          <textarea 
            placeholder="Experience ultimate comfort with our premium, ethically sourced cotton blend. Designed for the modern urban lifestyle."
            rows={4}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Brand</label>
            <div className={styles.selectWrapper}>
              <select defaultValue="ThreadCo">
                <option value="ThreadCo">ThreadCo</option>
              </select>
              <ChevronDown className={styles.selectIcon} size={18} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Category</label>
            <div className={styles.selectWrapper}>
              <select defaultValue="T-shirts">
                <option value="T-shirts">T-shirts</option>
              </select>
              <ChevronDown className={styles.selectIcon} size={18} />
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Tags</label>
          <div className={styles.tagInputContainer}>
            <span className={styles.tag}>Premium <X size={14} /></span>
            <span className={styles.tag}>Cotton <X size={14} /></span>
            <span className={styles.tag}>Eco-friendly <X size={14} /></span>
            <input type="text" placeholder="Add tags..." className={styles.ghostInput} />
          </div>
        </div>
      </section>
      {/* --- Section 2: Media & Gallery --- */}
      <section className={styles.formCard}>
        <div className={styles.sectionTitle}>
          <div className={styles.iconCircle}>
            <Image size={18} />
          </div>
          <h2>2. Media & Gallery</h2>
        </div>

        <div className={styles.galleryGrid}>
          {/* Example Images */}
          <div className={styles.imagePreview}>
            <button className={styles.removeBtn}>
                <X size={14}/>
            </button>
            <img src="/api/placeholder/150/150" alt="Model" />
            </div>

            <div className={styles.imagePreview}>
            <button className={styles.removeBtn}>
                <X size={14}/>
            </button>
            <img src="/api/placeholder/150/150" alt="Texture" />
            </div>
             <div className={styles.imagePreview}>
                <button className={styles.removeBtn}>
                    <X size={14}/>
                </button>
                <img src="/api/placeholder/150/150" alt="Model" />
            </div>
          {/* Add More Button */}
          <button className={styles.addMoreButton}>
            <Plus size={24} />
            <span>Add More</span>
          </button>
        </div>

        <p className={styles.helpText}>
          Drag and drop to reorder images. Supported formats: JPG, PNG, WEBP (Max 5MB each)
        </p>
      </section>
      <section className={styles.formCard}>
  <div className={styles.sectionTitle}>
    <div className={styles.iconCircle}>
      <FileText size={18} />
    </div>
    <h2>3. Product Meta Information</h2>
  </div>

  <div className={styles.editorContainer}>
    <div className={styles.editorHeader}>
      <span className={styles.editorLabel}>PRODUCT DETAILS</span>
      <div className={styles.editorToolbar}>
        <button type="button"><Bold size={16} /></button>
        <button type="button"><Italic size={16} /></button>
        <button type="button"><List size={16} /></button>
        <button type="button"><Link size={16} /></button>
      </div>
    </div>
    <div className={styles.editorContent}>
      <textarea 
        placeholder="Our UrbanFit Premium T-Shirt is the cornerstone of any modern wardrobe..."
        className={styles.editorTextArea}
        rows={6}
      />
    </div>
  </div>
</section>
{/* --- Section 4: Material & Fabric --- */}
<section className={styles.formCard}>
  <div className={styles.sectionTitle}>
    <div className={styles.iconCircle}>
      <List size={18} />
    </div>
    <h2>4. Material & Fabric</h2>
  </div>

  <div className={styles.materialEditor}>
    {/* Header with Tool Buttons */}
    <div className={styles.materialHeader}>
      <span className={styles.materialLabel}>MATERIAL & FABRIC</span>
      <div className={styles.materialToolbar}>
        <button type="button"><Bold size={14} /></button>
        <button type="button"><List size={14} /></button>
        <button type="button"><Image size={14} /></button>
      </div>
    </div>

    {/* Content Area */}
    <div className={styles.materialContent}>
      <p className={styles.materialText}>
        We source our cotton exclusively from partners who prioritize environmental sustainability and ethical labor practices.
      </p>
      
      <div className={styles.materialImageContainer}>
        <img 
          src="/api/placeholder/800/200" 
          alt="Cotton Field" 
          className={styles.bannerImage} 
        />
      </div>

      <p className={styles.materialText}>
        <strong>Composition:</strong> 95% Organic Supima Cotton, 5% Elastane for superior shape retention.
      </p>
    </div>
  </div>
</section>

{/* --- Section 5: Size Guide --- */}
<section className={styles.formCard}>
  <div className={styles.sectionTitle}>
    <div className={styles.iconCircle}>
      <Ruler size={18} />
    </div>
    <h2>5. Size Guide</h2>
  </div>

  <div className={styles.sizeGuideContainer}>
    <div className={styles.sizeGuideHeader}>
      <span className={styles.sizeGuideLabel}>SIZE GUIDE</span>
      <div className={styles.sizeGuideToolbar}>
        <button type="button"><LayoutGrid size={16} /></button>
        <button type="button"><Info size={16} /></button>
      </div>
    </div>
    
    <div className={styles.sizeGuideContent}>
      <p className={styles.sizeDescription}>
        Standard athletic fit. If you prefer a loose "oversized" look, we recommend sizing up one step.
      </p>
      
      <table className={styles.sizeTable}>
        <thead>
          <tr>
            <th>Size</th>
            <th>Chest (in)</th>
            <th>Length (in)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Small</td>
            <td>36-38</td>
            <td>27</td>
          </tr>
          <tr>
            <td>Medium</td>
            <td>39-41</td>
            <td>28</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</section>
<section className={styles.formCard}>
  <div className={styles.sectionTitle}>
    <div className={styles.iconCircle}>
      <ShieldCheck size={18} />
    </div>
    <h2>6. Care Instructions</h2>
  </div>

  <div className={styles.careContainer}>
    <div className={styles.careHeader}>
      <span className={styles.careLabel}>CARE INSTRUCTIONS</span>
      <div className={styles.careToolbar}>
        <button type="button"><Eraser size={16} /></button>
      </div>
    </div>
    
    <div className={styles.careContent}>
      <p className={styles.careText}>
        To maintain the premium finish of your UrbanFit t-shirt:
      </p>
      <ul className={styles.careList}>
        <li>Machine wash cold with like colors.</li>
        <li>Tumble dry low or air dry to conserve energy and preserve fiber strength.</li>
        <li>Iron on medium heat if needed; avoid ironing direct graphics.</li>
      </ul>
    </div>
  </div>
</section>
<section className={styles.bannerContainer}>
        
        {/* Left Side: Content */}
        <div className={styles.textGroup}>
          <h3 className={styles.title}>Ready to add variants?</h3>
          <p className={styles.subtitle}>
            You will be able to set prices, stock and sizes in the next step.
          </p>
        </div>

        {/* Right Side: Button */}
        <button 
            className={styles.ctaButton}
            onClick={() => router.push("/products/addvariation")}
            >
            Save & Next: Variations
        </button>

      </section>
    </div>
    </>
  );
}