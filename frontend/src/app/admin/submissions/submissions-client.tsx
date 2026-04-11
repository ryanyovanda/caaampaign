'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import type { Submission, Product, Campaign } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function SubmissionsClient({
  initialSubmissions,
  products,
  campaigns,
}: {
  initialSubmissions: Submission[];
  products: Product[];
  campaigns: Campaign[];
}) {
  const router = useRouter();
  const [submissions, setSubmissions] = useState(initialSubmissions);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const campaignMap = new Map(campaigns.map((c) => [c.id, c.campaignName]));

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const res = await fetch(`${API_URL}/submissions/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok && res.status !== 204) throw new Error('Delete failed');
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      router.refresh();
    } catch {
      alert('Failed to delete submission.');
    }
  }

  return (
    <div className="mt-6">
      <div className="mb-4 text-sm text-muted">
        {submissions.length} submission{submissions.length !== 1 ? 's' : ''} total
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-neutral-50">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted">
                    No submissions yet.
                  </td>
                </tr>
              ) : (
                submissions.map((s) => {
                  const product = productMap.get(s.productId);
                  const campaignName = product
                    ? campaignMap.get(product.campaignId) ?? '-'
                    : '-';

                  return (
                    <tr key={s.id} className="hover:bg-neutral-50/50">
                      <td className="px-4 py-3 font-medium">{s.name}</td>
                      <td className="px-4 py-3 text-muted">{s.email}</td>
                      <td className="px-4 py-3 text-muted">{s.phone}</td>
                      <td className="px-4 py-3 text-muted">
                        {product?.productName ?? s.productId}
                      </td>
                      <td className="px-4 py-3 text-muted">{campaignName}</td>
                      <td className="px-4 py-3 text-muted">
                        {new Date(s.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="rounded-lg p-1.5 text-muted hover:bg-red-50 hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
