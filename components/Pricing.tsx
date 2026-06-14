'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '29',
      description: 'Perfect for small schools and institutes',
      features: [
        'Up to 500 students',
        'Basic attendance tracking',
        'Grade management',
        'Email support',
        'Basic reporting',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Professional',
      price: '79',
      description: 'For growing schools and educational centers',
      features: [
        'Up to 5,000 students',
        'Advanced attendance tracking',
        'Comprehensive grade management',
        'Staff management',
        'Priority email support',
        'Advanced analytics',
        'Custom reports',
        'API access',
      ],
      cta: 'Get Started',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large institutions with custom needs',
      features: [
        'Unlimited students',
        'All Professional features',
        'Dedicated account manager',
        '24/7 priority support',
        'Custom integrations',
        'White-label options',
        'On-premise deployment',
        'SLA guarantee',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Choose the perfect plan for your school. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border transition-all ${
                plan.popular
                  ? 'border-blue-600 bg-gradient-to-b from-blue-50 to-white shadow-xl dark:border-blue-500 dark:from-blue-950 dark:to-slate-950'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
              } p-8`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <span className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1 text-sm font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Info */}
              <div className="mb-8">
                <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="mb-6 text-slate-600 dark:text-slate-400">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  {plan.price === 'Custom' ? (
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      {plan.price}
                    </span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">/month</span>
                    </>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <Link href="/authentication/signup" className="mb-8 block">
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>

              {/* Features List */}
              <div className="space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <Check className="mt-1 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Link */}
        <div className="mt-16 text-center">
          <p className="mb-4 text-slate-600 dark:text-slate-300">
            Have questions? Check our{' '}
            <Link href="#" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
              frequently asked questions
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
