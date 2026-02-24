'use client';

import { useEffect, useRef, useState } from 'react';
import SliderReviw from './swiper';

export default function SallySection() {
  const [active, setActive] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(Date.now());
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) {return;}

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setPlaying(!playing);
  };

  return (
    <section className="w-full bg-[#F8F8F8] pt-20 pb-10">
      <div className="mx-auto max-w-6xl px-4">
        {/* Top Badge */}
        <div className="mb-4 flex justify-center">
          <span className="rounded-full  bg-[#171064] text-white  px-4 py-2 text-sm font-mediumpx-4 ">
            Meet Sally
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-center text-[31px] leading-[40px] md:text-[44px] md:leading-[53px] font-normal text-[#141414]">
          Sally: Your AI-Powered Hiring Assistant
        </h1>
        <p className="mx-auto mt-4 max-w-4xl text-center text-[16px] leading-[30px] font-normal text-[#141414BF]">
          Sally streamlines recruitment by conducting AI-driven voice
          interviews, analyzing candidate insights, and automating reference
          checks—helping you hire faster, smarter, and more efficiently without
          the manual effort.
        </p>

        {/* Video Container */}
        <div className="relative mx-auto mt-12 w-[380px] h-[560px] md:w-[1140px] overflow-hidden rounded-2xl bg-black">
          <iframe
            key={key}
            src="https://player.vimeo.com/video/1073175005?h=HASH&autoplay=1&loop=1&muted=1&background=1"
            allow="autoplay; fullscreen; picture-in-picture"
            title="sally-2-video"
            className="
            absolute
            left-1/2
            top-0
            -translate-x-1/2
            h-[644px]
            w-[1130px]
            md:h-[544px]
            md:w-[1140px]
            min-w-full
            min-h-full
            md:scale-[1.15]
            translate-y-[-5px]
           "
          />

          {/* Soft Overlay */}

          {/* Audio Element */}
          <audio
            ref={audioRef}
            src="https://talvin.ai/wp-content/uploads/2025/04/Retel-lisa.wav"
            preload="auto"
          />

          {/* Play / Pause Button */}
          <button
            className="absolute bottom-6 left-6 z-10 transition hover:scale-105"
            onClick={toggleAudio}
          >
            <img
              src={playing ? '/pause.svg' : '/play.svg'}
              alt={playing ? 'Pause Audio' : 'Play Audio'}
              className="h-20 w-20"
            />
          </button>

          {/* CTA Button */}
          <button className="absolute right-6 bottom-6 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow">
            Talk to Sally
          </button>
        </div>
        {/* Process Section */}
        <div className="mt-24 grid gap-12 md:grid-cols-2">
          <div>
            <span className="mb-3 inline-block rounded-full bg-[#171064] text-white  px-4 py-2 text-sm font-medium">
              Process
            </span>
            <h2 className="text-5xl font-normal text-gray-900">
              Effortless Hiring, Powered by AI
            </h2>
          </div>
          <p className="text-[#14141499] text-base leading-[27px] pt-5 font-light">
            Talvin automates your recruitment process from start to finish.
            Customize hiring requirements, conduct AI-driven voice interviews,
            gain actionable insights, and automate reference checks—making
            hiring faster, smarter, and more efficient than ever.
          </p>
        </div>

        {/* Slider Timeline */}
      </div>
      <SliderReviw />
    </section>
  );
}
