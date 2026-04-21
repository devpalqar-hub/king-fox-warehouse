export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  finalAmount: string;
  paymentMethod: string;
  createdAt: string;

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