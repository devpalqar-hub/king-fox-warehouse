"use client";
import {
  Filter,
  MapPin,
  UserPlus,
  Pencil,
  Trash2,
} from "lucide-react";
import styles from "./usermanagement.module.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getUsersWithPagination,
  deleteUser,
} from "@/services/user.service";
import { User } from "@/types/user.types";
import { getRoles } from "@/services/role.service";
import { getBranches } from "@/services/branch.service";
import DeleteConfirmModal from "@/components/DeleteConfirmModal/DeleteConfirmModal";
import { useToast } from "@/components/toast/ToastProvider";

export default function UserManagement() {
  const router = useRouter();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState<any>(null);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await getUsersWithPagination({
        page,
        limit,
        roleId: selectedRole ? Number(selectedRole) : undefined,
        branchId: selectedBranch ? Number(selectedBranch) : undefined,
      });
      if (res) {
        setUsers(res.data);
        setPagination(res.meta);
      }
      setLoading(false);
    };
    fetchData();
  }, [page, limit, selectedRole, selectedBranch]);

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
      } catch (err) {
        console.error("Branch fetch error:", err);
      }
    };

    fetchBranches();
  }, []);

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      await deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      showToast("User deleted successfully", "success");
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
      // Refresh the current page if last user was deleted
      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error: any) {
      showToast(error.message || "Failed to delete user", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>User Management</h1>
        <p className={styles.pageSubtitle}>
          Manage users, roles, and permissions
        </p>
      </div>

      <header className={styles.header}>
        <div className={styles.filterGroup}>
          <div className={styles.filterItem}>
            <Filter size={16} />

            <select
              className={styles.selectFilter}
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(1);
              }}
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
            <MapPin size={16} />

            <select
              className={styles.selectFilter}
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Branches</option>

              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          className={styles.addButton}
          onClick={() => router.push("/usermanagement/adduser")}
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
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className={styles.loadingCell}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyCell}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td data-label="Name">
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>
                        {user.name?.charAt(0)}
                      </div>
                      <span className={styles.userName}>{user.name}</span>
                    </div>
                  </td>

                  <td data-label="Email" className={styles.userEmail}>
                    {user.email}
                  </td>

                  <td data-label="Role">
                    <span
                      className={`${styles.badge} ${
                        styles[user.role.name.toLowerCase()]
                      }`}
                    >
                      {user.role.name}
                    </span>
                  </td>

                  <td data-label="Branch" className={styles.branchText}>
                    {user.branch ? user.branch.name : "No Branch"}
                  </td>

                  <td data-label="Actions">
                    <div className={styles.actions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() =>
                          router.push(`/usermanagement/edituser/${user.id}`)
                        }
                      >
                        <Pencil size={18} />
                      </button>

                      {/* <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDeleteClick(user)}
                        title="Delete user"
                      >
                        <Trash2 size={18} />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <footer className={styles.footer}>
          <span className={styles.userEmail}>
            Showing {users.length > 0 ? (page - 1) * limit + 1 : 0} to{" "}
            {Math.min(page * limit, pagination?.total || 0)} of{" "}
            {pagination?.total || 0} users
          </span>
          <div className={styles.pagination}>
            <button
              className={styles.pageNav}
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className={styles.pageInfo}>
              Page {page} of {pagination?.totalPages || 1}
            </span>
            <button
              className={styles.pageNav}
              onClick={() =>
                setPage(Math.min(pagination?.totalPages || 1, page + 1))
              }
              disabled={page === (pagination?.totalPages || 1)}
            >
              Next
            </button>
          </div>
        </footer>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteConfirmOpen}
        productName={`${userToDelete?.name} (${userToDelete?.email})`}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
