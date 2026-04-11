import Link from 'next/link';
import { AdminSidebar } from './sidebar';

export const metadata = {
  title: 'Admin',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center border-b border-border bg-card/80 backdrop-blur-md px-6">
          <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors">
            &larr; Back to site
          </Link>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
