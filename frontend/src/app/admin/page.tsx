import { campaignApi, productApi, submissionApi } from '@/lib/api';
import { Megaphone, Package, Inbox } from 'lucide-react';

export default async function AdminDashboard() {
  const [campaigns, products, submissions] = await Promise.all([
    campaignApi.getAll().catch(() => []),
    productApi.getAll().catch(() => []),
    submissionApi.getAll().catch(() => []),
  ]);

  const stats = [
    {
      label: 'Campaigns',
      count: campaigns.length,
      icon: Megaphone,
      href: '/admin/campaigns',
    },
    {
      label: 'Products',
      count: products.length,
      icon: Package,
      href: '/admin/products',
    },
    {
      label: 'Submissions',
      count: submissions.length,
      icon: Inbox,
      href: '/admin/submissions',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">
        Overview of your campaign management system.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-border bg-card p-6 transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                <stat.icon className="h-5 w-5 text-muted" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
