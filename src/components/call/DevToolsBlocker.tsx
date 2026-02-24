'use client';

export function DevToolsBlocker() {
  return (
    <div
      style={{ zIndex: 99999 }}
      className="fixed inset-0 bg-white flex flex-col items-center justify-center"
    >
      <div className="flex flex-col items-center justify-center max-w-md text-center px-8">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Developer Tools Detected
        </h1>

        <p className="text-gray-600 mb-4 leading-relaxed">
          Opening developer tools during an interview is a violation of our{' '}
          <span className="font-semibold text-gray-800">Terms of Service</span>{' '}
          and interview integrity policy.
        </p>

        <p className="text-gray-500 text-sm">
          Please close your developer tools to continue the interview.
        </p>

        <div className="mt-8 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 w-full">
          <p className="text-xs text-gray-400 text-center">
            This interview is monitored for integrity compliance.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DevToolsBlocker;
