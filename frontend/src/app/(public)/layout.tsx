import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-col flex-1">{children}</div>
      <Footer />
    </div>
  );
}
