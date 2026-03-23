'use client';
import React from 'react';
import { useState,useEffect} from "react";
import { createUser } from "@/services/user.service";
import { useRouter } from "next/navigation";
import { 
  Home, User, Mail, Lock, Settings, 
  MapPin, ChevronDown 
} from 'lucide-react';
import styles from './adduser.module.css';
import { getRoles } from "@/services/role.service";
import { useToast } from "@/components/toast/ToastProvider";
import { getBranches } from "@/services/branch.service";
import BackButton from '@/components/backButton/backButton';

export default function AddUser() {

const router = useRouter();
const { showToast } = useToast();
const [roles, setRoles] = useState<any[]>([]);
const [branches, setBranches] = useState<any[]>([]);
const [form, setForm] = useState({
  name: "",
  email: "",
  password: "",
  roleId: "",
  branchId: "",
});
useEffect(() => {
  const fetchRoles = async () => {
    const data = await getRoles();
    setRoles(data);
  };

  fetchRoles();
}, []);

useEffect(() => {
  const fetchBranches = async () => {
    try {
      const data = await getBranches();
      setBranches(data);
    } catch (error) {
      console.error("Branch fetch error:", error);
    }
  };

  fetchBranches();
}, []);

const handleChange = (e: any) => {
  const { name, value } = e.target;
  setForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleSubmit = async () => {

  if (!form.name) return showToast("Name is required", "error");
  if (!form.email) return showToast("Email is required", "error");
  if (!form.password) return showToast("Password is required", "error");
  if (!form.roleId) return showToast("Role is required", "error");
  try {
    await createUser({
      name: form.name,
      email: form.email,
      password: form.password,
      roleId: Number(form.roleId),
      branchId: form.branchId ? Number(form.branchId) : null,
    });

    showToast("User created successfully", "success");

    // redirect to list page
    router.push("/usermanagement");

  } catch (error) {
    showToast("Failed to create user", "error");
  }
};
  return (
    <div className={styles.container}>
      <BackButton />
      {/* Breadcrumbs */}
      <nav className={styles.breadcrumbs}>
        <Home size={14} /> 
        <span>Dashboard</span> / 
        <span>Users</span> / 
        <span className={styles.breadcrumbActive}>Add User</span>
      </nav>

      {/* Header */}
      <h1 className={styles.headerTitle}>Add New User</h1>
      <p className={styles.headerSub}>
        Create a new user account and assign roles & permissions
      </p>

      {/* Form Card */}
      <div className={styles.formCard}>
        <div className={styles.formGrid}>
          
          {/* Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={18} />
              <input
                className={styles.input}
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                />
            </div>
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={18} />
              <input
                className={styles.input}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email"
                />
            </div>
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
            <input
                className={styles.input}
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                />
            </div>
          </div>

          {/* Role */}
          <div className={styles.formGroup}>
            <label className={styles.label}>System Role</label>
            <div className={styles.inputWrapper}>
              <Settings className={styles.inputIcon} size={18} />
              <select
                  className={styles.select}
                  name="roleId"
                  value={form.roleId}
                  onChange={handleChange}
                >
                  <option value="">Select role</option>

                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              <ChevronDown style={{ position: 'absolute', right: '12px' }} size={16} />
            </div>
          </div>

          {/* Branch */}
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label className={styles.label}>Assigned Branch</label>
            <div className={styles.inputWrapper}>
              <MapPin className={styles.inputIcon} size={18} />
              <select
                  className={styles.select}
                  name="branchId"
                  value={form.branchId}
                  onChange={handleChange}
                >
                  <option value="">Select branch</option>

                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              <ChevronDown style={{ position: 'absolute', right: '12px' }} size={16} />
            </div>
          </div>

        </div>

        {/* Buttons */}
        <div className={styles.buttonGroup}>
          <button className={styles.saveBtn} onClick={handleSubmit}>
            Create User
            </button>
        </div>
      </div>
    </div>
  );
}