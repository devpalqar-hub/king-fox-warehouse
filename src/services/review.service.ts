// services/review.service.ts
import { Review } from "@/types/review";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ReviewResponse {
  summary: {
    total: number;
    averageRating: number;
    distribution: Record<string, number>;
  };
  data: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getReviews = async (
  productName?: string,
  rating?: number,
  page: number = 1,
): Promise<ReviewResponse> => {
  const token = localStorage.getItem("token");

  const params = new URLSearchParams();
  if (productName) params.append("productName", productName);
  if (rating) params.append("rating", rating.toString());
  params.append("page", page.toString());

  const res = await fetch(`${BASE_URL}/v1/user/reviews?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch reviews");

  return res.json();
};

export interface ProductReviewResponse {
  id: number;
  productId: number;
  rating: number;
  title: string;
  body: string;
  createdAt: string;

  product: {
    id: number;
    name: string;
    images: string[];
  };

  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}

export const getProductReviews = async (
  id: string,
): Promise<ProductReviewResponse> => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/admin/reviews/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) throw new Error("Failed to fetch product reviews");

  return res.json();
};

// mock review

export const createMockReview = async (
  productId: string,
  payload: any
) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/products/${productId}/reviews/mock`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) throw new Error("Failed to create review");

  return res.json();
};