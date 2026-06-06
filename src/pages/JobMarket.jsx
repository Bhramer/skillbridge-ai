import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, DollarSign, SlidersHorizontal } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { jobMatches } from '../data/mock';

const locations = ['All', 'Remote', 'San Francisco, CA', 'New York, NY', 'Toronto, CA', 'Los Gatos, CA', 'Boston, MA'];

export default function JobMarket() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('All');
  const [minMatch, setMinMatch] = useState(0);

  const filtered = jobMatches.filter((j) => {
    const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = location === 'All' || j.location === location;
    const matchesMin = j.match >= minMatch;
    return matchesSearch && matchesLocation && matchesMin;
  });

  return (
    <motion.div className="page-container" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
      <div>
        <h2 className="page-title">Job Market</h2>
        <p className="page-subtitle">Live job openings matched to your profile</p>
      </div>

      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs or companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <div className="flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500 whitespace-nowrap">Min match: {minMatch}%</span>
            <input
              type="range"
              min={0}
              max={100}
              value={minMatch}
              onChange={(e) => setMinMatch(Number(e.target.value))}
              className="w-32 accent-indigo-600"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((job) => (
          <motion.div key={job.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
            <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
                  {job.company.charAt(0)}
                </div>
                <Badge variant={job.match >= 85 ? 'emerald' : job.match >= 70 ? 'amber' : 'rose'}>
                  {job.match}% match
                </Badge>
              </div>
              <div className="mt-3 flex-1">
                <h4 className="font-semibold text-slate-900">{job.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{job.company}</p>
              </div>
              <div className="flex flex-wrap gap-3 mt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {job.salary}</span>
              </div>
              <button className="mt-4 w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
                View Details
              </button>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p className="text-lg font-medium">No jobs match your filters</p>
          <p className="text-sm mt-1">Try adjusting your search criteria</p>
        </div>
      )}
    </motion.div>
  );
}
