"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import Link from "next/link";
import styles from "./sidebar.module.css";
import {
  LayoutDashboard,
  Warehouse,
  Package,
  Ticket,
  ShoppingBag,
  Trophy,
  Tag,
  Store,
  Users,
  Truck,
  LogOut,
} from "lucide-react";
import { MdReviews } from "react-icons/md";

const menuItems = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={22} />,
    path: "/dashboard",
  },
  { name: "Inventory", icon: <Warehouse size={22} />, path: "/inventory" },
  { name: "Products", icon: <Package size={22} />, path: "/products" },
  { name: "Category", icon: <Tag size={22} />, path: "/category" },
  { name: "Coupons", icon: <Ticket size={22} />, path: "/coupons" },
  { name: "Orders", icon: <ShoppingBag size={22} />, path: "/orders" },
  { name: "Lucky Draw", icon: <Trophy size={22} />, path: "/luckydraw" },
  { name: "Shipping Charge", icon: <Truck size={22} />, path: "/shipping" },
  {
    name: "User Management",
    icon: <Users size={22} />,
    path: "/usermanagement",
  },
  { name: "Reviews", icon: <MdReviews size={22} />, path: "/reviews" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <>
      <aside className={styles.sidebar}>
        {/* Logo */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <Store color="white" size={24} />
          </div>
          <div>
            <h1 className={styles.brandName}>Kingfox Admin</h1>
            <p className={styles.brandSub}>Manage your shop</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`${styles.navItem} ${
                pathname === item.path || pathname.startsWith(item.path + "/")
                  ? styles.active
                  : ""
              }`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            className={styles.logoutBtn}
            onClick={() => setShowConfirm(true)}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Confirm Dialog */}
      {showConfirm && (
        <div className={styles.overlay} onClick={() => setShowConfirm(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.dialogIcon}>
              <LogOut size={22} />
            </div>
            <h2 className={styles.dialogTitle}>Logout?</h2>
            <p className={styles.dialogDesc}>
              You'll be signed out of Kingfox Admin and redirected to the login
              page.
            </p>
            <div className={styles.dialogActions}>
              <button
                className={styles.btnCancel}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button className={styles.btnConfirm} onClick={handleLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
