'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tabs from '@radix-ui/react-tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Leaf, Globe, BarChart3, ChevronDown, ChevronRight,
  Zap, Car, ShoppingBag, Utensils, Trash2, Home, Info,
} from 'lucide-react';

// ─── Data ──────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'transportation',
    icon: Car,
    emoji: '🚗',
    label: 'Transportation',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    dot: 'bg-emerald-500',
    intro:
      'Transportation is the largest source of carbon emissions for most people in developed countries, accounting for roughly 30% of personal footprints.',
    keyFact:
      'Switching from a petrol car to an electric vehicle (charged on renewable energy) can save over 1.5 tonnes CO₂e per year.',
    factors: [
      { name: 'Petrol car', value: 0.21, unit: 'kg per km', note: 'Average mid-size' },
      { name: 'Diesel car', value: 0.17, unit: 'kg per km', note: 'Slightly lower CO₂ but more NOx' },
      { name: 'Electric car', value: 0.053, unit: 'kg per km', note: 'UK grid average 2024' },
      { name: 'Motorcycle', value: 0.114, unit: 'kg per km', note: '' },
      { name: 'Bus', value: 0.089, unit: 'kg per km', note: 'Average occupancy' },
      { name: 'Train', value: 0.041, unit: 'kg per km', note: 'National Rail average' },
      { name: 'Short-haul flight', value: 0.255, unit: 'kg per km', note: 'Economy, per passenger' },
      { name: 'Long-haul flight', value: 0.195, unit: 'kg per km', note: 'Economy, per passenger' },
      { name: 'Cycling', value: 0, unit: 'kg per km', note: 'Zero direct emissions' },
    ],
    tips: [
      'Work from home even one day a week to cut commute emissions by 20%.',
      'For journeys under 5 km, cycling or walking emits zero CO₂.',
      'Taking the train instead of flying short-haul cuts emissions by up to 84%.',
      'If you need a car, an EV on a green tariff produces ~75% less CO₂ than petrol.',
    ],
  },
  {
    id: 'home-energy',
    icon: Home,
    emoji: '🏠',
    label: 'Home Energy',
    color: 'bg-amber-50 border-amber-200 text-amber-800',
    dot: 'bg-amber-500',
    intro:
      'Heating, cooling, and powering your home typically accounts for 15–25% of a household\'s carbon footprint. The source of your energy matters enormously.',
    keyFact:
      'Switching to a 100% renewable electricity tariff can eliminate your home electricity emissions overnight.',
    factors: [
      { name: 'Electricity (UK avg)', value: 0.233, unit: 'kg per kWh', note: 'Grid mix 2024' },
      { name: 'Natural gas', value: 2.04, unit: 'kg per m³', note: 'Combustion only' },
      { name: 'Heating oil', value: 2.68, unit: 'kg per litre', note: '' },
      { name: 'Wood (sustainable)', value: 0.016, unit: 'kg per kg', note: 'Carbon-neutral cycle' },
      { name: 'Solar (generation)', value: 0, unit: 'kg per kWh', note: 'No operational emissions' },
    ],
    tips: [
      'A smart thermostat can reduce heating bills and emissions by up to 12%.',
      'Insulating your loft costs ~£300 and saves ~£150/year — and around 400 kg CO₂e.',
      'LED bulbs use 75% less energy than incandescent and last 25× longer.',
      'Heat pumps are 3–4× more efficient than gas boilers for space heating.',
    ],
  },
  {
    id: 'food',
    icon: Utensils,
    emoji: '🥗',
    label: 'Food',
    color: 'bg-green-50 border-green-200 text-green-800',
    dot: 'bg-green-500',
    intro:
      'Food production generates about 26% of global greenhouse gas emissions. Animal products — especially ruminant meat — have dramatically higher footprints than plant foods.',
    keyFact:
      'Producing 1 kg of beef emits ~27 kg CO₂e — 13× more than the same weight of chicken, and 135× more than vegetables.',
    factors: [
      { name: 'Beef', value: 27.0, unit: 'kg per kg', note: 'Highest of all foods' },
      { name: 'Lamb', value: 39.2, unit: 'kg per kg', note: 'Even higher than beef' },
      { name: 'Pork', value: 12.1, unit: 'kg per kg', note: '' },
      { name: 'Chicken', value: 6.9, unit: 'kg per kg', note: '' },
      { name: 'Fish (farmed)', value: 6.1, unit: 'kg per kg', note: 'Varies by species' },
      { name: 'Dairy', value: 3.2, unit: 'kg per kg', note: '' },
      { name: 'Eggs', value: 4.8, unit: 'kg per kg', note: '' },
      { name: 'Vegetables', value: 2.0, unit: 'kg per kg', note: 'Average' },
      { name: 'Fruits', value: 1.1, unit: 'kg per kg', note: '' },
      { name: 'Grains', value: 1.4, unit: 'kg per kg', note: '' },
    ],
    tips: [
      'One meat-free day per week saves ~52 kg CO₂e per person per year.',
      'Buying seasonal, locally grown produce cuts transport emissions.',
      'Reducing food waste is critical — 30% of food produced globally is wasted.',
      'Plant-based alternatives to beef and dairy offer 80–90% lower footprints.',
    ],
  },
  {
    id: 'shopping',
    icon: ShoppingBag,
    emoji: '🛒',
    label: 'Shopping',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    dot: 'bg-blue-500',
    intro:
      'Manufacturing and transporting physical goods — clothing, electronics, furniture — embeds significant carbon. "Embodied carbon" is often invisible but substantial.',
    keyFact:
      'Manufacturing a single smartphone produces ~70 kg CO₂e. Keeping it one extra year cuts its annual footprint by 50%.',
    factors: [
      { name: 'Electronics', value: 0.03, unit: 'kg per USD spent', note: 'Manufacturing-heavy' },
      { name: 'Appliances', value: 0.025, unit: 'kg per USD spent', note: '' },
      { name: 'Furniture', value: 0.012, unit: 'kg per USD spent', note: '' },
      { name: 'Clothing', value: 0.009, unit: 'kg per USD spent', note: 'Fast fashion is higher' },
      { name: 'General goods', value: 0.007, unit: 'kg per USD spent', note: '' },
    ],
    tips: [
      'Buying second-hand clothing reduces textile emissions by up to 90%.',
      'Repair electronics and appliances instead of replacing them.',
      'Choose products with longer lifespans and repairability ratings.',
      'Avoid fast fashion — the sector produces 10% of global CO₂ annually.',
    ],
  },
  {
    id: 'waste',
    icon: Trash2,
    emoji: '♻️',
    label: 'Waste',
    color: 'bg-teal-50 border-teal-200 text-teal-800',
    dot: 'bg-teal-500',
    intro:
      'Waste that ends up in landfill produces methane as it decomposes — a greenhouse gas 28× more potent than CO₂. Recycling and composting actively save carbon.',
    keyFact:
      'Composting 10 kg of food waste instead of landfilling it saves 0.8 kg CO₂e — and creates rich soil.',
    factors: [
      { name: 'Landfill waste', value: 0.58, unit: 'kg per kg', note: 'Methane emissions' },
      { name: 'Recycling', value: -0.12, unit: 'kg per kg', note: 'Carbon saved vs. virgin materials' },
      { name: 'Composting', value: -0.08, unit: 'kg per kg', note: 'Carbon saved vs. landfill' },
    ],
    tips: [
      'Recycling aluminium uses 95% less energy than producing it from ore.',
      'Composting keeps organic waste out of landfill and enriches soil.',
      'Zero-waste shopping with reusable containers eliminates packaging.',
      'Repair cafés and tool libraries reduce the need for new purchases.',
    ],
  },
];

