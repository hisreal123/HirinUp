'use client';

import { useEffect, useState } from 'react';
import Slider from './slider';

export default function TimerSection() {
  const [recruiters, setRecruiters] = useState(10);
  const [interviews, setInterviews] = useState(5);
  const [screening, setScreening] = useState(25);
  const [prep, setPrep] = useState(10);

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const totalMinutes = recruiters * interviews * (screening + prep) * 30;

    setHours(Math.floor(totalMinutes / 60));
    setMinutes(totalMinutes % 60);
  }, [recruiters, interviews, screening, prep]);

  return (
    <section className=" bg-gradient-to-br p-20  bg-calculator flex items-center justify-center px-6 text-white">
      <div className="max-w-4xl w-full space-y-6">
        {/* Total Time Card */}
        <div className="bg-gray-500/60 max-w-lg mx-auto shadow-md rounded-xl p-8 text-center backdrop-blur">
          <p className="text-xl text-white mb-2">Total Time Saving per Month</p>
          <h1 className="text-6xl font-bold mt-5">
            {hours}h {minutes}m
          </h1>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Slider
            label="Number of recruiters on your team"
            value={recruiters}
            min={1}
            max={50}
            onChange={setRecruiters}
          />

          <Slider
            label="Daily screening interviews per recruiter"
            value={interviews}
            min={1}
            max={20}
            onChange={setInterviews}
          />

          <Slider
            label="Screening interview duration (minutes)"
            value={screening}
            min={5}
            max={60}
            onChange={setScreening}
          />

          <Slider
            label="Preparation time per interview (minutes)"
            value={prep}
            min={5}
            max={30}
            onChange={setPrep}
          />
        </div>
      </div>
    </section>
  );
}
