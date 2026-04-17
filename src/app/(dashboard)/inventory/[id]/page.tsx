"use client";

import styles from "./inventoryDetails.module.css";
import { useState, useEffect } from "react";
import { MapPin, ArrowRightLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { getInventory } from "@/services/inventory.service";
import {
  getVariantStock,
  addStock,
  transferStock,
  returnStock,
} from "@/services/inventory.service";
import { useToast } from "@/components/toast/ToastProvider";
import BackButton from "@/components/backButton/backButton";

const InventoryDetailsPage = () => {
  const { showToast } = useToast();
  const params = useParams();
  const variantId = Number(params.id);

  const [variant, setVariant] = useState<any>(null);
  const [stock, setStock] = useState<any[]>([]);

  const [selectedBranch, setSelectedBranch] = useState("");
  const [quantity, setQuantity] = useState("");

  const [fromBranch, setFromBranch] = useState("");
  const [toBranch, setToBranch] = useState("");
  const [transferQty, setTransferQty] = useState("");

  const [returnBranch, setReturnBranch] = useState("");
  const [returnQty, setReturnQty] = useState("");
  const [returnNote, setReturnNote] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const list = await getInventory();
      const found = list.find((v) => v.id === variantId);
      setVariant(found);

      const stockData = await getVariantStock(variantId);
      setStock(stockData);
    };

    if (variantId) fetchData();
  }, [variantId]);

  const handleAddStock = async () => {
    try {
      if (!selectedBranch || !quantity) {
        showToast("Fill all fields", "error");
        return;
      }

      if (Number(quantity) <= 0) {
        showToast("Invalid quantity", "error");
        return;
      }

      await addStock({
        variantId,
        branchId: Number(selectedBranch),
        quantity: Number(quantity),
        note: "Manual update",
      });

      showToast("Stock updated!", "success");

      const updated = await getVariantStock(variantId);
      setStock(updated);

      setQuantity("");
      setSelectedBranch("");
    } catch {
      showToast("Failed to update stock", "error");
    }
  };

  const handleTransfer = async () => {
    try {
      if (!fromBranch || !toBranch || !transferQty) {
        showToast("Fill all fields", "error");
        return;
      }

      if (fromBranch === toBranch) {
        showToast("Source & destination cannot be same", "error");
        return;
      }

      if (Number(transferQty) <= 0) {
        showToast("Invalid quantity", "error");
        return;
      }

      await transferStock({
        fromBranchId: Number(fromBranch),
        toBranchId: Number(toBranch),
        items: [
          {
            variantId,
            quantity: Number(transferQty),
          },
        ],
      });

      showToast("Transfer successful!", "success");

      const updated = await getVariantStock(variantId);
      setStock(updated);

      setTransferQty("");
      setFromBranch("");
      setToBranch("");
    } catch {
      showToast("Transfer failed", "error");
    }
  };

  const handleReturnStock = async () => {
    try {
      if (!returnBranch || !returnQty) {
        showToast("Fill all fields", "error");
        return;
      }

      if (Number(returnQty) <= 0) {
        showToast("Invalid quantity", "error");
        return;
      }

      const selected = stock.find(
        (b) => b.inventoryId === Number(returnBranch),
      );

      if (!selected) {
        showToast("Invalid selection", "error");
        return;
      }

      if (selected.stock === 0) {
        showToast("Cannot return from zero stock", "error");
        return;
      }

      await returnStock({
        inventoryId: Number(returnBranch), // branch stock id
        variantId,
        stockCount: Number(returnQty),
        note: returnNote || "Returned to supplier",
      });

      showToast("Stock returned successfully!", "success");

      const updated = await getVariantStock(variantId);
      setStock(updated);

      setReturnBranch("");
      setReturnQty("");
      setReturnNote("");
    } catch {
      showToast("Return failed", "error");
    }
  };

  return (
    <div className={styles.container}>
      {/* PRODUCT */}
      <BackButton />
      <section className={styles.productCard}>
        {variant ? (
          <div className={styles.productLeft}>
            <div className={styles.productImage}></div>

            <div>
              <span className={styles.categoryBadge}>
                {variant.product?.categoryId}
              </span>

              <h2 className={styles.productTitle}>
                {variant.product.name} - {variant.color} (Size {variant.size})
              </h2>

              <p className={styles.sku}>SKU: {variant.sku}</p>

              <p className={styles.stockText}>
                TOTAL STOCK <span>{variant.totalStock} Units</span>
              </p>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </section>

      <div className={styles.grid}>
        {/* LEFT */}
        <div className={styles.leftColumn}>
          {/* STOCK BY BRANCH */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Stock by Branch</h3>
              <span>{stock.length} Branches Active</span>
            </div>

            <div className={styles.branchList}>
              {stock.map((b) => (
                <div key={b.branchId} className={styles.branchItem}>
                  <MapPin size={18} />

                  <div className={styles.branchInfo}>
                    <p className={styles.branchName}>{b.branchName}</p>
                  </div>

                  <div className={styles.branchStock}>
                    <p>{b.stock} units</p>

                    <span
                      className={
                        b.outOfStock
                          ? styles.outStock
                          : b.lowStock
                            ? styles.lowStock
                            : styles.inStock
                      }
                    >
                      {b.outOfStock
                        ? "OUT OF STOCK"
                        : b.lowStock
                          ? "LOW STOCK"
                          : "IN STOCK"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TRANSFER */}
          <section className={styles.card}>
            <h3>Transfer Stock</h3>

            <div className={styles.transferRow}>
              <select
                value={fromBranch}
                onChange={(e) => setFromBranch(e.target.value)}
              >
                <option value="">Source</option>
                {stock.map((b) => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.branchName}
                  </option>
                ))}
              </select>

              <select
                value={toBranch}
                onChange={(e) => setToBranch(e.target.value)}
              >
                <option value="">Destination</option>
                {stock.map((b) => (
                  <option key={b.branchId} value={b.branchId}>
                    {b.branchName}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Qty"
                value={transferQty}
                onChange={(e) => setTransferQty(e.target.value)}
              />

              <button className={styles.transferBtn} onClick={handleTransfer}>
                <ArrowRightLeft size={16} /> Transfer
              </button>
            </div>
          </section>

          <section className={styles.card}>
            <h3>Return Stock</h3>

            <div className={styles.returnRow}>
              <select
                value={returnBranch}
                onChange={(e) => setReturnBranch(e.target.value)}
              >
                <option value="">Select Branch</option>
                {stock.map((b) => (
                  <option
                    key={b.inventoryId}
                    value={b.inventoryId}
                    disabled={b.stock === 0}
                  >
                    {b.branchName} ({b.stock})
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Qty"
                value={returnQty}
                onChange={(e) => setReturnQty(e.target.value)}
              />

              <input
                placeholder="Reason for return (optional)"
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                className={styles.noteTextarea}
              />

              <button
                className={styles.transferBtn}
                onClick={handleReturnStock}
              >
                Return
              </button>
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div className={styles.rightColumn}>
          {/* ADD STOCK */}
          <section className={styles.card}>
            <h3>Add New Stock</h3>
            <p className={styles.cardSub}>Increase inventory for a location</p>

            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="">Select branch</option>
              {stock.map((b) => (
                <option key={b.branchId} value={b.branchId}>
                  {b.branchName}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <button className={styles.primaryBtn} onClick={handleAddStock}>
              Update Inventory
            </button>
          </section>

          {/* NOTE */}
          <section className={styles.noteCard}>
            <h4>System Note</h4>
            <p>All transfers generate tracking IDs and require verification.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetailsPage;