const COUNTRY_DATA = [
  { country: '🇺🇸 United States', monthly: 5000, annual: 60000, context: 'High car dependency, cheap energy' },
  { country: '🇦🇺 Australia', monthly: 4167, annual: 50000, context: 'Coal-heavy grid, long distances' },
  { country: '🇨🇦 Canada', monthly: 4583, annual: 55000, context: 'Cold climate, long commutes' },
  { country: '🇩🇪 Germany', monthly: 3500, annual: 42000, context: 'Industrial base, transitioning to renewables' },
  { country: '🇬🇧 United Kingdom', monthly: 2917, annual: 35000, context: 'Clean grid, good public transport' },
  { country: '🌍 Global average', monthly: 4500, annual: 54000, context: '' },
  { country: '🇫🇷 France', monthly: 2500, annual: 30000, context: 'Nuclear-powered grid, low emissions' },
  { country: '🇨🇳 China', monthly: 1750, annual: 21000, context: 'Rapidly growing renewables' },
  { country: '🇮🇳 India', monthly: 583, annual: 7000, context: 'Lower consumption, growing middle class' },
];

const FAQ = [
  {
    q: 'What does "kg CO₂e" mean?',
    a: 'CO₂e stands for "carbon dioxide equivalent". Since different greenhouse gases (methane, nitrous oxide, etc.) trap different amounts of heat, we convert them all to a single unit based on their warming potential relative to CO₂ over 100 years. This lets us compare activities fairly.',
  },
  {
    q: 'Why are my flight emissions shown per km?',
    a: 'Flights are logged as the distance flown. Short-haul flights have higher per-km emissions than long-haul because takeoff and landing — the most fuel-intensive parts — make up a larger fraction of the total journey. We use ICAO methodology.',
  },
  {
    q: 'Does recycling actually reduce emissions?',
    a: 'Yes — the emission factor for recycling is negative (−0.12 kg CO₂e per kg) because it saves energy and raw materials that would otherwise be needed to produce virgin materials. Recycling aluminium saves 95% of the energy required to smelt new aluminium.',
  },
  {
    q: 'How is the electricity emission factor calculated?',
    a: 'It depends on how your electricity is generated. We use the UK average grid intensity of 0.233 kg CO₂e/kWh (2024). Countries with more renewables or nuclear have lower factors (France: ~0.056). You can set your country in Profile to get a more accurate figure.',
  },
  {
    q: 'What\'s a "good" monthly footprint?',
    a: 'The global average is around 4,500 kg CO₂e/month. To align with the 1.5°C Paris Agreement target, individuals in high-income countries need to reach roughly 600 kg/month (7.2 tonnes/year) by 2050. Small, consistent reductions add up significantly.',
  },
  {
    q: 'Why is beef so much worse than chicken?',
    a: 'Cattle produce methane during digestion (enteric fermentation) — a potent greenhouse gas. They also require more land, water, and feed per kg of protein than poultry or plants. Lamb is even higher than beef for the same reason.',
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-1 text-xs font-semibold text-forest-700">
      {children}
    </span>
  );
}

