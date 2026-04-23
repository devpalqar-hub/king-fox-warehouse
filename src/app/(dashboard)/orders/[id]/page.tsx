"use client";
import styles from "./orderdetail.module.css";

import {
  FileText,
  Truck,
  CheckCircle,
  Package,
  Clock,
  ExternalLink,
  User,
  Mail,
  Phone,
  MapPin,
  Store,
  ChevronRight,
} from "lucide-react";
import { getBranches } from "@/services/branch.service";
import { updateOrderStatus } from "@/services/order.service";
import { useEffect, useState } from "react";
import { getOrderById } from "@/services/order.service";
import { useParams } from "next/navigation";
import { updateTracking } from "@/services/order.service";
import BackButton from "@/components/backButton/backButton";

export default function OrderDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [order, setOrder] = useState<any>(null);

  const steps = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED"];

  const currentIndex = order ? steps.indexOf(order.status) : -1;
  const [branches, setBranches] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [trackingForm, setTrackingForm] = useState({
    providerName: "",
    trackingId: "",
    trackingUrl: "",
  });

  // ── Status change state ──────────────────────────────────────────────────
  const [statusLoading, setStatusLoading] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      const data = await getBranches();
      setBranches(data);
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      const data = await getOrderById(id);
      setOrder(data);
    };
    if (id) fetchOrder();
  }, [id]);

  if (!order) return <p>Loading...</p>;

  const shipment = order.shipments?.[0];

  // ── COD display logic ────────────────────────────────────────────────────
  const isCOD = order.paymentMethod === "COD";
  const displayStatus =
    isCOD && order.status === "SHIPPED" ? "READY TO PICKUP" : order.status;

  // ── Status helpers ───────────────────────────────────────────────────────
  const nextStep = steps[currentIndex + 1] ?? null;
  const canAdvance = currentIndex >= 0 && currentIndex < steps.length - 1;

  const handleStatusClick = (targetStatus: string) => {
    // Only allow moving to the immediately next step
    const targetIndex = steps.indexOf(targetStatus);
    if (targetIndex !== currentIndex + 1) return;
    setPendingStatus(targetStatus);
    setShowStatusConfirm(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    try {
      setStatusLoading(true);
      await updateOrderStatus(order.id, {
        status: pendingStatus,
        warehouseBranchId: order?.warehouseBranch?.id,
      });
      setOrder((prev: any) => ({
        ...prev,
        status: pendingStatus,
        updatedAt: new Date().toISOString(),
      }));
      setShowStatusConfirm(false);
      setPendingStatus(null);
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  const stepIcon = (step: string, isCompleted: boolean) => {
    if (isCompleted) return <CheckCircle size={20} />;
    if (step === "PACKED") return <Package size={20} />;
    if (step === "SHIPPED") return <Truck size={20} />;
    return <Clock size={20} />;
  };

  return (
    <div className={styles.container}>
      <BackButton />

      {/* Header Card */}
      <section className={`${styles.card} ${styles.headerCard}`}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.titleRow}>
              <h1>#{order.orderNumber}</h1>
              <span
                className={`${styles.badge} ${styles[order.status.toLowerCase()]}`}
              >
                {displayStatus}
              </span>
            </div>
            <p className={styles.timestamp}>
              <Clock size={14} />
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </header>
      </section>

      <div className={styles.grid}>
        {/* ── Main Content ── */}
        <div className={styles.mainContent}>
          {/* Status Flow Card */}
          <section className={styles.card}>
            <div className={styles.statusCardHeader}>
              <h3>Status Flow</h3>
              {canAdvance && (
                <button
                  className={styles.advanceBtn}
                  onClick={() => nextStep && handleStatusClick(nextStep)}
                  disabled={statusLoading}
                >
                  {statusLoading ? (
                    "Updating…"
                  ) : (
                    <>
                      Move to{" "}
                      {isCOD && nextStep === "SHIPPED"
                        ? "READY TO PICKUP"
                        : nextStep}
                      <ChevronRight size={15} />
                    </>
                  )}
                </button>
              )}
              {!canAdvance && order.status === "SHIPPED" && (
                <span className={styles.finalBadge}>
                  <CheckCircle size={13} />{" "}
                  {isCOD ? "Ready to Pickup" : "Order Shipped"}
                </span>
              )}
            </div>

            {/* Stepper */}
            <div className={styles.statusStepper}>
              {/* Progress line */}
              <div
                className={styles.progressLine}
                style={{
                  width:
                    currentIndex <= 0
                      ? "0%"
                      : `${(currentIndex / (steps.length - 1)) * 100}%`,
                }}
              />

              {steps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;
                const isNext = index === currentIndex + 1;
                const isFuture = index > currentIndex + 1;

                return (
                  <div
                    key={step}
                    className={`${styles.step}
                      ${isCompleted ? styles.completed : ""}
                      ${isActive ? styles.active : ""}
                      ${isNext ? styles.nextStep : ""}
                      ${isFuture ? styles.futureStep : ""}
                    `}
                  >
                    <button
                      className={styles.iconCircle}
                      onClick={() => isNext && handleStatusClick(step)}
                      disabled={!isNext || statusLoading}
                      title={
                        isNext
                          ? `Advance to ${isCOD && step === "SHIPPED" ? "READY TO PICKUP" : step}`
                          : undefined
                      }
                    >
                      {stepIcon(step, isCompleted)}
                    </button>

                    <div className={styles.stepInfo}>
                      <strong>
                        {isCOD && step === "SHIPPED" ? "READY TO PICKUP" : step}
                      </strong>
                      <span>
                        {isCompleted || isActive
                          ? new Date(order.updatedAt).toLocaleString()
                          : isNext
                            ? "Click to advance"
                            : "Waiting…"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline hint */}
            {canAdvance && (
              <p className={styles.statusHint}>
                Click the{" "}
                <strong>
                  {isCOD && nextStep === "SHIPPED"
                    ? "READY TO PICKUP"
                    : nextStep}
                </strong>{" "}
                circle or the button above to advance the order.
              </p>
            )}
          </section>

          {/* Order Items Card */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Order Items</h3>
              <span>{order.items.length} Items Total</span>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>SKU</th>
                  <th>QTY</th>
                  <th>PRICE</th>
                  <th>SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any) => (
                  <tr key={item.id}>
                    <td className={styles.productCell}>
                      <div className={styles.productImg}></div>
                      <div>
                        <p className={styles.productName}>
                          {item.variant.product.name}
                        </p>
                        <p className={styles.productMeta}>
                          Size: {item.variant.size}, Color: {item.variant.color}
                        </p>
                      </div>
                    </td>
                    <td className={styles.skuText}>{item.variant.sku}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price}</td>
                    <td className={styles.subtotalText}>{item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          {/* Pricing Summary */}
          <section className={`${styles.card} ${styles.darkCard}`}>
            <h3>
              <FileText size={18} /> Pricing Summary
            </h3>
            <div className={styles.priceRow}>
              <span>Subtotal</span>
              <span>{order.subtotal}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.discountText}>Discount</span>
              <span className={styles.discountText}>- {order.discount}</span>
            </div>
            {/* <div className={styles.priceRow}>
              <span>Voucher</span>
              <span className={styles.italicText}>New Year Lucky Draw</span>
            </div> */}
            <div className={styles.priceRow}>
              <span>Shipping</span>
              <span>{order.shippingCharge}</span>
            </div>
            <hr className={styles.divider} />
            <div className={styles.totalRow}>
              <div>
                <p>TOTAL AMOUNT</p>
                <h2>{order.finalAmount}</h2>
              </div>
              <span className={styles.paidBadge}>PAID</span>
            </div>
          </section>

          {/* Warehouse & Shipment */}
          <section className={styles.card}>
            <p className={styles.sidebarLabel}>WAREHOUSE INFO</p>
            <div className={styles.warehouseBox}>
              <div className={styles.warehouseIcon}>
                <Store size={20} />
              </div>
              <div className={styles.warehouseContent}>
                <select
                  className={styles.select}
                  value={order?.warehouseBranch?.id || ""}
                  onChange={async (e) => {
                    const branchId = Number(e.target.value);
                    const selectedBranch = branches.find(
                      (b: any) => b.id === branchId,
                    );
                    setOrder((prev: any) => ({
                      ...prev,
                      warehouseBranch: selectedBranch,
                    }));
                    if (selectedBranch?.type !== "WAREHOUSE") return;
                    await updateOrderStatus(order.id, {
                      warehouseBranchId: branchId,
                      status: order.status,
                    });
                  }}
                >
                  {branches.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.type})
                    </option>
                  ))}
                </select>
                <p className={styles.metaText}>
                  ID: {order?.warehouseBranch?.id} •{" "}
                  {order?.warehouseBranch?.type}
                </p>
              </div>
            </div>

            <p className={styles.sidebarLabel}>SHIPMENT INFORMATION</p>
            <div className={styles.shipmentDetails}>
              <div className={styles.detailRow}>
                <span>Provider</span>
                <strong>{shipment?.providerName || "Not assigned"}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Tracking ID</span>
                <strong>{shipment?.trackingId || "N/A"}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Link</span>
                {shipment?.trackingUrl ? (
                  <a
                    href={shipment.trackingUrl}
                    target="_blank"
                    className={styles.link}
                  >
                    Track Shipment <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className={styles.disabledText}>Not available</span>
                )}
              </div>
              {shipment?.shippedAt && (
                <div className={styles.detailRow}>
                  <span>Shipped On</span>
                  <strong>
                    {new Date(shipment.shippedAt).toLocaleString()}
                  </strong>
                </div>
              )}
            </div>
            <button
              className={styles.btnOutlineFull}
              onClick={() => setShowModal(true)}
            >
              UPDATE TRACKING
            </button>
          </section>

          {/* Customer Info */}
          <section className={styles.card}>
            <h3>
              <User size={18} /> Customer Info
            </h3>
            <div className={styles.customerProfile}>
              <div className={styles.avatar}></div>
              <div>
                <strong>{order.customer.name}</strong>
              </div>
            </div>
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <Mail size={14} /> {order.customer.email}
              </div>
              <div className={styles.contactItem}>
                <Phone size={14} /> {order.customer.phone}
              </div>
              <div className={styles.contactItem}>
                <MapPin size={14} />
                <span>{order.shippingAddress}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* ── Tracking Modal ── */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>Update Tracking</h3>
            <input
              type="text"
              placeholder="Provider Name"
              value={trackingForm.providerName}
              onChange={(e) =>
                setTrackingForm({
                  ...trackingForm,
                  providerName: e.target.value,
                })
              }
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Tracking ID"
              value={trackingForm.trackingId}
              onChange={(e) =>
                setTrackingForm({ ...trackingForm, trackingId: e.target.value })
              }
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Tracking URL"
              value={trackingForm.trackingUrl}
              onChange={(e) =>
                setTrackingForm({
                  ...trackingForm,
                  trackingUrl: e.target.value,
                })
              }
              className={styles.input}
            />
            <div className={styles.modalActions}>
              <button
                className={styles.btnSecondary}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.btnPrimary}
                onClick={async () => {
                  try {
                    const res = await updateTracking(order.id, trackingForm);
                    if (res) {
                      const updated = await getOrderById(order.id);
                      setOrder(updated);
                      setShowModal(false);
                      setTrackingForm({
                        providerName: "",
                        trackingId: "",
                        trackingUrl: "",
                      });
                    }
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status Confirm Modal ── */}
      {showStatusConfirm && pendingStatus && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            if (!statusLoading) {
              setShowStatusConfirm(false);
              setPendingStatus(null);
            }
          }}
        >
          <div
            className={styles.statusModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.statusModalIcon}>
              <Truck size={26} />
            </div>
            <h3 className={styles.statusModalTitle}>Confirm Status Change</h3>
            <p className={styles.statusModalDesc}>
              You're about to change this order's status from{" "}
              <span className={styles.statusFrom}>{displayStatus}</span> to{" "}
              <span className={styles.statusTo}>
                {isCOD && pendingStatus === "SHIPPED"
                  ? "READY TO PICKUP"
                  : pendingStatus}
              </span>
              .
            </p>
            <p className={styles.statusModalWarning}>
              This action will update the order for the customer. Please
              confirm.
            </p>
            <div className={styles.statusModalActions}>
              <button
                className={styles.statusCancelBtn}
                onClick={() => {
                  setShowStatusConfirm(false);
                  setPendingStatus(null);
                }}
                disabled={statusLoading}
              >
                Cancel
              </button>
              <button
                className={styles.statusConfirmBtn}
                onClick={confirmStatusChange}
                disabled={statusLoading}
              >
                {statusLoading ? (
                  "Updating…"
                ) : (
                  <>
                    <CheckCircle size={15} /> Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
