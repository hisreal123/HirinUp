import Link from 'next/link';

export default function TopAnnouncement() {
  return (
    <div className="w-full bg-[#6d1dfc] text-white text-sm py-2 text-center">
      We Just Won A Global Voice AI Hackathon 🎉{' '}
      <Link
        href="https://vapi.ai/blog/meet-the-winners-of-the-vapi-build-challenge-2025"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span className="underline cursor-pointer">Read More →</span>
      </Link>
    </div>
  );
}
