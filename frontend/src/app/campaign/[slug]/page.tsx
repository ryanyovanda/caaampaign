import { notFound } from 'next/navigation';

type Campaign = {
  id: string;
  campaignName: string;
  slug: string;
  description: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
};

async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/campaigns/slug/${slug}`,
    { cache: 'no-store' },
  );

  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch campaign');

  return res.json();
}

export default async function CampaignPage(props: PageProps<'/campaign/[slug]'>) {
  const { slug } = await props.params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) notFound();

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">
        {campaign.status}
      </p>
      <h1 className="text-4xl font-bold mb-4">{campaign.campaignName}</h1>
      <p className="text-gray-600 text-lg">{campaign.description}</p>
    </main>
  );
}
