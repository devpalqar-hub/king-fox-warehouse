"use client";

import styles from "./luckydraw-edit.module.css";
import { Save, ChevronDown, AlertCircle, Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getCampaignById, updateCampaign } from "@/services/luckydraw.service";
import { getBranches } from "@/services/branch.service";
import { getCategories } from "@/services/category.service";
import { getTags, type Tag } from "@/services/tag.service";
import { getProducts } from "@/services/product.service";
import { useToast } from "@/components/toast/ToastProvider";
import BackButton from "@/components/backButton/backButton";
import type { Product } from "@/types/product";
import type { Branch } from "@/types/branch.types";
import type { Category } from "@/types/category";
import RichTextEditor from "@/components/editor/RichTextEditor";

type CampaignForm = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  totalVouchersLimit: string;
  priority: string;
  filterType: "CATEGORY" | "TAG" | "PRODUCT";
  branchIds: number[];
  categoryIds: number[];
  tagIds: number[];
  productIds: number[];
};

type CampaignReference = {
  id: number | string;
  name: string;
};

type CampaignDetails = {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  totalVouchersLimit?: number | string;
  priority?: number | string;
  filterType?: string | null;
  branchIds?: Array<number | string>;
  branches?: CampaignReference[];
  categoryIds?: Array<number | string>;
  categories?: CampaignReference[];
  tagIds?: Array<number | string>;
  tags?: CampaignReference[];
  productIds?: Array<number | string>;
  products?: unknown[];
};

type EditableCampaignField = Exclude<
  keyof CampaignForm,
  "branchIds" | "categoryIds" | "tagIds" | "productIds"
>;

const normalizeFilterType = (value: unknown): CampaignForm["filterType"] => {
  const normalizedValue = String(value ?? "")
    .trim()
    .toUpperCase();

  if (normalizedValue === "TAG" || normalizedValue === "TAGS") {
    return "TAG";
  }

  if (normalizedValue === "PRODUCT" || normalizedValue === "PRODUCTS") {
    return "PRODUCT";
  }

  return "CATEGORY";
};

const toFiniteId = (value: unknown): number | null => {
  if (value == null) return null;

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    return toFiniteId(
      record.id ??
        record.productId ??
        record.categoryId ??
        record.tagId ??
        record.branchId ??
        record.product,
    );
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : null;
};

const normalizeIdList = (values: unknown): number[] => {
  if (!Array.isArray(values)) return [];

  return Array.from(
    new Set(
      values
        .map((value) => toFiniteId(value))
        .filter((value): value is number => value !== null),
    ),
  );
};

const createFallbackProduct = (id: number, name?: string): Product => ({
  id,
  name: name?.trim() || `Product #${id}`,
  status: "",
  slug: "",
  description: "",
  brandId: 0,
  categoryId: 0,
  images: [],
  createdAt: "",
  brand: {
    id: 0,
    name: "",
  },
  category: {
    id: 0,
    name: "",
  },
  variants: [],
});

const toProductOption = (value: unknown): Product | null => {
  if (!value || typeof value !== "object") {
    const id = toFiniteId(value);
    return id ? createFallbackProduct(id) : null;
  }

  const record = value as Record<string, unknown>;
  const productRecord =
    record.product && typeof record.product === "object"
      ? (record.product as Record<string, unknown>)
      : record;
  const id = toFiniteId(productRecord.id ?? record.productId ?? record.id);

  if (!id) return null;

  const name =
    typeof productRecord.name === "string"
      ? productRecord.name
      : typeof record.name === "string"
        ? record.name
        : undefined;

  return createFallbackProduct(id, name);
};

const mergeProducts = (
  selectedIds: number[],
  campaignProducts: unknown,
  fetchedProducts: Product[],
) => {
  const productMap = new Map<number, Product>();

  selectedIds.forEach((id) => {
    productMap.set(id, createFallbackProduct(id));
  });

  if (Array.isArray(campaignProducts)) {
    campaignProducts.forEach((product) => {
      const normalizedProduct = toProductOption(product);

      if (normalizedProduct) {
        productMap.set(normalizedProduct.id, normalizedProduct);
      }
    });
  }

  fetchedProducts.forEach((product) => {
    productMap.set(Number(product.id), product);
  });

  return Array.from(productMap.values());
};

const LuckyDrawEditPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const [form, setForm] = useState<CampaignForm>({
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
    productIds: [] as number[],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = (await getCampaignById(id as string)) as CampaignDetails;
        const normalizedFilterType = normalizeFilterType(res.filterType);
        const selectedBranchIds =
          normalizeIdList(res.branchIds).length > 0
            ? normalizeIdList(res.branchIds)
            : normalizeIdList(res.branches);
        const selectedCategoryIds =
          normalizeIdList(res.categoryIds).length > 0
            ? normalizeIdList(res.categoryIds)
            : normalizeIdList(res.categories);
        const selectedTagIds =
          normalizeIdList(res.tagIds).length > 0
            ? normalizeIdList(res.tagIds)
            : normalizeIdList(res.tags);
        const selectedProductIds =
          normalizeIdList(res.productIds).length > 0
            ? normalizeIdList(res.productIds)
            : normalizeIdList(res.products);

        setForm({
          name: res.name ?? "",
          description: res.description ?? "",
          startDate: res.startDate ? res.startDate.split("T")[0] : "",
          endDate: res.endDate ? res.endDate.split("T")[0] : "",
          totalVouchersLimit: String(res.totalVouchersLimit ?? ""),
          priority: String(res.priority ?? "1"),
          filterType: normalizedFilterType,
          branchIds: selectedBranchIds,
          categoryIds: selectedCategoryIds,
          tagIds: selectedTagIds,
          productIds: selectedProductIds,
        });

        const branchesData = await getBranches();

        setBranches(branchesData);

        const categoriesData = await getCategories();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        const tagsData = await getTags();
        setTags(tagsData);

        const productsData = await getProducts({ page: 1, limit: 1000 });
        const fetchedProducts = Array.isArray(productsData.data)
          ? productsData.data
          : [];

        setProducts(
          mergeProducts(selectedProductIds, res.products, fetchedProducts),
        );
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
    const fieldName = name as EditableCampaignField;
    setForm((prev) => ({ ...prev, [fieldName]: value }));

    // Reset selection when changing filter type
    if (name === "filterType") {
      setShowFilterDropdown(false);
      setShowProductDropdown(false);
      setProductSearch("");
      setForm((prev) => ({
        ...prev,
        filterType: value as CampaignForm["filterType"],
        categoryIds: [],
        tagIds: [],
        productIds: [],
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

  const toggleProduct = (productId: number) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const handleProductDropdownToggle = () => {
    setShowProductDropdown((prev) => {
      if (prev) {
        setProductSearch("");
      }

      return !prev;
    });
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

    if (form.filterType === "PRODUCT" && form.productIds.length === 0) {
      showToast("Please select at least one product", "error");
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
        categoryIds: form.filterType === "CATEGORY" ? form.categoryIds : [],
        tagIds: form.filterType === "TAG" ? form.tagIds : [],
        productIds: form.filterType === "PRODUCT" ? form.productIds : [],
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
    form.branchIds.includes(Number(b.id)),
  );
  const selectedFilterItems =
    form.filterType === "CATEGORY"
      ? categories.filter((c) => form.categoryIds.includes(Number(c.id)))
      : form.filterType === "TAG"
        ? tags.filter((t) => form.tagIds.includes(Number(t.id)))
        : products.filter((product) =>
            form.productIds.includes(Number(product.id)),
          );
  const selectedProducts = products.filter((product) =>
    form.productIds.includes(Number(product.id)),
  );
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase().trim()),
  );

  return (
    <div className={styles.container}>
      {/* Back nav */}
      <BackButton />

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
                <RichTextEditor
                  value={form.description}
                  onChange={(val) =>
                    setForm((prev) => ({ ...prev, description: val }))
                  }
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
                            checked={form.branchIds.includes(Number(branch.id))}
                            onChange={() => toggleBranch(Number(branch.id))}
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
                  <option value="PRODUCT">By Product</option>
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
                              checked={form.categoryIds.includes(
                                Number(category.id),
                              )}
                              onChange={() =>
                                toggleCategory(Number(category.id))
                              }
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
                              checked={form.tagIds.includes(Number(tag.id))}
                              onChange={() => toggleTag(Number(tag.id))}
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

              {form.filterType === "PRODUCT" && (
                <div className={styles.dropdownWrapper}>
                  <label className={styles.label}>Select Products *</label>
                  <button
                    type="button"
                    onClick={handleProductDropdownToggle}
                    className={styles.dropdownTrigger}
                  >
                    <span className={styles.dropdownText}>
                      {form.productIds.length === 0
                        ? "Select products..."
                        : `${form.productIds.length} selected`}
                    </span>
                    <ChevronDown
                      size={18}
                      className={showProductDropdown ? styles.chevronOpen : ""}
                    />
                  </button>

                  {showProductDropdown && (
                    <div className={styles.dropdownMenu}>
                      <div className={styles.dropdownSearch}>
                        <Search
                          size={16}
                          className={styles.dropdownSearchIcon}
                        />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          placeholder="Search products..."
                          className={styles.dropdownSearchInput}
                        />
                      </div>

                      {products.length === 0 ? (
                        <div className={styles.emptyState}>
                          No products available
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className={styles.emptyState}>
                          No products found for <strong>{productSearch}</strong>
                          .
                        </div>
                      ) : (
                        filteredProducts.map((product) => (
                          <label
                            key={product.id}
                            className={styles.checkboxItem}
                          >
                            <input
                              type="checkbox"
                              checked={form.productIds.includes(
                                Number(product.id),
                              )}
                              onChange={() => toggleProduct(Number(product.id))}
                              className={styles.checkbox}
                            />
                            <span className={styles.checkboxLabel}>
                              {product.name}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  )}

                  {selectedProducts.length > 0 && (
                    <div className={styles.selectedTags}>
                      {selectedProducts.map((product) => (
                        <span key={product.id} className={styles.tag}>
                          {product.name}
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
                  {form.filterType === "CATEGORY"
                    ? "Categories"
                    : form.filterType === "TAG"
                      ? "Tags"
                      : "Products"}
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
