'use client';
import { Check } from 'lucide-react';
import { useState } from 'react';

export default function DemoForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<null | {
    type: 'success' | 'error';
    text: string;
  }>(null);

  const validateForm = () => {
    if (!name.trim()) {return 'Name is required';}
    if (!email.trim()) {return 'Email is required';}
    if (!/\S+@\S+\.\S+/.test(email)) {return 'Invalid email address';}
    
return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const error = validateForm();
    if (error) {
      setMessage({ type: 'error', text: error });
      
return;
    }

    setLoading(true);

    // Fake API delay
    setTimeout(() => {
      setLoading(false);

      // Simulate success
      setMessage({ type: 'success', text: 'Demo video sent successfully!' });

      // Reset form (optional)
      setName('');
      setEmail('');
    }, 1000);
  };

  return (
    <form
      className="mt-6 space-y-4 max-w-xl mx-4 md:mx-10 text-black"
      onSubmit={handleSubmit}
    >
      <input
        type="text"
        placeholder="Enter your full name"
        value={name}
        className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Enter your email address"
        value={email}
        className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-xl py-2 font-normal transition flex items-center justify-center gap-2
          ${loading ? 'bg-[rgb(47,47,47,47)] cursor-not-allowed text-white' : 'bg-black hover:bg-[#ffffff] hover:text-black hover:border hover:border-black text-white'}`}
      >
        {loading && (
          <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        Send me the Video
      </button>

      {/* Notification */}
      {message && (
        <p
          className={`text-sm flex mt-2 text-black text-normal items-center  `}
        >
          <Check
            className={` mr-2 w-4 h-4 ${
              message.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          />{' '}
          {message.text}
        </p>
      )}
    </form>
  );
}
