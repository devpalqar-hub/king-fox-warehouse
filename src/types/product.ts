export interface Brand {
  
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Variant {
  id: number;
  productId: number;
  size: string;
  color: string;
  sku: string;
  barcode: string;
  costPrice: string;
  sellingPrice: string;
  image: string | null;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  brandId: number;
  categoryId: number;
  images: string[];
  createdAt: string;
  brand: Brand;
  category: Category;
  variants: Variant[];
}

