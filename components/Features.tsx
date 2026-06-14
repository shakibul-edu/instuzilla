'use client';

import { BookOpen, Users, BarChart3, Clock, ShieldCheck, Zap } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Student Management',
      description: 'Comprehensive enrollment, admission tracking, and student record management system.',
    },
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description: 'Real-time attendance monitoring with automated notifications and reporting.',
    },
    {
      icon: BarChart3,
      title: 'Grade Management',
      description: 'Streamlined grading system with automatic calculations and report generation.',
    },
    {
      icon: Users,
      title: 'Staff Management',
      description: 'Employee profiles, schedules, and performance tracking in one place.',
    },
    {
      icon: ShieldCheck,
      title: 'Security & Compliance',
      description: 'Bank-level encryption and GDPR compliance for student data protection.',
    },
    {
      icon: Zap,
      title: 'Real-time Notifications',
      description: 'Instant alerts for parents, teachers, and administrators about important updates.',
    },
  ];

  return (
    <section id="features" className="relative py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Powerful Features for Modern Schools
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Everything you need to manage your school efficiently and effectively.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-slate-200 bg-white p-8 transition-all hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-700"
              >
                <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 text-blue-600 transition-transform group-hover:scale-110 dark:bg-blue-900 dark:text-blue-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-xl border border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 p-8 text-center dark:border-slate-800 dark:from-blue-950 dark:to-purple-950">
          <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
            Ready to transform your school?
          </h3>
          <p className="mb-6 text-slate-600 dark:text-slate-300">
            Join hundreds of schools already using InstuZilla to streamline their operations.
          </p>
          <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-white transition-all hover:from-blue-700 hover:to-purple-700">
            Start Free Trial
            <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Features;