function Callout({ icon, children, variant = 'info' }: {
  icon: string; children: React.ReactNode; variant?: 'info' | 'tip' | 'fact';
}) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    tip: 'bg-forest-50 border-forest-200 text-forest-800',
    fact: 'bg-amber-50 border-amber-200 text-amber-800',
  };
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles[variant]}`} role="note">
      <span className="flex-shrink-0 text-lg" aria-hidden>{icon}</span>
      <p className="leading-relaxed">{children}</p>
    </div>
  );
}

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-forest-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-forest-900 hover:bg-forest-50 transition-colors"
        aria-expanded={open}
      >
        <span>{question}</span>
        <ChevronDown
          className={`h-4 w-4 text-forest-500 transition-transform duration-200 flex-shrink-0 ml-3 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-forest-100 px-5 py-4 text-sm text-gray-600 leading-relaxed bg-forest-50/50">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmissionFactorRow({ name, value, unit, note }: {
  name: string; value: number; unit: string; note?: string;
}) {
  const intensity = Math.min(value / 40, 1); // normalise 0–40 kg range
  const barColor = value < 0 ? 'bg-green-400' : value < 5 ? 'bg-forest-400' : value < 15 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <tr className="border-b border-forest-50 hover:bg-forest-50/50 transition-colors">
      <td className="py-2.5 pr-4 text-sm font-medium text-forest-900 w-40">{name}</td>
      <td className="py-2.5 pr-4 w-48">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor} transition-all`}
              style={{ width: `${Math.max(Math.abs(intensity) * 100, value < 0 ? 8 : 2)}%` }}
              aria-hidden
            />
          </div>
        </div>
      </td>
      <td className="py-2.5 pr-4 text-sm font-mono font-semibold text-forest-800 tabular-nums w-20">
        <span className={value < 0 ? 'text-green-600' : ''}>{value < 0 ? '' : ''}{value}</span>
      </td>
      <td className="py-2.5 pr-4 text-xs text-gray-400">{unit}</td>
      {note !== undefined && <td className="py-2.5 text-xs text-gray-400 italic">{note}</td>}
    </tr>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'categories', label: 'Categories', icon: BarChart3 },
  { id: 'factors', label: 'Emission Factors', icon: Zap },
  { id: 'global', label: 'Global Context', icon: Globe },
  { id: 'faq', label: 'FAQ', icon: Info },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LearnPage() {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const activeData = CATEGORIES.find(c => c.id === activeCategory)!;
  const ActiveIcon = activeData.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-100">
            <BookOpen className="h-5 w-5 text-forest-700" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold text-forest-900">Learn</h1>
        </div>
        <p className="text-gray-500 ml-12">
          Understand your carbon footprint and how every choice makes a difference.
        </p>
      </motion.div>

      <Tabs.Root defaultValue="overview">
        {/* Tab list */}
        <Tabs.List
          className="flex gap-1 rounded-2xl bg-forest-50 p-1.5 flex-wrap"
          aria-label="Documentation sections"
        >
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <Tabs.Trigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium text-forest-600 transition-all
                  data-[state=active]:bg-white data-[state=active]:text-forest-900 data-[state=active]:shadow-eco
                  hover:text-forest-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500"
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>

        {/* ── Overview ─────────────────────────────────────────────── */}
        <Tabs.Content value="overview" className="mt-6 focus:outline-none">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <Card>
              <div className="flex items-start gap-4">
                <span className="text-4xl" aria-hidden>🌍</span>
                <div>
                  <h2 className="text-xl font-bold text-forest-900 mb-2">What is a carbon footprint?</h2>
                  <p className="text-gray-600 leading-relaxed">
                    A carbon footprint is the total amount of greenhouse gases — primarily carbon dioxide (CO₂) and methane (CH₄) — emitted directly or indirectly by a person, organisation, or activity. It&apos;s measured in <strong>kg or tonnes of CO₂e</strong> (carbon dioxide equivalent), which converts all greenhouse gases into a single comparable unit based on their warming potential.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: '🌡️', label: '1.5°C Target', value: 'Paris Agreement goal to limit warming' },
                { icon: '👤', label: '54 tonnes/year', value: 'Average person in a high-income country' },
                { icon: '🎯', label: '2.5 tonnes/year', value: 'Per-person budget to meet 1.5°C by 2050' },
              ].map(stat => (
                <Card key={stat.label} className="text-center py-5">
                  <p className="text-3xl mb-2" aria-hidden>{stat.icon}</p>
                  <p className="font-bold text-forest-800">{stat.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.value}</p>
                </Card>
              ))}
            </div>

            <Card>
              <h2 className="text-lg font-bold text-forest-900 mb-4">What is CO₂e?</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Different greenhouse gases trap different amounts of heat. Methane (CH₄) is 28× more potent than CO₂ over 100 years. Nitrous oxide (N₂O) is 265× more potent. <strong>CO₂ equivalent (CO₂e)</strong> converts all gases to a single number so we can compare them.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { gas: 'CO₂', gwp: '1×', source: 'Burning fossil fuels', color: 'bg-gray-100 text-gray-700' },
                  { gas: 'CH₄ (Methane)', gwp: '28×', source: 'Livestock, landfill, gas leaks', color: 'bg-amber-100 text-amber-800' },
                  { gas: 'N₂O (Nitrous oxide)', gwp: '265×', source: 'Agriculture, fertilisers', color: 'bg-red-100 text-red-800' },
                ].map(g => (
                  <div key={g.gas} className={`rounded-xl p-3 ${g.color}`}>
                    <p className="font-semibold text-sm">{g.gas}</p>
                    <p className="text-2xl font-bold my-1">{g.gwp}</p>
                    <p className="text-xs opacity-75">{g.source}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-bold text-forest-900 mb-4">How EcoTrack calculates your footprint</h2>
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Log an activity', desc: 'You enter what you did — e.g. drove 30 km in a petrol car.' },
                  { step: '2', title: 'Apply emission factor', desc: 'We multiply by a science-backed factor (petrol car = 0.21 kg CO₂e/km). Result: 30 × 0.21 = 6.3 kg CO₂e.' },
                  { step: '3', title: 'Aggregate & compare', desc: 'Your total is compared to global and country averages, tracked over time, and used to generate personalised insights.' },
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-forest-700 text-white text-xs font-bold" aria-hidden>
                      {s.step}
                    </div>
                    <div>
                      <p className="font-semibold text-forest-900 text-sm">{s.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Callout icon="💡" variant="tip">
              <strong>Tip:</strong> You don&apos;t need to be perfect. Cutting your footprint by 20% has more climate impact than waiting until you can cut it by 100%.
            </Callout>
          </motion.div>
        </Tabs.Content>

        {/* ── Categories ───────────────────────────────────────────── */}
        <Tabs.Content value="categories" className="mt-6 focus:outline-none">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
          >
            {/* Category picker */}
            <div
              className="flex gap-2 flex-wrap"
              role="group"
              aria-label="Select category"
            >
              {CATEGORIES.map(cat => {
                const active = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-500 ${
                      active ? cat.color + ' shadow-eco' : 'bg-white border-forest-100 text-forest-700 hover:border-forest-300'
                    }`}
                    aria-pressed={active}
                  >
                    <span aria-hidden>{cat.emoji}</span>
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Category header */}
                <Card>
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-xl border ${activeData.color}`}>
                      <ActiveIcon className="h-6 w-6" aria-hidden />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-forest-900">{activeData.label}</h2>
                      <p className="text-gray-600 leading-relaxed mt-1.5">{activeData.intro}</p>
                    </div>
                  </div>
                </Card>

                <Callout icon="⚡" variant="fact">
                  <strong>Key fact:</strong> {activeData.keyFact}
                </Callout>

                {/* Emission factors mini-table */}
                <Card>
                  <h3 className="text-base font-semibold text-forest-900 mb-4">Emission factors</h3>
                  <div className="overflow-x-auto -mx-2 px-2">
                    <table className="w-full min-w-[480px]" aria-label={`${activeData.label} emission factors`}>
                      <thead>
                        <tr className="border-b border-forest-100">
                          <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Activity</th>
                          <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Intensity</th>
                          <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Factor</th>
                          <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Unit</th>
                          <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeData.factors.map(f => (
                          <EmissionFactorRow key={f.name} {...f} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    Factors shown in kg CO₂e. Green bars = carbon negative (savings).
                  </p>
                </Card>

                {/* Tips */}
                <Card>
                  <h3 className="text-base font-semibold text-forest-900 mb-3">
                    How to reduce your {activeData.label.toLowerCase()} emissions
                  </h3>
                  <ul className="space-y-2.5" role="list">
                    {activeData.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded-full ${activeData.dot} flex items-center justify-center`} aria-hidden>
                          <ChevronRight className="h-3 w-3 text-white" />
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </Tabs.Content>

        {/* ── Emission Factors Reference ───────────────────────────── */}
        <Tabs.Content value="factors" className="mt-6 focus:outline-none">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <Card>
              <div className="flex items-start gap-3 mb-5">
                <Zap className="h-5 w-5 text-forest-600 flex-shrink-0 mt-0.5" aria-hidden />
                <div>
                  <h2 className="text-lg font-bold text-forest-900">Complete Emission Factors Reference</h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    All factors used by EcoTrack to calculate your carbon footprint, sourced from IPCC, UK DEFRA, and Our World in Data.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {CATEGORIES.map(cat => {
                  const CatIcon = cat.icon;
                  return (
                    <section key={cat.id} aria-labelledby={`factors-${cat.id}`}>
                      <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 mb-3 ${cat.color}`}>
                        <CatIcon className="h-4 w-4" aria-hidden />
                        <h3 id={`factors-${cat.id}`} className="font-semibold text-sm">{cat.emoji} {cat.label}</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[480px]" aria-label={`${cat.label} emission factors`}>
                          <thead>
                            <tr className="border-b border-forest-100">
                              <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Activity</th>
                              <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-40">Intensity</th>
                              <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide w-20">Factor</th>
                              <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Unit</th>
                              <th className="pb-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">Note</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cat.factors.map(f => (
                              <EmissionFactorRow key={f.name} {...f} />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  );
                })}
              </div>
            </Card>

            <Card>
              <h3 className="text-base font-semibold text-forest-900 mb-3">Data sources</h3>
              <ul className="space-y-2 text-sm text-gray-600" role="list">
                {[
                  { org: 'IPCC (AR6, 2021)', desc: 'Global warming potential values for greenhouse gases' },
                  { org: 'UK DEFRA (2024)', desc: 'Electricity grid intensity, transport, and waste emission factors' },
                  { org: 'Our World in Data', desc: 'Food system emissions, per-country footprint data' },
                  { org: 'ICAO Carbon Emissions Calculator', desc: 'Aviation emission factors' },
                  { org: 'IEA (2024)', desc: 'Country-level energy emission factors' },
                ].map(s => (
                  <li key={s.org} className="flex items-start gap-2">
                    <span className="text-forest-500 mt-0.5 flex-shrink-0" aria-hidden>•</span>
                    <span><strong className="text-forest-800">{s.org}</strong> — {s.desc}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </Tabs.Content>

        {/* ── Global Context ───────────────────────────────────────── */}
        <Tabs.Content value="global" className="mt-6 focus:outline-none">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <Card>
              <h2 className="text-lg font-bold text-forest-900 mb-4">Average carbon footprints by country</h2>
              <div className="space-y-2.5" role="list" aria-label="Country carbon footprint comparison">
                {COUNTRY_DATA.map((row) => {
                  const maxAnnual = Math.max(...COUNTRY_DATA.map(r => r.annual));
                  const pct = (row.annual / maxAnnual) * 100;
                  const isGlobal = row.country.includes('Global');
                  return (
                    <div
                      key={row.country}
                      role="listitem"
                      className={`rounded-xl p-3.5 ${isGlobal ? 'bg-forest-50 border border-forest-200' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-sm font-medium ${isGlobal ? 'text-forest-800' : 'text-gray-700'}`}>
                          {row.country}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-forest-800 tabular-nums">
                            {(row.annual / 1000).toFixed(1)}t
                          </span>
                          <span className="text-xs text-gray-400 ml-1">CO₂e/year</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200 overflow-hidden" aria-hidden>
                        <div
                          className={`h-full rounded-full ${isGlobal ? 'bg-forest-500' : 'bg-forest-300'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {row.context && (
                        <p className="text-xs text-gray-400 mt-1.5">{row.context}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-bold text-forest-900 mb-4">What does 1 tonne of CO₂e look like?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { equiv: '🚗 Driving ~4,750 km', detail: 'in a petrol car (London → Rome × 2.5)' },
                  { equiv: '✈️ One short-haul flight', detail: 'e.g. London to Barcelona return' },
                  { equiv: '🥩 Eating ~37 kg of beef', detail: 'about 5 months of typical consumption' },
                  { equiv: '💡 Powering a home for ~4 months', detail: 'average UK electricity usage' },
                  { equiv: '🌳 Offset by ~50 trees', detail: 'planted and growing for one year' },
                  { equiv: '🌊 Melts ~3 m² of Arctic ice', detail: 'per the "social cost of carbon" research' },
                ].map(item => (
                  <div key={item.equiv} className="flex items-start gap-3 rounded-xl bg-forest-50 p-3.5">
                    <span className="text-xl flex-shrink-0" aria-hidden>{item.equiv.split(' ')[0]}</span>
                    <div>
                      <p className="text-sm font-medium text-forest-900">{item.equiv.split(' ').slice(1).join(' ')}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-forest-700 to-forest-800 text-white border-0">
              <h2 className="text-lg font-bold text-white mb-3">The Paris Agreement target</h2>
              <p className="text-forest-200 text-sm leading-relaxed mb-4">
                To keep global warming below 1.5°C, total global emissions need to halve by 2030 and reach net zero by 2050. For individuals in high-income countries, this means reducing from ~10–15 tonnes/year to roughly <strong className="text-white">2.5 tonnes/year by 2050</strong>.
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Now (avg UK)', value: '11t/yr' },
                  { label: '2030 target', value: '5.5t/yr' },
                  { label: '2050 target', value: '2.5t/yr' },
                ].map(t => (
                  <div key={t.label} className="rounded-xl bg-white/10 p-3">
                    <p className="text-xl font-bold text-white">{t.value}</p>
                    <p className="text-xs text-forest-300 mt-0.5">{t.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </Tabs.Content>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <Tabs.Content value="faq" className="mt-6 focus:outline-none">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            <Card>
              <div className="flex items-center gap-3 mb-5">
                <Info className="h-5 w-5 text-forest-600" aria-hidden />
                <h2 className="text-lg font-bold text-forest-900">Frequently Asked Questions</h2>
              </div>
              <div className="space-y-2" role="list">
                {FAQ.map(item => (
                  <AccordionItem key={item.q} question={item.q} answer={item.a} />
                ))}
              </div>
            </Card>

            <Callout icon="📬" variant="info">
              Have a question not answered here? The methodology behind EcoTrack is based on publicly available data from IPCC, DEFRA, and Our World in Data.
            </Callout>
          </motion.div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
