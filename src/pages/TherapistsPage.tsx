import React, { useEffect, useState } from 'react';
import { supabase, type Therapist } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Search, Star, MapPin, Clock, Video, Phone, Users,
  Filter, CheckCircle, Loader2, X, Send, Award,
  Globe, Heart, Brain, Shield
} from 'lucide-react';

const SPECIALIZATIONS = ['All', 'Anxiety', 'Depression', 'CBT', 'Trauma', 'PTSD', 'Relationships', 'ADHD', 'Stress Management', 'Mindfulness'];
const MODES = ['All', 'video', 'phone', 'in-person'];
const LANGUAGES = ['All', 'English', 'Hindi', 'Tamil', 'Mandarin', 'Gujarati', 'Malayalam'];

type AppointmentModalProps = {
  therapist: Therapist;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
};

function AppointmentModal({ therapist, userId, onClose, onSuccess }: AppointmentModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState(therapist.consultation_modes[0] || 'video');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from('appointment_requests').insert({
      therapist_id: therapist.id,
      preferred_date: date || null,
      preferred_time: time || null,
      message,
      consultation_mode: mode,
    });
    setSubmitting(false);
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Request Appointment</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <img src={therapist.avatar_url ?? ''} alt={therapist.full_name} className="w-12 h-12 rounded-xl object-cover" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{therapist.full_name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{therapist.title}</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Preferred Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Preferred Time</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Consultation Mode</label>
            <div className="flex gap-2">
              {therapist.consultation_modes.map(m => (
                <button key={m} type="button" onClick={() => setMode(m)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${mode === m ? 'bg-teal-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                  {m === 'video' ? <Video className="w-4 h-4" /> : m === 'phone' ? <Phone className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Message (Optional)</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Briefly describe what you'd like to work on..."
              className="input-field min-h-[80px] resize-none text-sm" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 py-3.5">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? 'Sending...' : 'Send Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TherapistsPage() {
  const { user } = useAuth();
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [langFilter, setLangFilter] = useState('All');
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [appointmentTherapist, setAppointmentTherapist] = useState<Therapist | null>(null);
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);

  useEffect(() => { loadTherapists(); }, []);

  async function loadTherapists() {
    const { data } = await supabase.from('therapists').select('*').eq('is_available', true).order('avg_rating', { ascending: false });
    if (data) setTherapists(data as Therapist[]);
    setLoading(false);
  }

  const filtered = therapists.filter(t => {
    const matchSearch = !search || t.full_name.toLowerCase().includes(search.toLowerCase()) || t.bio?.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specFilter === 'All' || t.specializations.some(s => s.toLowerCase().includes(specFilter.toLowerCase()));
    const matchMode = modeFilter === 'All' || t.consultation_modes.includes(modeFilter);
    const matchLang = langFilter === 'All' || t.languages.includes(langFilter);
    return matchSearch && matchSpec && matchMode && matchLang;
  });

  function handleAppointmentSuccess() {
    setAppointmentTherapist(null);
    setAppointmentSuccess(true);
    setTimeout(() => setAppointmentSuccess(false), 5000);
  }

  return (
    <div className="page-container space-y-6">
      {appointmentSuccess && (
        <div className="fixed top-24 right-4 z-50 card p-4 border-l-4 border-emerald-500 shadow-lg animate-slide-in-right flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">Appointment request sent!</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">The therapist will confirm shortly.</p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Your Therapist</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Verified mental health professionals matched to your needs</p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or specialization..."
            className="input-field pl-10" />
        </div>
        <div className="flex flex-wrap gap-3">
          <select value={specFilter} onChange={e => setSpecFilter(e.target.value)} className="input-field w-auto text-sm py-2">
            {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={modeFilter} onChange={e => setModeFilter(e.target.value)} className="input-field w-auto text-sm py-2 capitalize">
            {MODES.map(m => <option key={m} className="capitalize">{m === 'All' ? 'All Modes' : m}</option>)}
          </select>
          <select value={langFilter} onChange={e => setLangFilter(e.target.value)} className="input-field w-auto text-sm py-2">
            {LANGUAGES.map(l => <option key={l}>{l === 'All' ? 'All Languages' : l}</option>)}
          </select>
          {(search || specFilter !== 'All' || modeFilter !== 'All' || langFilter !== 'All') && (
            <button onClick={() => { setSearch(''); setSpecFilter('All'); setModeFilter('All'); setLangFilter('All'); }} className="btn-ghost text-sm flex items-center gap-1">
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Therapist Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No therapists found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(therapist => (
            <div key={therapist.id} className="card overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={therapist.avatar_url ?? `https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg`}
                      alt={therapist.full_name}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-white dark:border-gray-800 shadow-sm"
                    />
                    {therapist.is_verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{therapist.full_name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{therapist.title}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <div className="flex">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(therapist.avg_rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{therapist.avg_rating} ({therapist.total_reviews})</span>
                    </div>
                    {therapist.hourly_rate_usd && (
                      <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mt-1">${therapist.hourly_rate_usd}/hr</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Meta */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                  {therapist.location && (
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {therapist.location}</span>
                  )}
                  {therapist.years_experience && (
                    <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {therapist.years_experience}yr exp</span>
                  )}
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{therapist.bio}</p>

                {/* Specializations */}
                <div className="flex flex-wrap gap-1.5">
                  {therapist.specializations.slice(0, 3).map(spec => (
                    <span key={spec} className="badge bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 text-xs">{spec}</span>
                  ))}
                  {therapist.specializations.length > 3 && (
                    <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs">+{therapist.specializations.length - 3}</span>
                  )}
                </div>

                {/* Languages & Modes */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Globe className="w-3.5 h-3.5" />
                    {therapist.languages.join(', ')}
                  </div>
                  <div className="flex gap-2">
                    {therapist.consultation_modes.map(mode => (
                      <span key={mode} className="flex items-center gap-1 badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">
                        {mode === 'video' ? <Video className="w-3 h-3" /> : mode === 'phone' ? <Phone className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                        {mode}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => user ? setAppointmentTherapist(therapist) : undefined}
                    className="btn-primary flex-1 text-sm py-2.5"
                  >
                    Book Appointment
                  </button>
                  <button onClick={() => setSelectedTherapist(selectedTherapist?.id === therapist.id ? null : therapist)}
                    className="btn-secondary px-3 py-2.5 text-sm">
                    Profile
                  </button>
                </div>
              </div>

              {/* Expanded Profile */}
              {selectedTherapist?.id === therapist.id && (
                <div className="border-t border-gray-100 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/50 space-y-3 animate-fade-in">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Education</h4>
                  <ul className="space-y-1">
                    {therapist.education.map((edu, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Award className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                        {edu}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Important Notice */}
      <div className="card p-6 border-teal-200 dark:border-teal-800/50 bg-teal-50 dark:bg-teal-900/10">
        <div className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-teal-600 dark:text-teal-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-teal-800 dark:text-teal-300 mb-1">Our Verification Process</h3>
            <p className="text-sm text-teal-700 dark:text-teal-400 leading-relaxed">
              All therapists on Inner Vaani are verified professionals with validated credentials, licenses, and background checks. We partner only with licensed clinical psychologists, psychiatrists, and certified counselors. Your safety and well-being is our highest priority.
            </p>
          </div>
        </div>
      </div>

      {appointmentTherapist && user && (
        <AppointmentModal
          therapist={appointmentTherapist}
          userId={user.id}
          onClose={() => setAppointmentTherapist(null)}
          onSuccess={handleAppointmentSuccess}
        />
      )}
    </div>
  );
}
