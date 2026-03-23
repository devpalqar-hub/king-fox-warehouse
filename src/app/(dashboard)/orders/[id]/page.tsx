"use client";
import React from 'react';
import { 
  Calendar, Check, Package, Truck, 
  MapPin, Mail, Phone, Info, User, ClipboardList 
} from 'lucide-react';
import styles from './orderdetail.module.css';

export default function OrderDetailPage() {
  return (
    <div className={styles.container}>
      <header className={styles.topHeader}>
        <div className={styles.orderIdGroup}>
          <h1>#ORD-20260323-001 <span className={styles.packedBadge}>Packed</span></h1>
          <div className={styles.timestamp}>
            <Calendar size={14} /> Placed on March 23, 2026 at 10:45 AM
          </div>
        </div>
        <div className={styles.btnActions}>
          <button className={styles.downloadBtn}>Download Invoice</button>
          <button className={styles.shipBtn}>Ship Order</button>
        </div>
      </header>

      <div className={styles.grid}>
        {/* Main Side */}
        <main>
          <section className={styles.card}>
            <div className={styles.sectionTitle}>Status Flow</div>
            <div className={styles.flowWrapper}>
              <div className={styles.flowLine} />
              <FlowStep label="Pending" time="Mar 23, 10:45 AM" status="active" />
              <FlowStep label="Confirmed" time="Mar 23, 11:15 AM" status="active" />
              <FlowStep label="Packed" time="Mar 23, 02:30 PM" status="current" />
              <FlowStep label="Shipped" time="Waiting..." status="upcoming" />
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionTitle}>
              Order Items <span style={{fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500}}>2 Items Total</span>
            </div>
            <table className={styles.itemTable}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>QTY</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className={styles.productCell}>
                      <div className={styles.imgPlaceholder} />
                      <div>
                        <div style={{fontWeight: 700}}>T-Shirt</div>
                        <div style={{fontSize: '0.75rem', color: '#64748b'}}>Size: M, Color: Red</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.sku}>TS - RED - M</td>
                  <td style={{fontWeight: 600}}>2</td>
                  <td style={{fontWeight: 600}}>500</td>
                  <td className={styles.subtotal}>1000</td>
                </tr>
              </tbody>
            </table>
          </section>
        </main>

        {/* Sidebar Side */}
        <aside>
          <div className={styles.pricingCard}>
            <div className={styles.summaryHeader}>
              <ClipboardList size={20} color="#6366f1" /> Pricing Summary
            </div>
            <PriceLine label="Subtotal" value="1,000" />
            <PriceLine 
              label={<>Discount <span className={styles.vouchertag}>NEW50</span></>} 
              value="- 100" 
              isNegative 
            />
            <PriceLine label="Voucher" value="New Year Lucky Draw" isItalic />
            <PriceLine label="Shipping" value="50" />
            
            <div className={styles.totalArea}>
              <div>
                <div className={styles.mutedText} style={{fontSize: '0.7rem', fontWeight: 800}}>TOTAL AMOUNT</div>
                <div className={styles.totalVal}>1,150</div>
              </div>
              <span className={styles.paid}>PAID</span>
            </div>
          </div>

          <div className={styles.card} style={{marginTop: '1.5rem'}}>
            <div style={{fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '1rem'}}>WAREHOUSE INFO</div>
            <div className={styles.infoBox}>
               <div className={styles.infoIcon}><Package size={20}/></div>
               <div>
                 <div style={{fontWeight: 700}}>Kochi Warehouse</div>
                 <div style={{fontSize: '0.75rem', color: '#64748b'}}>ID: 2 • Kerala Hub</div>
               </div>
            </div>
            <div style={{fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', marginBottom: '1rem'}}>SHIPMENT INFORMATION</div>
            <SidebarData label="Provider" value="Delhivery" />
            <SidebarData label="Tracking ID" value="DL123456" />
            <a href="#" className={styles.trackLink}>Track Shipment →</a>
            <button className={styles.updateBtn}>UPDATE TRACKING</button>
          </div>

          <div className={styles.card}>
            <div className={styles.summaryHeader} style={{color: '#4f46e5', marginBottom: '1rem'}}>
              <User size={18} /> <span style={{color: '#1e293b'}}>Customer Info</span>
            </div>
            <div className={styles.customerHead}>
              <div className={styles.imgPlaceholder} style={{borderRadius: '50%'}}></div>
              <div>
                <div style={{fontWeight: 700}}>Rahul Kumar</div>
                <div style={{fontSize: '0.75rem', color: '#64748b'}}>Active Customer since 2023</div>
              </div>
            </div>
            <Contact icon={<Mail size={14}/>} text="rahul.k@example.com" />
            <Contact icon={<Phone size={14}/>} text="+91 98765 43210" />
            <Contact icon={<MapPin size={14}/>} text={<div><b>Shipping Address:</b><br/>Kochi, Kerala<br/>India - 682001</div>} />
          </div>
        </aside>
      </div>
    </div>
  );
}

// Sub-components
const FlowStep = ({ label, time, status }: { label: string, time: string, status: 'active' | 'current' | 'upcoming' }) => {
  const icons = { active: <Check size={18}/>, current: <Package size={18}/>, upcoming: <Truck size={18}/> };
  const circles = { active: styles.circleActive, current: styles.circleCurrent, upcoming: '' };
  
  return (
    <div className={styles.step}>
      <div className={`${styles.circle} ${circles[status]}`}>{icons[status]}</div>
      <div className={styles.label}>{label}</div>
      <div className={styles.time}>{time}</div>
    </div>
  );
};

const PriceLine = ({ label, value, isNegative, isItalic }: any) => (
  <div className={styles.priceLine}>
    <span className={styles.mutedText}>{label}</span>
    <span className={`${isNegative ? styles.negative : ''} ${isItalic ? styles.mutedText : ''}`} style={{fontStyle: isItalic ? 'italic' : 'normal'}}>
      {value}
    </span>
  </div>
);

const SidebarData = ({ label, value }: any) => (
  <div className={styles.dataLine}>
    <span className={styles.mutedText}>{label}</span>
    <span style={{fontWeight: 700}}>{value}</span>
  </div>
);

const Contact = ({ icon, text }: any) => (
  <div className={styles.contactRow}>
    <span style={{color: '#94a3b8', marginTop: '2px'}}>{icon}</span>
    <span>{text}</span>
  </div>
);