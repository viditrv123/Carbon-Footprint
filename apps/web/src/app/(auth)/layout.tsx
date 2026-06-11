import { Leaf } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-50 via-white to-forest-50 flex flex-col">
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit" aria-label="EcoTrack home">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-forest-600 to-forest-500 text-white">
            <Leaf className="h-4 w-4" aria-hidden />
          </div>
          <span className="font-bold text-forest-800">EcoTrack</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="p-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} EcoTrack. Made with 💚
      </footer>
    </div>
  );
}
