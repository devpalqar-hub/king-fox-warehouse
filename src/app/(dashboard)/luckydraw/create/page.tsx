"use client";

import styles from "./create.module.css";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createCampaign } from "@/services/luckydraw.service";
import { useToast } from "@/components/toast/ToastProvider";
import { getBranches } from "@/services/branch.service";
import { getCategories } from "@/services/category.service";
import { getTags, type Tag } from "@/services/tag.service";
import { getProducts } from "@/services/product.service";
import BackButton from "@/components/backButton/backButton";
import { ChevronDown, AlertCircle, Search } from "lucide-react";
import type { Product } from "@/types/product";
import type { Branch } from "@/types/branch.types";
import type { Category } from "@/types/category";

type CampaignForm = {
  name: string;
  description: string;
  image: string;
  totalVouchersLimit: string;
  startDate: string;
  endDate: string;
  priority: string;
  filterType: "CATEGORY" | "TAG" | "PRODUCT";
  branchIds: number[];
  categoryIds: number[];
  tagIds: number[];
  productIds: number[];
};

type EditableCampaignField = Exclude<
  keyof CampaignForm,
  "branchIds" | "categoryIds" | "tagIds" | "productIds"
>;

const DEFAULT_BANNER_IMAGE = "https://picsum.photos/800/250";

const CreateCampaignPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const branchRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);
  const productRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState<CampaignForm>({
    name: "",
    description: "",
    image: "",
    totalVouchersLimit: "",
    startDate: "",
    endDate: "",
    priority: "1",
    filterType: "CATEGORY",
    branchIds: [] as number[],
    categoryIds: [] as number[],
    tagIds: [] as number[],
    productIds: [] as number[],
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (branchRef.current && !branchRef.current.contains(target)) {
        setShowBranchDropdown(false);
      }

      if (filterRef.current && !filterRef.current.contains(target)) {
        setShowFilterDropdown(false);
      }

      if (productRef.current && !productRef.current.contains(target)) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const branchesData = await getBranches();
        setBranches(branchesData);

        const categoriesData = await getCategories();
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        const tagsData = await getTags();
        setTags(tagsData);

        const productsData = await getProducts({ page: 1, limit: 1000 });
        setProducts(Array.isArray(productsData.data) ? productsData.data : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

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

  const toggleBranch = (id: number) => {
    setForm((prev) => ({
      ...prev,
      branchIds: prev.branchIds.includes(id)
        ? prev.branchIds.filter((b) => b !== id)
        : [...prev.branchIds, id],
    }));
  };

  const toggleCategory = (id: number) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }));
  };

  const toggleTag = (id: number) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(id)
        ? prev.tagIds.filter((t) => t !== id)
        : [...prev.tagIds, id],
    }));
  };

  const toggleProduct = (id: number) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(id)
        ? prev.productIds.filter((productId) => productId !== id)
        : [...prev.productIds, id],
    }));
  };

  const handleBannerClick = () => {
    fileInputRef.current?.click();
  };

  const handleProductDropdownToggle = () => {
    setShowProductDropdown((prev) => {
      if (prev) {
        setProductSearch("");
      }

      return !prev;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const previewUrl = URL.createObjectURL(file);

      if (!file.type.startsWith("image/")) {
        showToast("Only images allowed", "error");
        return;
      }
      setForm((prev) => ({
        ...prev,
        image: previewUrl,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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

    try {
      await createCampaign({
        ...form,
        categoryIds: form.filterType === "CATEGORY" ? form.categoryIds : [],
        tagIds: form.filterType === "TAG" ? form.tagIds : [],
        productIds: form.filterType === "PRODUCT" ? form.productIds : [],
        totalVouchersLimit: Number(form.totalVouchersLimit),
        priority: Number(form.priority),
      });

      showToast("Campaign created successfully!", "success");
      router.push("/luckydraw");
    } catch (error) {
      console.error(error);
      showToast("Error creating campaign", "error");
    }
  };

  const selectedBranches = branches.filter((b) =>
    form.branchIds.includes(b.id),
  );
  const selectedFilterItems =
    form.filterType === "CATEGORY"
      ? categories.filter((c) => form.categoryIds.includes(c.id))
      : form.filterType === "TAG"
        ? tags.filter((t) => form.tagIds.includes(t.id))
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
      {/* Header */}
      <BackButton />
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Create Lucky Draw Campaign</h1>
          <p className={styles.subtitle}>
            Set up a new campaign with vouchers and targeting
          </p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => router.back()} className={styles.btnCancel}>
            Cancel
          </button>
          <button onClick={handleSubmit} className={styles.btnCreate}>
            Create Campaign
          </button>
        </div>
      </div>

      <form className={styles.form}>
        <div className={styles.layout}>
          {/* Main Content */}
          <div className={styles.mainContent}>
            {/* Banner Section */}
            <section className={styles.section}>
              <div className={styles.bannerContainer}>
                <img
                  src={form.image || DEFAULT_BANNER_IMAGE}
                  alt="Campaign banner"
                  className={styles.bannerImage}
                />
                <div className={styles.bannerOverlay} />
                <div className={styles.bannerContent}>
                  <h2>{form.name || "Campaign Preview"}</h2>
                  <button
                    type="button"
                    onClick={handleBannerClick}
                    className={styles.btnChangeBanner}
                  >
                    Change Image
                  </button>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            </section>

            {/* Basic Information */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Basic Information</h2>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Campaign Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter campaign name"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your campaign..."
                  className={styles.textarea}
                  rows={3}
                />
              </div>
            </section>

            {/* Campaign Dates */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Campaign Duration</h2>

              <div className={styles.fieldsRow}>
                <div className={styles.fieldGroup}>
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
                <div className={styles.fieldGroup}>
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

            {/* Campaign Settings */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Campaign Settings</h2>

              <div className={styles.fieldsRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Total Vouchers Limit *</label>
                  <input
                    type="number"
                    name="totalVouchersLimit"
                    value={form.totalVouchersLimit}
                    onChange={handleChange}
                    placeholder="e.g. 500"
                    className={styles.input}
                    min="1"
                    required
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Priority (1-10)</label>
                  <input
                    type="number"
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className={styles.input}
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            </section>

            {/* Branches */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Select Branches *</h2>

              <div className={styles.dropdownWrapper} ref={branchRef}>
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
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Target Audience</h2>

              <div className={styles.fieldGroup}>
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
                <div className={styles.dropdownWrapper} ref={filterRef}>
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
                <div className={styles.dropdownWrapper} ref={filterRef}>
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

              {form.filterType === "PRODUCT" && (
                <div className={styles.dropdownWrapper} ref={productRef}>
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

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.infoCard}>
              <AlertCircle size={20} />
              <h3>Campaign Info</h3>
              <div className={styles.infoContent}>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={styles.badge}>New</span>
                </p>
                <p>
                  <strong>Branches:</strong> {form.branchIds.length || 0}
                </p>
                <p>
                  <strong>Filter:</strong>{" "}
                  {form.filterType === "CATEGORY"
                    ? "Categories"
                    : form.filterType === "TAG"
                      ? "Tags"
                      : "Products"}
                </p>
                <p>
                  <strong>Selected:</strong> {selectedFilterItems.length || 0}
                </p>
              </div>
            </div>

            <div className={styles.helpCard}>
              <h3>Tips</h3>
              <ul>
                <li>Choose at least one branch for distribution</li>
                <li>
                  Select either categories OR tags to target specific products
                </li>
                <li>Set an end date to automatically close the campaign</li>
                <li>Higher priority campaigns appear first</li>
              </ul>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaignPage;
