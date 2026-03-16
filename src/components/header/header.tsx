import React from 'react';
import styles from './header.module.css';
import { Search, Bell, Settings, Download } from 'lucide-react';

const Header = () => {
  return (
    <header className={styles.header}>
      {/* Search Bar Group */}
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={18} />
        <input 
          type="text" 
          placeholder="Search analytics, products, orders..." 
          className={styles.searchInput}
        />
      </div>

      {/* Action Items Group */}
      <div className={styles.actions}>
        <div className={styles.iconButton}>
          <Bell size={20} />
          <span className={styles.notificationDot}></span>
        </div>
        
        <div className={styles.iconButton}>
          <Settings size={20} />
        </div>

        <div className={styles.divider}></div>

        <button className={styles.exportButton}>
          <Download size={16} />
          <span>Export Data</span>
        </button>
      </div>
    </header>
  );
};

export default Header;