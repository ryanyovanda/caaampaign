export interface Campaign {
  id: string;
  campaignName: string;
  slug: string;
  description: string;
  status: 'draft' | 'published';
  backgroundImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  campaignId: string;
  productName: string;
  description: string;
  eventDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  productId: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}
