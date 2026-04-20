import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
      <h1 className="text-[120px] font-black leading-none text-foreground/30 select-none">
        404
      </h1>
      <p className="text-sm font-bold uppercase tracking-widest text-foreground/50">
        Oops! Page not found
      </p>
      <Link
        href="/dashboard"
        className="mt-4 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Go back home
      </Link>
    </div>
  );
}
