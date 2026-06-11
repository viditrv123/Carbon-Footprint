import Link from 'next/link';
import { Leaf, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: '📊',
    title: 'Smart Activity Tracking',
    description: 'Log transportation, energy, food, shopping, and waste — all in one place with real emission factors.',
  },
  {
    icon: '🌍',
    title: 'Real-time Calculations',
    description: 'Every activity is instantly converted to kg CO₂e using science-backed emission factors.',
  },
  {
    icon: '💡',
    title: 'Personalized Insights',
    description: 'Get tailored recommendations to reduce your footprint based on your unique activity patterns.',
  },
  {
    icon: '📈',
    title: 'Progress Analytics',
    description: 'Visual dashboards show trends over time so you can see the impact of your choices.',
  },
  {
    icon: '🎯',
    title: 'Monthly Goals',
    description: 'Set personal carbon targets and track how close you are to living sustainably.',
  },
  {
    icon: '🔥',
    title: 'Streak Rewards',
    description: 'Build healthy habits with daily tracking streaks and achievement milestones.',
  },
];

const stats = [
  { value: '54t', label: 'Average annual CO₂ per person', sub: 'worldwide' },
  { value: '75%', label: 'Can be reduced', sub: 'with conscious choices' },
  { value: '1.5°C', label: 'Paris Agreement target', sub: 'we can get there' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-forest-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-forest-600 to-forest-500 text-white">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="font-bold text-forest-800 text-lg">EcoTrack</span>
            </div>
            <nav className="hidden md:flex items-center gap-8" aria-label="Header navigation">
              <a href="#features" className="text-sm text-forest-700 hover:text-forest-900 transition-colors">Features</a>
              <a href="#impact" className="text-sm text-forest-700 hover:text-forest-900 transition-colors">Impact</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button variant="gradient" size="sm">Get started free</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-forest-50 to-white pt-20 pb-32">
        {/* Decorative circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-forest-100/60 to-transparent -translate-y-1/2 pointer-events-none" aria-hidden />
        <div className="absolute top-20 right-10 text-8xl opacity-10 animate-float pointer-events-none" aria-hidden>🌿</div>
        <div className="absolute bottom-20 left-10 text-6xl opacity-10 animate-float pointer-events-none" style={{animationDelay: '2s'}} aria-hidden>🍃</div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-100 px-4 py-1.5 text-sm font-medium text-forest-700 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-forest-400 opacity-75" aria-hidden />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-forest-500" aria-hidden />
            </span>
            Climate action starts with awareness
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-forest-900 tracking-tight mb-6">
            Know your{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-forest-600 to-forest-500">
                carbon footprint
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" aria-hidden>
                <path d="M2 10 Q 150 2 298 10" stroke="#52B788" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Track daily activities, understand your environmental impact, and get personalized tips
            to live more sustainably — one small change at a time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button variant="gradient" size="xl" className="shadow-eco-lg group">
                Start tracking for free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="xl">
                Sign in to your account
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-gray-400">No credit card required · Free forever</p>
        </div>

        {/* Dashboard preview card */}
        <div className="relative mx-auto mt-16 max-w-3xl px-4">
          <div className="rounded-2xl bg-white border border-forest-100 shadow-eco-lg p-6 overflow-hidden">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-forest-50">
              <div className="h-3 w-3 rounded-full bg-red-400" aria-hidden />
              <div className="h-3 w-3 rounded-full bg-amber-400" aria-hidden />
              <div className="h-3 w-3 rounded-full bg-green-400" aria-hidden />
              <span className="ml-2 text-xs text-gray-400 font-mono">ecotrack.app/dashboard</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'This Month', value: '245.3 kg', icon: '📊', trend: '-12%', good: true },
                { label: 'Daily Average', value: '8.2 kg', icon: '📅', trend: '-8%', good: true },
                { label: 'Streak', value: '7 days 🔥', icon: '✨', sub: 'Keep it up!' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl bg-forest-50 p-4">
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-lg font-bold text-forest-800">{item.value}</p>
                  {item.trend && (
                    <p className={`text-xs font-medium mt-1 ${item.good ? 'text-green-600' : 'text-red-500'}`}>
                      {item.trend} vs last month
                    </p>
                  )}
                  {item.sub && <p className="text-xs text-forest-600 mt-1">{item.sub}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="impact" className="py-16 bg-forest-700">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center text-white">
            {stats.map((stat) => (
              <div key={stat.value}>
                <p className="text-5xl font-extrabold text-forest-200 mb-2">{stat.value}</p>
                <p className="font-semibold text-white">{stat.label}</p>
                <p className="text-sm text-forest-300 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-forest-900 mb-4">
              Everything you need to go green
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Simple, powerful tools for understanding and reducing your environmental impact.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="group rounded-2xl border border-forest-100 bg-white p-6 hover:border-forest-300 hover:shadow-eco transition-all duration-200">
                <div className="text-3xl mb-4" aria-hidden>{feature.icon}</div>
                <h3 className="text-lg font-semibold text-forest-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-forest-700 to-forest-800">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-6" aria-hidden>🌱</div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to make a difference?
          </h2>
          <p className="text-forest-200 text-xl mb-10">
            Join thousands tracking their footprint and making conscious choices for our planet.
          </p>
          <Link href="/register">
            <Button size="xl" className="bg-white text-forest-800 hover:bg-forest-50 shadow-eco-lg">
              Start your journey today
              <ChevronRight className="h-5 w-5" aria-hidden />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-900 text-forest-300 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Leaf className="h-4 w-4 text-forest-400" aria-hidden />
            <span className="font-semibold text-white">EcoTrack</span>
          </div>
          <p className="text-sm text-forest-400">
            Built with 💚 for the planet · Emission factors from IPCC &amp; Our World in Data
          </p>
        </div>
      </footer>
    </div>
  );
}
