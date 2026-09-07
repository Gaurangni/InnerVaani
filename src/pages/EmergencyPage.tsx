import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, type EmergencyContact } from '../lib/supabase';
import {
  Phone, Plus, Edit3, Trash2, Shield, AlertTriangle,
  Heart, X, Save, Loader2, Star, ExternalLink,
  MessageCircle, Globe
} from 'lucide-react';

const CRISIS_RESOURCES = [
  { name: 'iCall (India)', number: '9152987821', hours: 'Mon-Sat 8AM-10PM', type: 'phone', country: 'IN' },
  { name: 'Vandrevala Foundation', number: '1860-2662-345', hours: '24/7', type: 'phone', country: 'IN' },
  { name: 'AASRA (India)', number: '9820466627', hours: '24/7', type: 'phone', country: 'IN' },
  { name: '988 Lifeline (US)', number: '988', hours: '24/7', type: 'phone', country: 'US' },
  { name: 'Crisis Text Line', number: 'Text HOME to 741741', hours: '24/7', type: 'text', country: 'US' },
  { name: 'Samaritans (UK)', number: '116 123', hours: '24/7', type: 'phone', country: 'UK' },
];

const SELF_HELP = [
  { title: '5-4-3-2-1 Grounding', desc: 'Name 5 things you see, 4 you hear, 3 you can touch, 2 you smell, 1 you taste.', icon: '👁️' },
  { title: 'Box Breathing', desc: 'Breathe in for 4 counts, hold 4, out 4, hold 4. Repeat 4 times.', icon: '🫁' },
  { title: 'Safe Space Visualization', desc: 'Close your eyes and imagine a calm, safe place in vivid detail.', icon: '🏡' },
  { title: 'TIPP Skill', desc: 'Temperature (ice on face), Intense exercise, Paced breathing, Progressive relaxation.', icon: '🌊' },
];

export default function EmergencyPage() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: '', phone: '', email: '', is_primary: false, notes: '' });

  useEffect(() => { if (user) loadContacts(); }, [user]);

  async function loadContacts() {
    const { data } = await supabase.from('emergency_contacts').select('*').order('is_primary', { ascending: false });
    if (data) setContacts(data as EmergencyContact[]);
    setLoading(false);
  }

  function openAdd() {
    setForm({ name: '', relationship: '', phone: '', email: '', is_primary: false, notes: '' });
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(contact: EmergencyContact) {
    setForm({ name: contact.name, relationship: contact.relationship ?? '', phone: contact.phone ?? '', email: contact.email ?? '', is_primary: contact.is_primary, notes: contact.notes ?? '' });
    setEditingId(contact.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = { name: form.name, relationship: form.relationship || null, phone: form.phone || null, email: form.email || null, is_primary: form.is_primary, notes: form.notes || null };

    if (editingId) {
      await supabase.from('emergency_contacts').update(payload).eq('id', editingId);
    } else {
      await supabase.from('emergency_contacts').insert(payload);
    }
    await loadContacts();
    setSaving(false);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    await supabase.from('emergency_contacts').delete().eq('id', id);
    setContacts(prev => prev.filter(c => c.id !== id));
  }

  return (
    <div className="page-container space-y-8">
      {/* Emergency Banner */}
      <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Emergency Support</h1>
            <p className="text-red-100 text-sm leading-relaxed">
              If you or someone else is in immediate danger, please call emergency services (112 in India, 911 in US/Canada) immediately.
              This page provides crisis resources and your personal support contacts.
            </p>
          </div>
        </div>
      </div>

      {/* Crisis Hotlines */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-red-500" /> Crisis Helplines
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CRISIS_RESOURCES.map((resource, i) => (
            <div key={i} className="card p-4 border-l-4 border-red-400 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{resource.name}</h3>
                <span className={`badge text-xs ${resource.country === 'IN' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : resource.country === 'US' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {resource.country}
                </span>
              </div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400 mb-1">{resource.number}</div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                {resource.type === 'text' ? <MessageCircle className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                {resource.hours}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Immediate Coping Tools */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-teal-500" /> Immediate Coping Techniques
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {SELF_HELP.map((item, i) => (
            <div key={i} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.title}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Emergency Contacts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" /> My Emergency Contacts
          </h2>
          <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Contact
          </button>
        </div>

        {showForm && (
          <div className="card p-6 mb-4 animate-slide-up border-teal-200 dark:border-teal-700/50">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{editingId ? 'Edit Contact' : 'Add Emergency Contact'}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" className="input-field" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Relationship</label>
                <input value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))} placeholder="Mother, Friend, Doctor..." className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} type="tel" placeholder="+91 98765 43210" className="input-field" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Email</label>
                <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" placeholder="contact@email.com" className="input-field" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Notes</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any important info..." className="input-field" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_primary} onChange={e => setForm(f => ({ ...f, is_primary: e.target.checked }))} className="w-4 h-4 rounded text-teal-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Primary contact</span>
              </label>
              <div className="ml-auto flex gap-2">
                <button onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary text-sm py-2 flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-teal-500" /></div>
        ) : contacts.length === 0 ? (
          <div className="card p-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">No emergency contacts yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add trusted people who can support you in difficult moments.</p>
            <button onClick={openAdd} className="btn-primary text-sm">Add First Contact</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {contacts.map(contact => (
              <div key={contact.id} className={`card p-5 ${contact.is_primary ? 'border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-900/10' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${contact.is_primary ? 'bg-gradient-to-br from-teal-500 to-emerald-500' : 'bg-gradient-to-br from-gray-400 to-gray-500'}`}>
                      {contact.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{contact.name}</h3>
                        {contact.is_primary && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                      </div>
                      {contact.relationship && <p className="text-sm text-gray-500 dark:text-gray-400">{contact.relationship}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(contact)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-teal-600 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(contact.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {contact.phone && (
                    <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 hover:underline">
                      <Phone className="w-4 h-4" /> {contact.phone}
                    </a>
                  )}
                  {contact.email && (
                    <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Globe className="w-4 h-4" /> {contact.email}
                    </p>
                  )}
                  {contact.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{contact.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resources */}
      <div className="card p-6 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-teal-200 dark:border-teal-700/50">
        <h3 className="font-semibold text-teal-800 dark:text-teal-300 mb-3">Remember</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-sm text-teal-700 dark:text-teal-400">
          <div className="flex items-start gap-2">
            <Heart className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Asking for help is a sign of strength, not weakness.</p>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Your mental health crisis is real and valid. You deserve support.</p>
          </div>
          <div className="flex items-start gap-2">
            <Globe className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>Crisis feelings are temporary. You don't have to face this alone.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
