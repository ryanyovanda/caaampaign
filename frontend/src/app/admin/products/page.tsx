import { productApi, campaignApi } from '@/lib/api';
import { ProductsClient } from './products-client';

export default async function AdminProductsPage() {
  const [products, campaigns] = await Promise.all([
    productApi.getAll().catch(() => []),
    campaignApi.getAll().catch(() => []),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Products</h1>
      <p className="mt-1 text-sm text-muted">
        Manage products across your campaigns.
      </p>
      <ProductsClient initialProducts={products} campaigns={campaigns} />
    </div>
  );
}
