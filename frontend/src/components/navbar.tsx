import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Image src="/logo.svg" alt="Caaampaign Logo" width={32} height={32} />
          Caaampaign
        </Link>
        <Link
          href="/admin"
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          Admin
        </Link>
      </div>
    </header>
  );
}
