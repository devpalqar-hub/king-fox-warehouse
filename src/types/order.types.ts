export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  finalAmount: string;
  paymentMethod: string;
  createdAt: string;
  sourceType: "ONLINE" | "OFFLINE";
  customer: {
  id: number;
  name: string;
  phone: string;
} | null;

  warehouseBranch: {
    id: number;
    name: string;
  };

  _count: {
    items: number;
  };
}

export interface OrderResponse {
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderSummary {
  total: number;
  totalRevenue: number;
  byStatus: {
    pending: number;
    packed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}
export interface OrderDetail {
  id: number;
  orderNumber: string;
  status: string;
  finalAmount: string;
  paymentMethod: string;
  createdAt: string;

  subtotal: string;
  discount: string;
  tax: string;
  shippingCharge: string;

  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };

  warehouseBranch: {
    name: string;
  };

  items: {
    id: number;
    quantity: number;
    price: string;
    subtotal: string;
    variant: {
      size: string;
      color: string;
      sku: string;
      product: {
        name: string;
      };
    };
  }[];
}

export interface OfflineOrderCustomer {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
}

export interface OfflineOrderBranch {
  id: number;
  name: string;
  phone?: string;
  address?: string;
  type?: string;
  supportsPickup?: boolean;
  createdAt?: string;
}

export interface OfflineOrderUser {
  id: number;
  name: string;
}

export interface OfflineOrder {
  id: number;
  invoiceNumber: string;
  search: string;
  customerId: number | null;
  branchId: number | null;
  userId: number | null;
  couponId: number | null;
  subtotal: string;
  discount: string;
  manualDiscount: string;
  tax: string;
  finalAmount: string;
  attendedByStaffId: number | null;
  status: string;
  createdAt: string;
  returnCredit: string;
  sourceType?: string;
  customer: OfflineOrderCustomer | null;
  branch: OfflineOrderBranch | null;
  user: OfflineOrderUser | null;
  _count: {
    items: number;
  };
}

export interface OfflineOrderResponse {
  data: OfflineOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OfflineOrderVariantProductMeta {
  text: string;
  title: string;
  imageUrl: string;
}

export interface OfflineOrderVariantProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  brandId: number | null;
  categoryId: number | null;
  createdAt: string;
  images: string[];
  metaInfo: OfflineOrderVariantProductMeta[];
  isFreeShipping: boolean;
  isOnlineAvailable: boolean;
  status: string;
}

export interface OfflineOrderVariant {
  id: number;
  productId: number;
  size: string | null;
  color: string | null;
  sku: string | null;
  barcode: string | null;
  weight: number | null;
  costPrice: string | null;
  sellingPrice: string | null;
  createdAt: string;
  image: string | null;
  product: OfflineOrderVariantProduct;
}

export interface OfflineOrderItem {
  id: number;
  invoiceId: number;
  variantId: number;
  quantity: number;
  price: string;
  subtotal: string;
  returnedQuantity: number;
  variant: OfflineOrderVariant;
}

export interface OfflineOrderPayment {
  id: number;
  invoiceId: number;
  paymentMethod: string;
  amount: string;
  paidAt: string;
}

export interface OfflineOrderCoupon {
  id: number;
  code?: string;
  title?: string;
  type?: string;
  value?: string | number;
}

export interface OfflineOrderDetail extends OfflineOrder {
  branch: OfflineOrderBranch | null;
  coupon: OfflineOrderCoupon | null;
  items: OfflineOrderItem[];
  payments: OfflineOrderPayment[];
}
