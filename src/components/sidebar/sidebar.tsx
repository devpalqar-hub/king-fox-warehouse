'use client';

import { usePathname } from "next/navigation";
import React from 'react';
import Link from "next/link";
import styles from './sidebar.module.css';
import { 
  LayoutDashboard, 
  Warehouse, 
  Package, 
  Ticket, 
  ShoppingBag, 
  Trophy,
  Tag, 
  Store,
  Users
} from 'lucide-react';


  const menuItems = [
  { name: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/dashboard' },
  { name: 'Inventory', icon: <Warehouse size={22} />, path: '/inventory' },
  { name: 'Products', icon: <Package size={22} />, path: '/products' },
  { name: 'Category', icon: <Tag size={22} />, path: '/category' },
  { name: 'Stocks', icon: <Store size={22} />, path: '/stocks' },
  { name: 'Coupons', icon: <Ticket size={22} />, path: '/coupons' },
  { name: 'Orders', icon: <ShoppingBag size={22} />, path: '/orders' },
  { name: 'Lucky Draw', icon: <Trophy size={22} />, path: '/luckydraw' },
  { name: 'User Management', icon: <Users size={22} />, path: '/usermanagement' },
];


const Sidebar = () => {
  const pathname = usePathname();
  return (
    <aside className={styles.sidebar}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <div className={styles.logoIcon}>
          <Store color="white" size={24} />
        </div>
        <div>
          <h1 className={styles.brandName}>Estore Admin</h1>
          <p className={styles.brandSub}>Manage your shop</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {menuItems.map((item) => (
            <Link
            key={item.name}
            href={item.path}
            className={`${styles.navItem} ${pathname === item.path ? styles.active : ""}`}
            >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.name}</span>
            </Link>
        ))}
        </nav>
      {/* Footer User Profile */}
      <div className={styles.footer}>
        <img 
          src="https://ui-avatars.com/api/?name=Alex+Rivera&background=E8E3D2&color=444" 
          alt="Avatar" 
          className={styles.avatar} 
        />
        <div className={styles.userInfo}>
          <p className={styles.userName}>Alex Rivera</p>
          <p className={styles.userRole}>Super Admin</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;