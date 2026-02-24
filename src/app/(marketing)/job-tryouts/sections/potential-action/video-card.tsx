/* Video Card */
export default function VideoCard({
  title,
  video,
}: {
  title: string;
  video: string;
}) {
  return (
    <div className="relative group overflow-hidden rounded-2xl aspect-[16/10] bg-black">
      <video
        src={video}
        className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      <div className="absolute bottom-4 right-4 z-10">
        <span className="rounded-full bg-[#eff1ff4d]  border border-[#eff1ff42] backdrop-blur px-6 py-2 text-[18px] font-semibold text-white shadow">
          {title}
        </span>
      </div>
    </div>
  );
}
