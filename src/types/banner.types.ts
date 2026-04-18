export interface Banner {
  id: number;
  title: string;
  mediaUrl: string;
  redirectLink: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type BannerMediaType = "image" | "video";

export interface CreateBannerPayload {
  title: string;
  mediaUrl: string;
  order: number;
  redirectLink: string;
}

export interface UpdateBannerPayload {
  title?: string;
  mediaUrl?: string;
  order?: number;
  redirectLink?: string;
}