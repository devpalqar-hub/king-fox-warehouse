"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Building2,
  CalendarClock,
  CreditCard,
  FileText,
  MapPin,
  Package,
  Phone,
  Receipt,
  UserRound,
} from "lucide-react";
import BackButton from "@/components/backButton/backButton";
import { getOfflineOrderById } from "@/services/order.service";
import { OfflineOrderDetail } from "@/types/order.types";
import styles from "./offline-order-detail.module.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

function formatCurrency(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);

  if (Number.isNaN(amount)) {
    return "--";
  }

  return currencyFormatter.format(amount);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "--";
  }

  return new Date(value).toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatStatusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function getStatusClass(status: string) {
  return styles[status.toLowerCase()] || styles.defaultStatus;
}

function getSourceType(order: OfflineOrderDetail) {
  return order.sourceType || "OFFLINE";
}

function getItemImage(order: OfflineOrderDetail) {
  return order.items.find((item) => item.variant.image)?.variant.image || null;
}

export default function OfflineOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [order, setOrder] = useState<OfflineOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchOrder = async () => {
      setLoading(true);
      const response = await getOfflineOrderById(id);

      if (!isMounted) {
        return;
      }

      setOrder(response);
      setLoading(false);
    };

    if (id) {
      fetchOrder();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const sourceType = useMemo(
    () => (order ? getSourceType(order) : "OFFLINE"),
    [order],
  );

  if (loading) {
    return <div className={styles.stateMessage}>Loading order details...</div>;
  }

  if (!order) {
    return <div className={styles.stateMessage}>Offline order not found.</div>;
  }

  const previewImage = getItemImage(order);

  return (
    <div className={styles.page}>
      <BackButton label="Back to Offline Orders" />

      <section className={styles.heroCard}>
        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <div className={styles.heroEyebrow}>Offline order details</div>
            <div className={styles.titleRow}>
              <h1>{order.invoiceNumber}</h1>
              <span
                className={`${styles.statusBadge} ${getStatusClass(order.status)}`}
              >
                {formatStatusLabel(order.status)}
              </span>
              <span
                className={`${styles.sourceBadge} ${
                  styles[sourceType.toLowerCase()] || styles.defaultSource
                }`}
              >
                {sourceType}
              </span>
            </div>
            <p className={styles.heroMeta}>
              <CalendarClock size={16} />
              Created on {formatDate(order.createdAt)}
            </p>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.statTile}>
              <span>Total Amount</span>
              <strong>{formatCurrency(order.finalAmount)}</strong>
            </div>
            <div className={styles.statTile}>
              <span>Items</span>
              <strong>{order.items.length}</strong>
            </div>
            <div className={styles.statTile}>
              <span>Return Credit</span>
              <strong>{formatCurrency(order.returnCredit)}</strong>
            </div>
          </div>
        </div>

        <div className={styles.previewCard}>
          {previewImage ? (
            <img
              src={previewImage}
              alt={order.invoiceNumber}
              className={styles.previewImage}
            />
          ) : (
            <div className={styles.previewFallback}>
              <Package size={28} />
              <span>No preview image</span>
            </div>
          )}
        </div>
      </section>

      <div className={styles.layout}>
        <div className={styles.mainColumn}>
          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <h2>
                <Receipt size={18} />
                Order Summary
              </h2>
            </div>

            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}>
                <span>Subtotal</span>
                <strong>{formatCurrency(order.subtotal)}</strong>
              </div>
              <div className={styles.metricCard}>
                <span>Discount</span>
                <strong>{formatCurrency(order.discount)}</strong>
              </div>
              <div className={styles.metricCard}>
                <span>Manual Discount</span>
                <strong>{formatCurrency(order.manualDiscount)}</strong>
              </div>
              <div className={styles.metricCard}>
                <span>Tax</span>
                <strong>{formatCurrency(order.tax)}</strong>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <h2>
                <Package size={18} />
                Ordered Items
              </h2>
              <span>{order.items.length} line items</span>
            </div>

            <div className={styles.itemsTableWrapper}>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU / Barcode</th>
                    <th>Qty</th>
                    <th>Returned</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Product">
                        <div className={styles.productCell}>
                          {item.variant.image ? (
                            <img
                              src={item.variant.image}
                              alt={item.variant.product.name}
                              className={styles.productImage}
                            />
                          ) : (
                            <div className={styles.productPlaceholder}>
                              <Package size={18} />
                            </div>
                          )}

                          <div>
                            <div className={styles.productName}>
                              {item.variant.product.name}
                            </div>
                            <div className={styles.productMeta}>
                              Size: {item.variant.size || "--"} | Color:{" "}
                              {item.variant.color || "--"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td data-label="SKU / Barcode">
                        <div className={styles.primaryValue}>
                          {item.variant.sku || "--"}
                        </div>
                        <div className={styles.secondaryValue}>
                          Barcode: {item.variant.barcode || "--"}
                        </div>
                      </td>
                      <td data-label="Qty">{item.quantity}</td>
                      <td data-label="Returned">{item.returnedQuantity}</td>
                      <td data-label="Price">{formatCurrency(item.price)}</td>
                      <td data-label="Subtotal" className={styles.boldValue}>
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <h2>
                <CreditCard size={18} />
                Payment History
              </h2>
              <span>{order.payments.length} entries</span>
            </div>

            {order.payments.length === 0 ? (
              <p className={styles.emptyText}>No payment entries available.</p>
            ) : (
              <div className={styles.paymentList}>
                {order.payments.map((payment) => (
                  <div key={payment.id} className={styles.paymentCard}>
                    <div>
                      <div className={styles.paymentMethod}>
                        {payment.paymentMethod}
                      </div>
                      <div className={styles.secondaryValue}>
                        Paid at {formatDate(payment.paidAt)}
                      </div>
                    </div>
                    <strong>{formatCurrency(payment.amount)}</strong>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className={styles.sidebar}>
          <section className={`${styles.card} ${styles.darkCard}`}>
            <div className={styles.sectionHeader}>
              <h2>
                <FileText size={18} />
                Pricing Breakdown
              </h2>
            </div>

            <div className={styles.priceRow}>
              <span>Subtotal</span>
              <strong>{formatCurrency(order.subtotal)}</strong>
            </div>
            <div className={styles.priceRow}>
              <span>Discount</span>
              <strong>- {formatCurrency(order.discount)}</strong>
            </div>
            <div className={styles.priceRow}>
              <span>Manual Discount</span>
              <strong>- {formatCurrency(order.manualDiscount)}</strong>
            </div>
            <div className={styles.priceRow}>
              <span>Tax</span>
              <strong>{formatCurrency(order.tax)}</strong>
            </div>
            <div className={styles.priceRow}>
              <span>Return Credit</span>
              <strong>{formatCurrency(order.returnCredit)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>Final Amount</span>
              <strong>{formatCurrency(order.finalAmount)}</strong>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <h2>
                <UserRound size={18} />
                Customer
              </h2>
            </div>

            <div className={styles.infoStack}>
              <div className={styles.infoRow}>
                <span>Name</span>
                <strong>{order.customer?.name || "Walk-in Customer"}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Phone</span>
                <strong>{order.customer?.phone || "--"}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Address</span>
                <strong>{order.customer?.address || "--"}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Customer ID</span>
                <strong>{order.customerId ?? "--"}</strong>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <h2>
                <Building2 size={18} />
                Branch & Staff
              </h2>
            </div>

            <div className={styles.infoStack}>
              <div className={styles.infoRow}>
                <span>Branch</span>
                <strong>{order.branch?.name || "--"}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Phone</span>
                <strong>{order.branch?.phone || "--"}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Type</span>
                <strong>{order.branch?.type || "--"}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Handled By</span>
                <strong>{order.user?.name || "--"}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Attended Staff ID</span>
                <strong>{order.attendedByStaffId ?? "--"}</strong>
              </div>
            </div>

            <div className={styles.inlineMeta}>
              <MapPin size={15} />
              <span>{order.branch?.address || "Address not available"}</span>
            </div>
            {order.branch?.phone && (
              <div className={styles.inlineMeta}>
                <Phone size={15} />
                <span>{order.branch.phone}</span>
              </div>
            )}
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <h2>
                <FileText size={18} />
                Order Metadata
              </h2>
            </div>

            <div className={styles.infoStack}>
              <div className={styles.infoRow}>
                <span>Order ID</span>
                <strong>{order.id}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Branch ID</span>
                <strong>{order.branchId ?? "--"}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>User ID</span>
                <strong>{order.userId ?? "--"}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Coupon ID</span>
                <strong>{order.couponId ?? "--"}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>Coupon</span>
                <strong>
                  {order.coupon?.code || order.coupon?.title || "Not applied"}
                </strong>
              </div>
              <div className={styles.infoRow}>
                <span>Supports Pickup</span>
                <strong>
                  {typeof order.branch?.supportsPickup === "boolean"
                    ? order.branch.supportsPickup
                      ? "Yes"
                      : "No"
                    : "--"}
                </strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
