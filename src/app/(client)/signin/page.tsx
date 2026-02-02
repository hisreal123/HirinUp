'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // POC: Show "not registered" toast for all sign in attempts
    toast.error('You are not registered', {
      description: 'Please sign up to create an account.',
    });
  };

  return (
    <div className="flex h-screen w-full absolute top-0 left-0 z-50">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 animate-in fade-in slide-in-from-left-4 duration-500">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="mt-2 text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="rounded border-gray-300" />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative animate-in fade-in slide-in-from-right-4 duration-500">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/auth/sigin-image.jpg')" }}
        />
        <div className="absolute inset-0 bg-indigo-600/70" />
        <div className="relative flex flex-col justify-end h-full text-white p-12">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Hirin<span className="text-indigo-200">Up</span>
            </h2>
            <p className="text-sm text-white w-full">
              Streamline your hiring process with AI-powered interviews. Find
              the best talent faster, reduce bias, and make data-driven hiring
              decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;
