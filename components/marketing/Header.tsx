import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <span>🐾</span>
            <span>Pet Reunite</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#features" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="/blog" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Stories
            </Link>
            <Link href="/about" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              About
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Log in
            </Link>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
