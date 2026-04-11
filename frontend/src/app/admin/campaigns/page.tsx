import { campaignApi } from '@/lib/api';
import { CampaignsClient } from './campaigns-client';

export default async function AdminCampaignsPage() {
  const campaigns = await campaignApi.getAll().catch(() => []);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
      <p className="mt-1 text-sm text-muted">
        Create, edit, and manage your campaigns.
      </p>
      <CampaignsClient initialCampaigns={campaigns} />
    </div>
  );
}
