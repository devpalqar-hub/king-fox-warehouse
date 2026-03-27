"use client";

import styles from "./create.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCampaign } from "@/services/luckydraw.service";
import { useToast } from "@/components/toast/ToastProvider";
import { useEffect, useRef } from "react";
import { getBranches } from "@/services/branch.service";
import BackButton from "@/components/backButton/backButton";

const CreateCampaignPage = () => {
  const router = useRouter();
  const [branches, setBranches] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "",
    totalVouchersLimit: "",
    startDate: "",
    endDate: "",
    branchIds: [] as number[],
    // status: "ACTIVE",
  });

  useEffect(() => {
    const fetchBranches = async () => {
      const data = await getBranches();
      setBranches(data.data);
    };

    fetchBranches();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleBranch = (id: number) => {
    setForm((prev) => ({
      ...prev,
      branchIds: prev.branchIds.includes(id)
        ? prev.branchIds.filter((b) => b !== id)
        : [...prev.branchIds, id],
    }));
  };

  const handleBannerClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];

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

  const handleSubmit = async () => {
    try {
      if (!form.name || !form.startDate) {
        showToast("Fill required fields", "error");
        return;
      }

      await createCampaign({
        ...form,
        totalVouchersLimit: Number(form.totalVouchersLimit),
      });

      showToast("Campaign created!", "success");
      router.push("/luckydraw");
    } catch {
      showToast("Error creating campaign", "error");
    }
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <BackButton />
      <div className={styles.topBar}>
        <div>
          <h1>Create Campaign</h1>
        </div>

        <div className={styles.actions}>
          <button onClick={() => router.back()} className={styles.btnGhost}>Cancel</button>
          <button className={styles.btnPrimary} onClick={handleSubmit}>
            Save Campaign
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        {/* LEFT */}
        <div className={styles.left}>
          {/* BANNER */}
          <div className={styles.banner}>
            <img
              src={form.image || "https://picsum.photos/800/200"}
              alt="banner"
            />

            <div className={styles.overlay}>
              <p>{form.name || "Campaign Banner Preview"}</p>

              <button onClick={handleBannerClick}>Change Banner</button>
            </div>

            {/* Hidden input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {/* FORM CARD */}
          <div className={styles.card}>
            <label>Campaign Name</label>
            <input
              className={styles.input}
              name="name"
              onChange={handleChange}
            />

            <label>Description</label>
            <textarea
              className={styles.textarea}
              name="description"
              onChange={handleChange}
            />

            <div className={styles.grid}>
              <div>
                <label>Total Vouchers Limit</label>
                <input
                  className={styles.input}
                  name="totalVouchersLimit"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>Branch Selection</label>
                <div className={styles.chips}>
                  {branches.map((branch) => (
                    <span
                      key={branch.id}
                      onClick={() => toggleBranch(branch.id)}
                      className={
                        form.branchIds.includes(branch.id)
                          ? styles.activeChip
                          : styles.chip
                      }
                    >
                      {branch.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.grid}>
              <div>
                <label>Start Date</label>
                <input
                  type="date"
                  className={styles.input}
                  name="startDate"
                  onChange={handleChange}
                />
              </div>

              <div>
                <label>End Date</label>
                <input
                  type="date"
                  className={styles.input}
                  name="endDate"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* RULES */}
          <div className={styles.card}>
            <h3>Prizes and Rules</h3>
            <textarea
              className={styles.textarea}
              placeholder="Enter rules..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignPage;
