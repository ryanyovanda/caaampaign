import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { campaignApi, productApi } from '@/lib/api';
import type { Campaign, Product } from '@/types';
import { SubmissionForm } from './submission-form';

async function getCampaignData(slug: string) {
  let campaign: Campaign;
  try {
    campaign = await campaignApi.getBySlug(slug);
  } catch {
    return null;
  }

  let products: Product[] = [];
  try {
    products = await productApi.getByCampaignId(campaign.id);
  } catch {
  }

  return { campaign, products };
}

export default async function CampaignPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const data = await getCampaignData(slug);

  if (!data) notFound();

  const { campaign, products } = data;

  return (
    <>
      <section className="relative">
        <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden bg-neutral-900">
          {campaign.backgroundImage ? (
            <Image
              src={campaign.backgroundImage}
              alt={campaign.campaignName}
              fill
              priority
              className="object-cover opacity-60"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="relative z-10 mx-auto flex h-full max-w-4xl flex-col justify-end px-6 pb-12">
            <Link
              href="/"
              className="mb-6 inline-flex w-fit items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to campaigns
            </Link>
            <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              {campaign.campaignName}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              {campaign.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-6 py-16">
        <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        <p className="mt-2 text-muted">
          Select a product below and submit your information to participate.
        </p>

        {products.length === 0 ? (
          <div className="mt-8 rounded-xl border border-border p-12 text-center text-muted">
            No products available for this campaign yet.
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md"
              >
                <h3 className="text-lg font-semibold">{product.productName}</h3>
                <p className="mt-2 text-sm text-muted line-clamp-3">
                  {product.description}
                </p>
                {product.eventDate && (
                  <p className="mt-3 text-xs font-medium text-muted">
                    Event date:{' '}
                    <span className="text-foreground">
                      {new Date(product.eventDate).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {products.length > 0 && (
        <section className="mx-auto w-full max-w-4xl px-6 pb-24">
          <div className="rounded-2xl border border-border bg-card p-8">
            <h2 className="text-2xl font-bold tracking-tight">
              Submit Your Information
            </h2>
            <p className="mt-2 text-muted">
              Fill in the form below to register. You&apos;ll receive a confirmation
              email after submitting.
            </p>
            <SubmissionForm products={products} />
          </div>
        </section>
      )}
    </>
  );
}
