'use client';
import React from 'react';
import { ChevronDown, Filter, MapPin, UserPlus, Edit3, Trash2 } from 'lucide-react';
import styles from './usermanagement.module.css';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUsers } from "@/services/user.service";
import { User } from "@/types/user.types";
import { getRoles } from "@/services/role.service";


export default function UserManagement() {

    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState<any[]>([]);
    const [selectedRole, setSelectedRole] = useState("");

    useEffect(() => {
    const fetchData = async () => {
      const data = await getUsers();
      setUsers(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
  const fetchRoles = async () => {
    const data = await getRoles();
    console.log("ROLES API:", data); // 👈 ADD THIS
    setRoles(data);
  };

  fetchRoles();
}, []);
const filteredUsers = users.filter((user) => {
  if (!selectedRole) return true;

  return user.role.id === Number(selectedRole);
});
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.filterGroup}>
          <div className={styles.filterItem}>
              <Filter size={16} />

              <select
                className={styles.selectFilter}
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">All Roles</option>

                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          <div className={styles.filterItem}>
            <MapPin size={16} /> <span>Branch: All</span> <ChevronDown size={14} />
          </div>
        </div>
        <button
        className={styles.addButton}
        onClick={() => router.push('/usermanagement/adduser')}
        >
        <UserPlus size={18} /> Add New User
        </button>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Branch</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>
                      {user.name?.charAt(0)}
                    </div>
                    <span className={styles.userName}>{user.name}</span>
                  </div>
                </td>

                <td className={styles.userEmail}>{user.email}</td>

                <td>
                  <span
                    className={`${styles.badge} ${
                      styles[user.role.name.toLowerCase()]
                    }`}
                  >
                    {user.role.name}
                  </span>
                </td>

                <td className={styles.branchText}>
                  {user.branch ? user.branch.name : "No Branch"}
                </td>

                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() =>
                        router.push(`/usermanagement/edituser/${user.id}`)
                      }
                    >
                      <Edit3 size={18} />
                    </button>

                    <button className={`${styles.actionBtn} ${styles.deleteBtn}`}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <footer className={styles.footer}>
          <span className={styles.userEmail}>Showing 1 to 4 of 4 users</span>
          <div className={styles.pagination}>
            <button className={styles.pageNav}>Previous</button>
            <button className={styles.pageActive}>1</button>
            <button className={styles.pageNav}>Next</button>
          </div>
        </footer>
      </div>
    </div>
  );
}