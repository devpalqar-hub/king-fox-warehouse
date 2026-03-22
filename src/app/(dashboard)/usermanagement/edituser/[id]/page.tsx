import React from 'react';
import { 
  Home, User, Mail, Lock, Settings, 
  MapPin, ChevronDown, Info 
} from 'lucide-react';
import styles from './edituser.module.css';

export default function EditUser() {
  return (
    <div className={styles.container}>
      {/* Breadcrumbs */}
      <nav className={styles.breadcrumbs}>
        <Home size={14} /> <span>Dashboard</span> / <span>Users</span> / <span className={styles.breadcrumbActive}>Edit User</span>
      </nav>

      <h1 className={styles.headerTitle}>Edit User</h1>
      <p className={styles.headerSub}>Update profile details and system permissions for Priya Sharma</p>

      <div className={styles.formCard}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={18} />
              <input className={styles.input} type="text" defaultValue="Priya Sharma" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={18} />
              <input className={styles.input} type="email" defaultValue="priya.sharma@kingfox.com" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input className={styles.input} type="password" defaultValue="password123" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>System Role</label>
            <div className={styles.inputWrapper}>
              <Settings className={styles.inputIcon} size={18} />
              <select className={styles.select}>
                <option>Manager</option>
                <option>Admin</option>
                <option>Staff</option>
              </select>
              <ChevronDown style={{position: 'absolute', right: '12px'}} size={16} />
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Assigned Branch</label>
            <div className={styles.inputWrapper}>
              <MapPin className={styles.inputIcon} size={18} />
              <select className={styles.select}>
                <option>Branch 1 - North Avenue</option>
                <option>Branch 2 - South Square</option>
              </select>
              <ChevronDown style={{position: 'absolute', right: '12px'}} size={16} />
            </div>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.cancelBtn}>Cancel</button>
          <button className={styles.saveBtn}>Save Changes</button>
        </div>
      </div>

      {/* Account History */}
      <div className={styles.historyAlert}>
        <Info className={styles.historyIcon} size={24} />
        <div>
          <div className={styles.historyTitle}>Account History</div>
          <div className={styles.historyText}>
            Last login: 2 hours ago from IP 192.168.1.45. Profile created on Oct 12, 2023.
          </div>
        </div>
      </div>
    </div>
  );
}