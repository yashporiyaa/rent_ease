export interface ItemAvailability {
  id: string;
  name: string;
  fullName: string;
  price: number;
  stock: number;
  available: number;
  images: string[];
  description: string | null;
}
