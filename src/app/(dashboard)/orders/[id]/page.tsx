'use client'
import styles from './orderdetail.module.css';

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
  Store
} from 'lucide-react';
import { getBranches } from "@/services/branch.service";
import { updateOrderStatus } from "@/services/order.service";
import { useEffect, useState } from "react";
import { getOrderById } from "@/services/order.service";
import { useParams } from "next/navigation";
import { updateTracking } from "@/services/order.service";

export default function OrderDetailPage() {
  const params = useParams();
  const id = Number(params.id);
const [order, setOrder] = useState<any>(null);

const steps = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED"];

const currentIndex = order
  ? steps.indexOf(order.status)
  : -1;
  const [branches, setBranches] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
const [trackingForm, setTrackingForm] = useState({
  providerName: "",
  trackingId: "",
  trackingUrl: "",
});

  useEffect(() => {
  const fetchBranches = async () => {
    const data = await getBranches();
    setBranches(data?.data || data);
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
  return (
    <div className={styles.container}>
      {/* Header Section */}
    {/* Header Card */}
<section className={`${styles.card} ${styles.headerCard}`}>
  <header className={styles.header}>
    
    {/* LEFT */}
    <div className={styles.headerLeft}>
      <div className={styles.titleRow}>
        <h1>#{order.orderNumber}</h1>
<span className={styles.badge}>{order.status}</span>
      </div>

      <p className={styles.timestamp}>
  <Clock size={14} />
  Placed on {new Date(order.createdAt).toLocaleString()}
</p>
    </div>

    {/* RIGHT */}
    <div className={styles.headerActions}>
      <button className={styles.btnSecondary}>
        Download Invoice
      </button>
      <button className={styles.btnPrimary}>
        Ship Order
      </button>
    </div>

  </header>
</section>

      <div className={styles.grid}>
        {/* Main Content (Left Column) */}
        <div className={styles.mainContent}>
          
          {/* Status Flow Card */}
         <section className={styles.card}>
  <h3>Status Flow</h3>

  <div className={styles.statusStepper}>
    {steps.map((step, index) => {
      const isCompleted = index < currentIndex;
      const isActive = index === currentIndex;

      return (
        <div
          key={step}
          className={`${styles.step} 
            ${isCompleted ? styles.completed : ""} 
            ${isActive ? styles.active : ""}`}
        >
          <div className={styles.iconCircle}>
            {isCompleted ? (
              <CheckCircle size={20} />
            ) : step === "PACKED" ? (
              <Package size={20} />
            ) : step === "SHIPPED" ? (
              <Truck size={20} />
            ) : (
              <Clock size={20} />
            )}
          </div>

          <div className={styles.stepInfo}>
            <strong>{step}</strong>

            <span>
              {isCompleted || isActive
                ? new Date(order.updatedAt).toLocaleString()
                : "Waiting..."}
            </span>
          </div>
        </div>
      );
    })}
  </div>
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

        {/* Sidebar (Right Column) */}
        <aside className={styles.sidebar}>
          
          {/* Pricing Summary */}
          <section className={`${styles.card} ${styles.darkCard}`}>
            <h3><FileText size={18} /> Pricing Summary</h3>
            <div className={styles.priceRow}>
              <span>Subtotal</span>
              <span>{order.subtotal}</span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.discountText}>- {order.discount}</span>
              <span className={styles.discountText}>- 100</span>
            </div>
            <div className={styles.priceRow}>
              <span>Voucher</span>
              <span className={styles.italicText}>New Year Lucky Draw</span>
            </div>
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
    
    {/* 🔽 DROPDOWN */}
    <select
      className={styles.select}
      value={order?.warehouseBranch?.id || ""}
      onChange={async (e) => {
        const branchId = Number(e.target.value);

        const selectedBranch = branches.find(
          (b: any) => b.id === branchId
        );

        // update UI always
        setOrder((prev: any) => ({
          ...prev,
          warehouseBranch: selectedBranch,
        }));

        // call API only for warehouse
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

    {/* INFO */}
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
    <a href={shipment.trackingUrl} target="_blank" className={styles.link}>
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
            <h3><User size={18} /> Customer Info</h3>
            <div className={styles.customerProfile}>
              <div className={styles.avatar}></div>
              <div>
                <strong>{order.customer.name}</strong>
                <p>Active Customer since 2023</p>
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
  <span>{order.customer.address}</span>
</div>
            </div>
          </section>
        </aside>
      </div>
      {showModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalBox}>
      
      <h3>Update Tracking</h3>

      {/* Provider */}
      <input
        type="text"
        placeholder="Provider Name"
        value={trackingForm.providerName}
        onChange={(e) =>
          setTrackingForm({ ...trackingForm, providerName: e.target.value })
        }
        className={styles.input}
      />

      {/* Tracking ID */}
      <input
        type="text"
        placeholder="Tracking ID"
        value={trackingForm.trackingId}
        onChange={(e) =>
          setTrackingForm({ ...trackingForm, trackingId: e.target.value })
        }
        className={styles.input}
      />

      {/* URL */}
      <input
        type="text"
        placeholder="Tracking URL"
        value={trackingForm.trackingUrl}
        onChange={(e) =>
          setTrackingForm({ ...trackingForm, trackingUrl: e.target.value })
        }
        className={styles.input}
      />

      {/* Buttons */}
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
        // ✅ refresh order data
        const updated = await getOrderById(order.id);
        setOrder(updated);

        // ✅ close modal
        setShowModal(false);

        // ✅ reset form
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
    </div>
  );
}