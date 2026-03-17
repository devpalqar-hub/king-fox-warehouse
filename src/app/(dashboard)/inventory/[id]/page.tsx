"use client";

import styles from "./inventoryDetails.module.css";
import { MapPin, Building2, ArrowRightLeft } from "lucide-react";

const InventoryDetailsPage = () => {
  return (
    <div className={styles.container}>
      
      {/* Product Card */}
      <section className={styles.productCard}>
        <div className={styles.productLeft}>
          <div className={styles.productImage}></div>

          <div>
            <span className={styles.categoryBadge}>
              APPAREL • T-SHIRTS
            </span>

            <h2 className={styles.productTitle}>
              UrbanFit T-Shirt - Navy Blue (Size M)
            </h2>

            <p className={styles.sku}>SKU: UF-TS-NV-M</p>

            <p className={styles.stockText}>
              TOTAL STOCK <span>482 Units</span>
            </p>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        
        {/* LEFT SECTION */}
        <div className={styles.leftColumn}>
          
          {/* Stock by Branch */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Stock by Branch</h3>
              <span>3 Branches Active</span>
            </div>

            <div className={styles.branchList}>
              
              <div className={styles.branchItem}>
                <MapPin size={18} />
                <div className={styles.branchInfo}>
                  <p className={styles.branchName}>Downtown Flagship Store</p>
                  <p className={styles.branchMeta}>
                    Asia, 4 Shelf B • Last Audit: 2h ago
                  </p>
                </div>

                <div className={styles.branchStock}>
                  <p>142 units</p>
                  <span className={styles.inStock}>IN STOCK</span>
                </div>
              </div>

              <div className={styles.branchItem}>
                <MapPin size={18} />
                <div className={styles.branchInfo}>
                  <p className={styles.branchName}>Westside Mall Boutique</p>
                  <p className={styles.branchMeta}>
                    Stockroom A • Last Audit: 1d ago
                  </p>
                </div>

                <div className={styles.branchStock}>
                  <p>28 units</p>
                  <span className={styles.lowStock}>LOW STOCK</span>
                </div>
              </div>

              <div className={styles.branchItem}>
                <Building2 size={18} />
                <div className={styles.branchInfo}>
                  <p className={styles.branchName}>Central Logistics Center</p>
                  <p className={styles.branchMeta}>
                    Bay 12, Rack 4 • Last Audit: 5h ago
                  </p>
                </div>

                <div className={styles.branchStock}>
                  <p>312 units</p>
                  <span className={styles.bulkStock}>BULK STOCK</span>
                </div>
              </div>

            </div>
          </section>

          {/* Transfer Stock */}
          <section className={styles.card}>
            <h3>Transfer Stock</h3>

            <div className={styles.transferRow}>
              <div className={styles.selectWrapper}>
                <label>Source Branch</label>
                <select>
                  <option>Central Logistics Center</option>
                </select>
              </div>

              <div className={styles.selectWrapper}>
                <label>Destination Branch</label>
                <select>
                  <option>Select Destination</option>
                </select>
              </div>
            </div>

            <div className={styles.transferRow}>
              <div className={styles.inputWrapper}>
                <label>Transfer Quantity</label>
                <input placeholder="Enter amount" />
              </div>

              <button className={styles.transferBtn}>
                <ArrowRightLeft size={16} /> Initiate Transfer
              </button>
            </div>
          </section>
        </div>

        {/* RIGHT SECTION */}
        <div className={styles.rightColumn}>
          
          {/* Add Stock */}
          <section className={styles.card}>
            <h3>Add New Stock</h3>
            <p className={styles.cardSub}>
              Increase inventory for a specific location
            </p>

            <div className={styles.inputWrapper}>
              <label>Target Location</label>
              <select>
                <option>Central Logistics Center</option>
              </select>
            </div>

            <div className={styles.inputWrapper}>
              <label>Add Units</label>
              <input type="number" placeholder="0" />
            </div>

            <div className={styles.inputWrapper}>
              <label>Adjustment Note</label>
              <input placeholder="Restock from vendor..." />
            </div>

            <button className={styles.primaryBtn}>
              Update Inventory
            </button>
          </section>

          {/* System Note */}
          <section className={styles.noteCard}>
            <h4>System Note</h4>
            <p>
              All stock transfers generate a tracking ID and require
              verification from the receiving branch.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default InventoryDetailsPage;