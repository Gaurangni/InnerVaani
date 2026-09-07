import React, { useState, useEffect } from 'react';
import {
  Brain, ArrowRight, Star, Shield, Zap, Heart, Users, BookOpen,
  BarChart2, MessageCircle, Sparkles, CheckCircle, Play,
  ChevronRight, Quote, TrendingUp, Moon, Sun, Leaf
} from 'lucide-react';

type LandingPageProps = {
  setCurrentPage: (page: string) => void;
};

const features = [
  {
    icon: BookOpen,
    title: 'AI-Powered Journal',
    desc: 'Write freely and let our NLP engine detect emotions, stress patterns, and offer personalized insights after every entry.',
    color: 'from-teal-500 to-emerald-500',
    bg: 'bg-teal-50 dark:bg-teal-900/20',
  },
  {
    icon: BarChart2,
    title: 'Mental Health Tracker',
    desc: 'Log mood, sleep, stress, and energy daily. Beautiful charts reveal patterns that empower better self-care decisions.',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Zap,
    title: 'Smart Recommendations',
    desc: 'ML algorithms analyze your data to recommend yoga, meditation, breathing exercises, and routines uniquely tailored to you.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    icon: Users,
    title: 'Peer Support Community',
    desc: 'Join thousands in moderated support groups. Share experiences, find connection, and heal together — anonymously if you wish.',
    color: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
  },
  {
    icon: MessageCircle,
    title: 'AI Wellness Assistant',
    desc: 'Your empathetic 24/7 companion. Ask anything wellness-related, get emotional support, and navigate your healing journey.',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
  },
  {
    icon: Heart,
    title: 'Therapist Matching',
    desc: 'Find verified therapists matched to your needs, language, and preferences. Request appointments in seconds.',
    color: 'from-green-500 to-teal-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
];

const testimonials = [
  {
    name: 'Ananya Krishnan',
    role: 'Software Engineer',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    text: 'Inner Vaani transformed how I understand my emotions. The AI journal insights are uncannily accurate — it noticed my anxiety spike on Monday mornings before I did.',
    rating: 5,
  },
  {
    name: 'Rohan Mehta',
    role: 'Entrepreneur',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    text: 'The mood tracking helped me connect sleep patterns to my productivity crashes. Within 3 weeks I restructured my entire evening routine. Game changer.',
    rating: 5,
  },
  {
    name: 'Priya Nair',
    role: 'Teacher',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    text: "The community here is unlike anything I've found online. Safe, supportive, and real. The anonymous posting feature made it possible for me to finally open up.",
    rating: 5,
  },
];

const stats = [
  { value: '50K+', label: 'Active Users', icon: Users },
  { value: '98%', label: 'Satisfaction Rate', icon: Star },
  { value: '2M+', label: 'Journal Entries', icon: BookOpen },
  { value: '150+', label: 'Verified Therapists', icon: Heart },
];

const wellnessTips = [
  { icon: Moon, tip: 'Practice 5-minute box breathing before bed to improve sleep quality by 40%' },
  { icon: Sun, tip: 'Morning journaling for 10 minutes reduces anxiety levels throughout the day' },
  { icon: Leaf, tip: 'Regular mindfulness practice reshapes neural pathways for lasting happiness' },
];

export default function LandingPage({ setCurrentPage }: LandingPageProps) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTipIndex(i => (i + 1) % wellnessTips.length), 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-mesh">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-teal-400/10 dark:bg-teal-400/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-emerald-400/10 dark:bg-emerald-400/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/8 dark:bg-cyan-400/4 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700/50 text-teal-700 dark:text-teal-300 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-Powered Mental Wellness Platform
              </div>

              <div>
                <h1 className="text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
                  <span className="text-gray-900 dark:text-white">Find your </span>
                  <span className="text-gradient">inner</span>
                  <span className="text-gray-900 dark:text-white"> voice</span>
                </h1>
                <h1 className="text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight mt-2">
                  <span className="text-gray-900 dark:text-white">heal your </span>
                  <span className="text-gradient">inner</span>
                  <span className="text-gray-900 dark:text-white"> self</span>
                </h1>
              </div>

              <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                Inner Vaani combines AI intelligence with evidence-based wellness practices to help you understand your emotions, track mental health, and build lasting well-being habits.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setCurrentPage('signup')}
                  className="btn-primary flex items-center gap-2 text-base px-8 py-4"
                >
                  Begin Your Journey
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPage('library')}
                  className="btn-secondary flex items-center gap-2 text-base px-6 py-4"
                >
                  <Play className="w-5 h-5" />
                  Explore Library
                </button>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex -space-x-2">
                  {['https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
                    'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
                    'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
                  ].map((src, i) => (
                    <img key={i} src={src} alt="" className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-900 object-cover" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Trusted by 50,000+ users</p>
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative mx-auto max-w-lg">
                {/* Main card */}
                <div className="glass-card p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Today's Wellness</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Wednesday, June 25</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-glow">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Wellness Score Ring */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                        <circle
                          cx="48" cy="48" r="40" fill="none"
                          stroke="url(#grad)" strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.78)}`}
                        />
                        <defs>
                          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#14b8a6" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">78</span>
                        <span className="text-xs text-gray-500">Score</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      {[
                        { label: 'Mood', value: 8, max: 10, color: 'bg-emerald-400' },
                        { label: 'Energy', value: 7, max: 10, color: 'bg-blue-400' },
                        { label: 'Stress', value: 3, max: 10, color: 'bg-amber-400' },
                      ].map(item => (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                            <span className="font-medium text-gray-900 dark:text-white">{item.value}/{item.max}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                            <div className={`h-2 ${item.color} rounded-full transition-all duration-700`} style={{ width: `${(item.value/item.max)*100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Insight */}
                  <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-teal-100 dark:border-teal-800/50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-teal-700 dark:text-teal-300 mb-1">AI Insight</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">Your mood is 23% higher than last week. The 15-min morning meditation is working beautifully!</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute -top-6 -right-6 glass-card p-3 animate-float shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">21-Day Streak!</p>
                      <p className="text-xs text-gray-500">Keep it up!</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 glass-card p-3 animate-float shadow-lg" style={{ animationDelay: '1.5s' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/40 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">AI Analysis</p>
                      <p className="text-xs text-gray-500">Ready for today</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white/50 dark:bg-gray-900/50 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-teal-50 dark:bg-teal-900/30 rounded-xl group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700/50 text-teal-700 dark:text-teal-300 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" /> Powerful Features
            </div>
            <h2 className="section-heading mb-4">Everything you need for mental wellness</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              A comprehensive platform built on science, powered by AI, and driven by compassion.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="card p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
                onClick={() => setCurrentPage('signup')}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${feature.bg} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                  <div className={`w-8 h-8 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center`}>
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{feature.desc}</p>
                <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400 text-sm font-medium group-hover:gap-2 transition-all">
                  Learn more <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Wellness Tip */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
            {React.createElement(wellnessTips[tipIndex].icon, { className: "w-8 h-8 text-white" })}
          </div>
          <p className="text-2xl font-light text-white leading-relaxed mb-6 min-h-[4rem] transition-all duration-500">
            "{wellnessTips[tipIndex].tip}"
          </p>
          <div className="flex justify-center gap-2">
            {wellnessTips.map((_, i) => (
              <button key={i} onClick={() => setTipIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === tipIndex ? 'bg-white w-6' : 'bg-white/40'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-heading mb-4">Real people, real transformations</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Join thousands who've found their path to mental wellness with Inner Vaani</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <Quote className="w-8 h-8 text-teal-300 dark:text-teal-700 mb-4" />
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-teal-100 dark:border-teal-800" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.role}</p>
                  </div>
                  <div className="ml-auto flex">
                    {Array(t.rating).fill(0).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-12 shadow-2xl">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl shadow-glow mb-8">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h2 className="section-heading mb-4">Begin your healing journey today</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              Join Inner Vaani for free and discover the power of AI-driven emotional wellness. Your journey to mental peace starts with a single step.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {['No credit card required', 'Free forever plan', 'Cancel anytime'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-5 h-5 text-teal-500" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setCurrentPage('signup')} className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white">InnerVaani</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Find your inner voice, heal your inner self.</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Mental Health Resources</span>
              <span>Crisis Support</span>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              © 2024 Inner Vaani. Built with care for your wellbeing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
