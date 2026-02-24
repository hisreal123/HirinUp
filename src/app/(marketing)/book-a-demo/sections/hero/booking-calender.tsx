'use client';

import Cal, { getCalApi } from '@calcom/embed-react';
import { useEffect, useState } from 'react';

export default function BookingCalendar() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: 'bookdemo' });
      cal('ui', { hideEventTypeDetails: false, layout: 'month_view' });

      // Calendar is ready
      setLoading(false);
    })();
  }, []);

  return (
    <div className="w-full h-[700px] relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          {/* Simple Tailwind spinner */}
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Calendar */}
      <Cal
        namespace="bookdemo"
        calLink="shadip-banik-da6bp8/bookdemo"
        style={{ width: '100%', height: '100%', overflow: 'scroll' }}
        config={{ layout: 'month_view' }}
      />
    </div>
  );
}
