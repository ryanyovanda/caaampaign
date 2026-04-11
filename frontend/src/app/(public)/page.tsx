import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { campaignApi } from '@/lib/api';
import type { Campaign } from '@/types';

export default async function HomePage() {
  let campaigns: Campaign[] = [];
  try {
    campaigns = await campaignApi.getAll();
  } catch {
  }

  const published = campaigns.filter((c) => c.status === 'published');

  return (
    <>
      <section className="relative flex flex-col items-center justify-center px-6 py-28 text-center">
        <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-5xl">
          Discover CAAAMPAIGN
          <br />
          that matter.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          Browse our curated collection of active campaigns. Find something you
          care about and get involved.
        </p>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-24">
        {published.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg text-muted">
              No campaigns available yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaign/${campaign.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                  {campaign.backgroundImage ? (
                    <Image
                      src={campaign.backgroundImage}
                      alt={campaign.campaignName}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl font-bold text-neutral-300">
                      {campaign.campaignName.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h2 className="text-lg font-semibold leading-snug group-hover:underline">
                      {campaign.campaignName}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm text-muted">
                      {campaign.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-sm font-medium">
                    View campaign
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
