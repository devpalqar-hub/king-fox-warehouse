"use client";
import React from 'react';
import { 
  Home, User, Mail, Lock, Settings, 
  MapPin, ChevronDown, Info, 
  Router
} from 'lucide-react';
import styles from './edituser.module.css';
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getUsers } from "@/services/user.service";
import { getRoles } from "@/services/role.service";
import { getBranches } from "@/services/branch.service";
import { updateUser } from "@/services/user.service";
import { useToast } from "@/components/toast/ToastProvider"; 
import BackButton from '@/components/backButton/backButton';

export default function EditUser() {
const params = useParams();
const router = useRouter();
const { showToast } = useToast();
const userId = Number(params.id);
const [roles, setRoles] = useState<any[]>([]);
const [branches, setBranches] = useState<Branch[]>([]);
type Branch = {
  id: number;
  name: string;
};
const [form, setForm] = useState({
  name: "",
  email: "",
  password: "",
  roleId: "",
  branchId: "",
});

useEffect(() => {
  const fetchData = async () => {
    try {
      const users = await getUsers();
      const user = users.find(u => u.id === userId);

      if (user) {
        setForm({
          name: user.name,
          email: user.email,
          password: "",
          roleId: String(user.role.id),
          branchId: user.branch ? String(user.branch.id) : "",
        });
      }

      const roleData = await getRoles();
      const branchData = await getBranches();

      setRoles(roleData);
      setBranches(branchData);

    } catch (err) {
      console.error(err);
    }
  };

  fetchData();
}, [userId]);


const handleSubmit = async () => {
  try {
    await updateUser(userId, {
      name: form.name,
      email: form.email,
      password: form.password || undefined,
      roleId: Number(form.roleId),
      branchId: form.branchId ? Number(form.branchId) : null,
    });

    showToast("User updated successfully!", "success");
    router.push("/usermanagement")
  } catch (err) {
    console.error(err);
    showToast("Update failed!", "error");
  }
};

const handleChange = (e: any) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};
  return (
    <div className={styles.container}>
      <BackButton />
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
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={18} />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>System Role</label>
            <div className={styles.inputWrapper}>
              <Settings className={styles.inputIcon} size={18} />
              <select
                name="roleId"
                value={form.roleId}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">Select role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <ChevronDown style={{position: 'absolute', right: '12px'}} size={16} />
            </div>
          </div>

          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Assigned Branch</label>
            <div className={styles.inputWrapper}>
              <MapPin className={styles.inputIcon} size={18} />
              <select
                    name="branchId"
                    value={form.branchId}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="">Select branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
              <ChevronDown style={{position: 'absolute', right: '12px'}} size={16} />
            </div>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.saveBtn} onClick={handleSubmit}>
            Save Changes
          </button>
        </div>
      </div>

      {/* Account History */}
      {/* <div className={styles.historyAlert}>
        <Info className={styles.historyIcon} size={24} />
        <div>
          <div className={styles.historyTitle}>Account History</div>
          <div className={styles.historyText}>
            Last login: 2 hours ago from IP 192.168.1.45. Profile created on Oct 12, 2023.
          </div>
        </div>
      </div> */}
    </div>
  );
}