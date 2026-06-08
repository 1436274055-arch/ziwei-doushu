'use client';
import { motion } from 'framer-motion';
import FamousPersonCard from '@/components/FamousPersonCard';
import { FAMOUS_PERSONS } from '@/lib/ziwei/famous';

interface FamousChartsProps {
  colors: Record<string, string>;
  theme: string;
}

export default function FamousCharts({ colors: _colors, theme: _theme }: FamousChartsProps) {
  return (
    <section className="py-12">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center text-2xl font-bold mb-8"
      >
        名人命盘库
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {FAMOUS_PERSONS.slice(0, 6).map((person) => (
          <FamousPersonCard key={person.name} person={person} />
        ))}
      </div>
    </section>
  );
}
