
export interface Review {
  id: number;
  rating: number;
  title: string;
  body: string;
  createdAt: string;

  product: {
    name: string;
    images: string[];
  };

  customer: {
    name: string;
    email: string;
  };
}