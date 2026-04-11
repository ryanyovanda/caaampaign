import { submissionApi, productApi, campaignApi } from '@/lib/api';
import { SubmissionsClient } from './submissions-client';

export default async function AdminSubmissionsPage() {
  const [submissions, products, campaigns] = await Promise.all([
    submissionApi.getAll().catch(() => []),
    productApi.getAll().catch(() => []),
    campaignApi.getAll().catch(() => []),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
      <p className="mt-1 text-sm text-muted">
        View all form submissions from your campaigns.
      </p>
      <SubmissionsClient
        initialSubmissions={submissions}
        products={products}
        campaigns={campaigns}
      />
    </div>
  );
}
