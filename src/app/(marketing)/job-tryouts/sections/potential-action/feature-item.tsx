/* Feature Card Component */
export default function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-left">
      {/* Icon Card */}
      <img
        decoding="async"
        width="800"
        height="506"
        src={icon}
        className="mb-7"
        alt=""
        sizes="(max-width: 800px) 100vw, 800px"
      />

      {/* Text Outside Card */}
      <h3 className="font-semibold text-black text-xl mb-2">{title}</h3>
      <p className="text-base text-[#141414] font-light leading-[18px]">
        {desc}
      </p>
    </div>
  );
}
