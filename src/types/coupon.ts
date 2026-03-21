export interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  minPurchaseAmount: string;
  maxDiscountAmount: string | null;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}