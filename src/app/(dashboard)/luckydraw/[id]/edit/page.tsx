"use client";

import styles from "./luckydraw-edit.module.css";
import { ArrowLeft, Save, ChevronDown, AlertCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCampaignById, updateCampaign } from "@/services/luckydraw.service";
import { getBranches } from "@/services/branch.service";
import { getCategories } from "@/services/category.service";
import { getTags } from "@/services/tag.service";
import { useToast } from "@/components/toast/ToastProvider";

const LuckyDrawEditPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    totalVouchersLimit: "",
    priority: "1",
    filterType: "CATEGORY",
    branchIds: [] as number[],
    categoryIds: [] as number[],
    tagIds: [] as number[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCampaignById(id as string);
        setForm({
          name: res.name ?? "",
          description: res.description ?? "",
          startDate: res.startDate ? res.startDate.split("T")[0] : "",
          endDate: res.endDate ? res.endDate.split("T")[0] : "",
          totalVouchersLimit: String(res.totalVouchersLimit ?? ""),
          priority: String(res.priority ?? "1"),
          filterType: res.filterType ?? "CATEGORY",
          branchIds: res.branchIds ?? [],
          categoryIds: res.categoryIds ?? [],
          tagIds: res.tagIds ?? [],
        });

        const branchesData = await getBranches();
        setBranches(branchesData);

        const categoriesData = await getCategories();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        const tagsData = await getTags();
        setTags(tagsData);
      } catch (err) {
        console.error(err);
        showToast("Failed to load campaign", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, showToast]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Reset selection when changing filter type
    if (name === "filterType") {
      setForm((prev) => ({
        ...prev,
        filterType: value,
        categoryIds: [],
        tagIds: [],
      }));
    }
  };

  const toggleBranch = (branchId: number) => {
    setForm((prev) => ({
      ...prev,
      branchIds: prev.branchIds.includes(branchId)
        ? prev.branchIds.filter((b) => b !== branchId)
        : [...prev.branchIds, branchId],
    }));
  };

  const toggleCategory = (categoryId: number) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((c) => c !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const toggleTag = (tagId: number) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((t) => t !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.startDate ||
      !form.endDate ||
      !form.totalVouchersLimit
    ) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (form.branchIds.length === 0) {
      showToast("Please select at least one branch", "error");
      return;
    }

    if (form.filterType === "CATEGORY" && form.categoryIds.length === 0) {
      showToast("Please select at least one category", "error");
      return;
    }

    if (form.filterType === "TAG" && form.tagIds.length === 0) {
      showToast("Please select at least one tag", "error");
      return;
    }

    setSaving(true);
    try {
      await updateCampaign(id as string, {
        name: form.name,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        totalVouchersLimit: Number(form.totalVouchersLimit),
        priority: Number(form.priority),
        filterType: form.filterType,
        branchIds: form.branchIds,
        categoryIds: form.categoryIds,
        tagIds: form.tagIds,
      });
      showToast("Campaign updated successfully", "success");
      router.push(`/luckydraw/${id}`);
    } catch (err) {
      console.error(err);
      showToast("Failed to update campaign", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <p>Loading campaign…</p>
      </div>
    );
  }

  const selectedBranches = branches.filter((b) =>
    form.branchIds.includes(b.id),
  );
  const selectedFilterItems =
    form.filterType === "CATEGORY"
      ? categories.filter((c) => form.categoryIds.includes(c.id))
      : tags.filter((t) => form.tagIds.includes(t.id));

  return (
    <div className={styles.container}>
      {/* Back nav */}
      <button className={styles.backBtn} onClick={() => router.back()}>
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Edit Campaign</h1>
          <p className={styles.pageSubtitle}>
            Update the details for this lucky draw campaign
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formLayout}>
          {/* ── Main form ──────────────────────── */}
          <div className={styles.mainCol}>
            {/* Basic Info */}
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Basic Information</h2>

              <div className={styles.field}>
                <label className={styles.label}>Campaign Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Summer Lucky Draw 2025"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the campaign…"
                  className={styles.textarea}
                  rows={4}
                />
              </div>
            </section>

            {/* Schedule */}
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Campaign Duration</h2>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Vouchers */}
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Voucher Settings</h2>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>Total Voucher Limit *</label>
                  <input
                    type="number"
                    name="totalVouchersLimit"
                    value={form.totalVouchersLimit}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    className={styles.input}
                    min={1}
                    required
                  />
                  <span className={styles.hint}>
                    Maximum number of vouchers for this campaign.
                  </span>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Priority (1-10)</label>
                  <input
                    type="number"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className={styles.input}
                    min={1}
                    max={10}
                  />
                </div>
              </div>
            </section>

            {/* Branches */}
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Select Branches *</h2>

              <div className={styles.dropdownWrapper}>
                <button
                  type="button"
                  onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                  className={styles.dropdownTrigger}
                >
                  <span className={styles.dropdownText}>
                    {selectedBranches.length === 0
                      ? "Select branches..."
                      : `${selectedBranches.length} selected`}
                  </span>
                  <ChevronDown
                    size={18}
                    className={showBranchDropdown ? styles.chevronOpen : ""}
                  />
                </button>

                {showBranchDropdown && (
                  <div className={styles.dropdownMenu}>
                    {branches.length === 0 ? (
                      <div className={styles.emptyState}>
                        No branches available
                      </div>
                    ) : (
                      branches.map((branch) => (
                        <label key={branch.id} className={styles.checkboxItem}>
                          <input
                            type="checkbox"
                            checked={form.branchIds.includes(branch.id)}
                            onChange={() => toggleBranch(branch.id)}
                            className={styles.checkbox}
                          />
                          <span className={styles.checkboxLabel}>
                            {branch.name}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                )}

                {selectedBranches.length > 0 && (
                  <div className={styles.selectedTags}>
                    {selectedBranches.map((branch) => (
                      <span key={branch.id} className={styles.tag}>
                        {branch.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Filter Type & Selection */}
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Target Audience</h2>

              <div className={styles.field}>
                <label className={styles.label}>Filter Type</label>
                <select
                  name="filterType"
                  value={form.filterType}
                  onChange={handleChange}
                  className={styles.input}
                >
                  <option value="CATEGORY">By Category</option>
                  <option value="TAG">By Tag</option>
                </select>
              </div>

              {/* Conditional Categories */}
              {form.filterType === "CATEGORY" && (
                <div className={styles.dropdownWrapper}>
                  <label className={styles.label}>Select Categories *</label>
                  <button
                    type="button"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className={styles.dropdownTrigger}
                  >
                    <span className={styles.dropdownText}>
                      {form.categoryIds.length === 0
                        ? "Select categories..."
                        : `${form.categoryIds.length} selected`}
                    </span>
                    <ChevronDown
                      size={18}
                      className={showFilterDropdown ? styles.chevronOpen : ""}
                    />
                  </button>

                  {showFilterDropdown && (
                    <div className={styles.dropdownMenu}>
                      {categories.length === 0 ? (
                        <div className={styles.emptyState}>
                          No categories available
                        </div>
                      ) : (
                        categories.map((category) => (
                          <label
                            key={category.id}
                            className={styles.checkboxItem}
                          >
                            <input
                              type="checkbox"
                              checked={form.categoryIds.includes(category.id)}
                              onChange={() => toggleCategory(category.id)}
                              className={styles.checkbox}
                            />
                            <span className={styles.checkboxLabel}>
                              {category.name}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  )}

                  {selectedFilterItems.length > 0 && (
                    <div className={styles.selectedTags}>
                      {selectedFilterItems.map((item) => (
                        <span key={item.id} className={styles.tag}>
                          {item.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Conditional Tags */}
              {form.filterType === "TAG" && (
                <div className={styles.dropdownWrapper}>
                  <label className={styles.label}>Select Tags *</label>
                  <button
                    type="button"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className={styles.dropdownTrigger}
                  >
                    <span className={styles.dropdownText}>
                      {form.tagIds.length === 0
                        ? "Select tags..."
                        : `${form.tagIds.length} selected`}
                    </span>
                    <ChevronDown
                      size={18}
                      className={showFilterDropdown ? styles.chevronOpen : ""}
                    />
                  </button>

                  {showFilterDropdown && (
                    <div className={styles.dropdownMenu}>
                      {tags.length === 0 ? (
                        <div className={styles.emptyState}>
                          No tags available
                        </div>
                      ) : (
                        tags.map((tag) => (
                          <label key={tag.id} className={styles.checkboxItem}>
                            <input
                              type="checkbox"
                              checked={form.tagIds.includes(tag.id)}
                              onChange={() => toggleTag(tag.id)}
                              className={styles.checkbox}
                            />
                            <span className={styles.checkboxLabel}>
                              {tag.name}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  )}

                  {selectedFilterItems.length > 0 && (
                    <div className={styles.selectedTags}>
                      {selectedFilterItems.map((item) => (
                        <span key={item.id} className={styles.tag}>
                          {item.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* ── Sidebar ────────────────────────── */}
          <aside className={styles.sidebar}>
            <div className={styles.card}>
              <AlertCircle size={20} style={{ marginRight: "8px" }} />
              <h3 className={styles.sidebarLabel}>Campaign Summary</h3>

              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Branches:</span>
                <span className={styles.summaryValue}>
                  {form.branchIds.length}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Filter Type:</span>
                <span className={styles.summaryValue}>
                  {form.filterType === "CATEGORY" ? "Categories" : "Tags"}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Selected:</span>
                <span className={styles.summaryValue}>
                  {selectedFilterItems.length}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Priority:</span>
                <span className={styles.summaryValue}>{form.priority}</span>
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.sidebarLabel}>Actions</h3>

              <button
                type="submit"
                className={styles.btnSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className={styles.btnSpinner} />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save Changes
                  </>
                )}
              </button>

              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => router.back()}
              >
                Discard
              </button>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
};

export default LuckyDrawEditPage;
