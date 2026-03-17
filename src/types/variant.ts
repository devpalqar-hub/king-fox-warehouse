export interface InventoryVariant {
  id: number;
  sku: string;
  size: string;
  color: string;
  totalStock: number;
  lowStock: boolean;

  product: {
    id: number;
    name: string;
    categoryId: number;
  };
}