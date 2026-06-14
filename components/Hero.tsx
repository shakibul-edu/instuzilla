'use client';

import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-20 sm:pt-32 lg:pt-40">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950" />
        <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-l from-blue-400 to-transparent opacity-20 blur-3xl dark:from-blue-600 dark:opacity-10" />
        <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-gradient-to-r from-purple-400 to-transparent opacity-20 blur-3xl dark:from-purple-600 dark:opacity-10" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 dark:border-blue-900 dark:bg-blue-950">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
              Launch Your School into the Future
            </span>
          </div>

          {/* Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            <span className="block">Streamline Your</span>
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              School Management
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600 dark:text-slate-300 sm:text-xl">
            All-in-one platform for student enrollment, attendance tracking, grade management, and communication. Trusted by 500+ schools worldwide.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <Link href="/authentication/signup">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-white hover:from-blue-700 hover:to-purple-700 sm:w-auto"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full border-slate-300 px-8 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900 sm:w-auto"
            >
              <Play className="mr-2 h-4 w-4" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Badge */}
          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Trusted by leading educational institutions
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {['Acme School', 'NextGen Edu', 'Smart Learning', 'Edu Plus'].map((school) => (
                <div
                  key={school}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                >
                  {school}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
