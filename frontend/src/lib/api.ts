import type { Campaign, Product, Submission } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined in your environment variables.');
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function apiFetchRaw(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  return fetch(url, init);
}

export const campaignApi = {
  getAll: () => apiFetch<Campaign[]>('/campaigns', { cache: 'no-store' }),
  getBySlug: (slug: string) => apiFetch<Campaign>(`/campaigns/slug/${slug}`, { cache: 'no-store' }),
  getById: (id: string) => apiFetch<Campaign>(`/campaigns/${id}`, { cache: 'no-store' }),
  create: (formData: FormData) =>
    apiFetchRaw('/campaigns', { method: 'POST', body: formData }),
  update: (id: string, data: Partial<Campaign>) =>
    apiFetchRaw(`/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetchRaw(`/campaigns/${id}`, { method: 'DELETE' }),
};

export const productApi = {
  getAll: () => apiFetch<Product[]>('/products', { cache: 'no-store' }),
  getByCampaignId: (campaignId: string) =>
    apiFetch<Product[]>(`/products/campaign/${campaignId}`, { cache: 'no-store' }),
  getById: (id: string) => apiFetch<Product>(`/products/${id}`, { cache: 'no-store' }),
  create: (data: { campaignId: string; productName: string; description: string; eventDate?: string }) =>
    apiFetchRaw('/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Product>) =>
    apiFetchRaw(`/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetchRaw(`/products/${id}`, { method: 'DELETE' }),
};

export const submissionApi = {
  getAll: () => apiFetch<Submission[]>('/submissions', { cache: 'no-store' }),
  getByProductId: (productId: string) =>
    apiFetch<Submission[]>(`/submissions/by-product/${productId}`, { cache: 'no-store' }),
  getById: (id: string) => apiFetch<Submission>(`/submissions/${id}`, { cache: 'no-store' }),
  create: (data: { productId: string; name: string; email: string; phone: string }) =>
    apiFetchRaw('/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetchRaw(`/submissions/${id}`, { method: 'DELETE' }),
};
