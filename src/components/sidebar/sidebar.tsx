"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { MdReviews } from "react-icons/md";

const menuItems = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "/dashboard",
  },
  { name: "Inventory", icon: <Warehouse size={20} />, path: "/inventory" },
  { name: "Products", icon: <Package size={20} />, path: "/products" },
  { name: "Category", icon: <Tag size={20} />, path: "/category" },
  { name: "Coupons", icon: <Ticket size={20} />, path: "/coupons" },
  { name: "Orders", icon: <ShoppingBag size={20} />, path: "/orders" },
  { name: "Lucky Draw", icon: <Trophy size={20} />, path: "/luckydraw" },
  { name: "Shipping Charge", icon: <Truck size={20} />, path: "/shipping" },
  {
    name: "User Management",
    icon: <Users size={20} />,
    path: "/usermanagement",
  },
  { name: "Reviews", icon: <MdReviews size={20} />, path: "/reviews" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <>
      {/* ── Mobile top bar ─────────────────────── */}
      <div className={styles.mobileTopBar}>
        <button
          className={styles.hamburger}
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className={styles.mobileTitle}>Kingfox Admin</span>
      </div>

      {/* ── Backdrop ───────────────────────────── */}
      {isOpen && (
        <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
      )}

      {/* ── Sidebar ────────────────────────────── */}
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
      >
        {/* Logo */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <Store color="white" size={22} />
          </div>
          <div className={styles.brandText}>
            <h1 className={styles.brandName}>Kingfox Admin</h1>
            <p className={styles.brandSub}>Manage your shop</p>
          </div>
          {/* Close button — mobile only */}
          <button
            className={styles.closeBtn}
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
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

      {/* ── Logout Confirm Dialog ───────────────── */}
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
