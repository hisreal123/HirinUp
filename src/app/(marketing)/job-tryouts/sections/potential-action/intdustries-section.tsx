import VideoCard from './video-card';

/* INDUSTRIES VIDEO GRID */
export default function IndustriesSection() {
  const items = [
    {
      title: 'Hospitality',
      video: '/video/video-1.mp4',
    },
    {
      title: 'Sales',
      video: '/video/video-2.mp4',
    },
    {
      title: 'Food & Beverage',
      video: '/video/video-3.mp4',
    },
    {
      title: 'Aviation',
      video: '/video/video-4.mp4',
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-10 mb-14">
        <div>
          <span className="inline-block rounded-full  bg-[#171064] border border-[#C3C3C363] px-4 py-2 text-xs md:text-sm mb-2">
            Industries
          </span>
          <h2 className="text-[31px] leading-[40px] md:text-[44px] md:leading-[53px] text-black font-normal  ">
            Built for Every Industry, <br /> Designed for Every Role
          </h2>
        </div>
        <p className="max-w-lg text-gray-500 text-[16px] leading-[27px] flex justify-center">
          From tech startups to global enterprises, Talvin adapts to your hiring
          needs across industries. Whether you're recruiting sales reps,
          healthcare professionals, or retail staff—our AI is trained to assess,
          analyze, and select the best-fit talent for any role.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, i) => (
          <VideoCard key={i} {...item} />
        ))}
      </div>
    </>
  );
}
