import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, type ChatMessage } from '../lib/supabase';
import { Send, Loader2, Brain, Sparkles, RefreshCw, BookOpen, Heart, Wind, Users, Stethoscope } from 'lucide-react';

const QUICK_PROMPTS = [
  { text: 'I\'m feeling anxious', icon: '😰' },
  { text: 'Help me with breathing exercise', icon: '🫁' },
  { text: 'I can\'t sleep tonight', icon: '🌙' },
  { text: 'Suggest a meditation for stress', icon: '🧘' },
  { text: 'I feel lonely', icon: '💙' },
  { text: 'How do I improve my mood?', icon: '✨' },
];

type SuggestedAction = {
  label: string;
  page: string;
  icon: React.ElementType;
};

type ChatBotPageProps = {
  setCurrentPage: (page: string) => void;
};

function generateResponse(userMessage: string, profile?: { full_name?: string | null }): { text: string; actions?: SuggestedAction[] } {
  const msg = userMessage.toLowerCase();
  const name = profile?.full_name?.split(' ')[0] || 'friend';

  if (msg.includes('anxious') || msg.includes('anxiety') || msg.includes('panic') || msg.includes('nervous')) {
    return {
      text: `I hear you, ${name}. Anxiety can feel overwhelming, but you're doing something brave by acknowledging it.\n\nHere's something that can help right now — try the **4-7-8 breathing technique**:\n\n1. Exhale completely through your mouth\n2. Inhale through your nose for **4 counts**\n3. Hold your breath for **7 counts**\n4. Exhale through your mouth for **8 counts**\n\nDo this 4 times. It activates your parasympathetic nervous system and can provide relief within minutes.\n\nIf anxiety is affecting your daily life, consider talking to one of our verified therapists. You deserve support. 💙`,
      actions: [
        { label: 'Try Breathing Exercise', page: 'library', icon: Wind },
        { label: 'Find a Therapist', page: 'therapists', icon: Stethoscope },
      ],
    };
  }

  if (msg.includes('sleep') || msg.includes('insomnia') || msg.includes('can\'t sleep')) {
    return {
      text: `Poor sleep can really affect everything — mood, energy, focus. You're not alone in this, ${name}.\n\nHere are some evidence-based strategies for tonight:\n\n• **4-7-8 breathing** before bed activates your parasympathetic system\n• **Body scan meditation** can release physical tension\n• Keep your room at **18-20°C** (65-68°F)\n• Avoid screens 30 minutes before bed\n• Write down tomorrow's to-do list so your brain can "let go"\n\nWould you like me to guide you through a sleep meditation right now? Also, tracking your sleep patterns in our Mood Tracker can help identify what's affecting your sleep.`,
      actions: [
        { label: 'Sleep Meditation', page: 'library', icon: Brain },
        { label: 'Track Sleep', page: 'tracker', icon: BookOpen },
      ],
    };
  }

  if (msg.includes('sad') || msg.includes('depressed') || msg.includes('depress') || msg.includes('hopeless')) {
    return {
      text: `Thank you for trusting me with this, ${name}. What you're feeling is valid, and it takes courage to reach out.\n\nI want you to know: **you are not alone**. Depression and sadness are not weaknesses — they're signals your mind and body are sending you.\n\nSome gentle things that might help right now:\n\n• **Journaling** — just 5 minutes of writing can provide emotional release\n• **Gentle movement** — even a 10-minute walk changes brain chemistry\n• **Connection** — our community has people who truly understand\n\n⚠️ **Important:** If you're having thoughts of self-harm, please reach out to a crisis helpline immediately. In India: iCall — 9152987821. In the US: 988 Suicide & Crisis Lifeline.\n\nYou matter. 💙`,
      actions: [
        { label: 'Write in Journal', page: 'journal', icon: BookOpen },
        { label: 'Join Community', page: 'community', icon: Users },
        { label: 'Find Support', page: 'therapists', icon: Heart },
      ],
    };
  }

  if (msg.includes('stress') || msg.includes('stressed') || msg.includes('overwhelm')) {
    return {
      text: `Stress is your body's way of saying it needs care, ${name}. Let's address this together.\n\nThe most immediate stress reliever is **box breathing** — used by Navy SEALs in high-pressure situations:\n\n1. Breathe in for **4 counts**\n2. Hold for **4 counts**\n3. Breathe out for **4 counts**\n4. Hold for **4 counts**\n\nFor longer-term stress management, I'd recommend:\n\n• Daily **5-10 min meditation** (proven to reduce cortisol by 20%)\n• **Progressive muscle relaxation** before bed\n• Identifying your stress triggers by tracking moods\n\nWould you like to log how you're feeling right now in the mood tracker? Patterns often reveal the root causes.`,
      actions: [
        { label: 'Box Breathing', page: 'library', icon: Wind },
        { label: 'Log Stress Level', page: 'tracker', icon: BookOpen },
      ],
    };
  }

  if (msg.includes('meditation') || msg.includes('meditate') || msg.includes('mindful')) {
    return {
      text: `Wonderful choice, ${name}! Meditation is one of the most powerful tools for mental wellness, with decades of neuroscience research behind it.\n\nFor beginners, I recommend starting with **5 minutes of mindfulness breathing**:\n\n1. Sit comfortably, close your eyes\n2. Focus on the sensation of breathing\n3. When your mind wanders, gently bring it back — this is the practice!\n4. No judgment, just gentle redirection\n\nOver time, this rewires your brain's default mode network, reducing rumination and increasing present-moment awareness.\n\nOur Wellness Library has **12 guided practices** ranging from 5 to 60 minutes. What specific goal would you like meditation to help with? (stress, sleep, focus, emotional regulation?)`,
      actions: [
        { label: 'Browse Meditations', page: 'library', icon: Brain },
      ],
    };
  }

  if (msg.includes('yoga')) {
    return {
      text: `Yoga is incredible for mental health, ${name}! The combination of movement, breath, and mindfulness makes it uniquely powerful.\n\nFor mental wellness, I especially recommend:\n\n• **Yin Yoga** — deep, held poses for emotional release and stress relief\n• **Morning Sun Salutation** — energizes and sets positive tone\n• **Restorative Yoga** — perfect for anxiety and burnout recovery\n\nScience shows regular yoga practice reduces cortisol levels, increases GABA (anti-anxiety neurotransmitter), and improves sleep quality.\n\nOur library has beginner to advanced practices. What's your experience level, and what are you hoping yoga will help you with?`,
      actions: [
        { label: 'Explore Yoga', page: 'library', icon: Wind },
      ],
    };
  }

  if (msg.includes('therapist') || msg.includes('therapy') || msg.includes('professional') || msg.includes('counselor')) {
    return {
      text: `Seeking professional support is one of the most self-aware things you can do, ${name}. I think that's really brave.\n\nInner Vaani has **5 verified therapists** specializing in anxiety, depression, trauma, relationships, and holistic wellness. You can filter by:\n\n• **Language** (English, Hindi, Tamil, and more)\n• **Consultation mode** (video, phone, in-person)\n• **Specialization** matching your needs\n• **Location** and availability\n\nAll our therapists are credentialed professionals with verified qualifications. You can request an appointment directly through the platform.\n\nIs there a specific concern you'd like your therapist to specialize in?`,
      actions: [
        { label: 'Find Therapist', page: 'therapists', icon: Stethoscope },
      ],
    };
  }

  if (msg.includes('lonely') || msg.includes('alone') || msg.includes('isolated')) {
    return {
      text: `Loneliness is one of the most painful human experiences, ${name}, and you're not alone in feeling it — even if that's hard to believe right now.\n\nConnection is fundamental to mental health. A few gentle suggestions:\n\n• Our **Community** has support groups of people who genuinely understand. Many post anonymously, so it feels safer.\n• Even **reading others' stories** can help you feel less alone\n• Small connections matter — a smile, a text, a kind comment\n\nAlso, **self-connection through journaling** can be surprisingly comforting. Sometimes we're lonely for ourselves — the part of us that gets buried under life's demands.\n\nWould you like to share what's making you feel this way? I'm here to listen. 💙`,
      actions: [
        { label: 'Join Community', page: 'community', icon: Users },
        { label: 'Write in Journal', page: 'journal', icon: BookOpen },
      ],
    };
  }

  if (msg.includes('grateful') || msg.includes('gratitude') || msg.includes('thankful')) {
    return {
      text: `Practicing gratitude is one of the most evidence-backed mental wellness tools, ${name}. The fact that you're here means you're already on a powerful path!\n\nGratitude literally rewires your brain — it increases serotonin and dopamine, reduces the amygdala's reactivity to stress, and creates lasting positive neural pathways.\n\n**Try this tonight:** Write 3 specific things you're grateful for, and for each one, write WHY it matters to you. The specificity is key.\n\nOur Journaling feature has a **Gratitude** category with prompts to guide you. Consistent practice (21+ days) creates measurable changes in baseline happiness levels.`,
      actions: [
        { label: 'Start Gratitude Journal', page: 'journal', icon: BookOpen },
      ],
    };
  }

  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('start')) {
    return {
      text: `Hello, ${name}! I'm your Inner Vaani Wellness Assistant — here to support your mental health journey 24/7. 🌿\n\nI can help you with:\n• **Emotional support** when you're struggling\n• **Breathing & meditation techniques** for immediate relief\n• **Understanding your mood patterns** from your tracker data\n• **Finding the right therapist** for your needs\n• **Wellness recommendations** personalized to you\n\nWhat's on your mind today? You can share anything — this is a judgment-free space.\n\n⚠️ *I'm an AI assistant designed to support, not replace, professional mental healthcare. For medical emergencies or crisis situations, please contact a professional immediately.*`,
    };
  }

  // Default response
  return {
    text: `Thank you for sharing that with me, ${name}. I want to make sure I give you the most helpful response possible.\n\nCould you tell me a bit more about what you're experiencing? For example:\n\n• How long have you been feeling this way?\n• Is there something specific that triggered it?\n• What kind of support would feel most helpful right now?\n\nI'm here to listen and support you. There are no wrong answers here — everything you share helps me understand how to best help you. 💙\n\n⚠️ *Remember: I'm an AI wellness assistant. For serious mental health concerns, please consult a qualified professional.*`,
    actions: [
      { label: 'Browse Resources', page: 'library', icon: BookOpen },
      { label: 'Find Therapist', page: 'therapists', icon: Stethoscope },
    ],
  };
}

export default function ChatbotPage({ setCurrentPage }: ChatBotPageProps) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (user) loadHistory(); }, [user]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function loadHistory() {
    const { data } = await supabase.from('chat_messages').select('*').order('created_at').limit(50);
    if (data && data.length > 0) {
      setMessages(data as ChatMessage[]);
    } else {
      const welcome: ChatMessage = {
        id: 'welcome',
        user_id: user!.id,
        role: 'assistant',
        content: `Hello, ${profile?.full_name?.split(' ')[0] || 'friend'}! I'm your Inner Vaani Wellness Assistant 🌿\n\nI'm here to support your mental health journey — whether you need immediate emotional support, wellness guidance, or help navigating the platform. What's on your mind today?`,
        created_at: new Date().toISOString(),
      };
      setMessages([welcome]);
    }
    setInitialLoading(false);
  }

  async function sendMessage(text?: string) {
    const messageText = text || input.trim();
    if (!messageText || loading) return;
    setInput('');
    setLoading(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      user_id: user!.id,
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);

    await supabase.from('chat_messages').insert({ role: 'user', content: messageText });

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const response = generateResponse(messageText, profile ?? undefined);
    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      user_id: user!.id,
      role: 'assistant',
      content: response.text,
      created_at: new Date().toISOString(),
    };

    await supabase.from('chat_messages').insert({ role: 'assistant', content: response.text });

    setMessages(prev => [...prev, { ...assistantMsg, actions: (response.actions as any) }]);
    setLoading(false);
  }

  async function clearHistory() {
    await supabase.from('chat_messages').delete().eq('user_id', user!.id);
    loadHistory();
  }

  function formatContent(text: string) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold">{line.slice(2, -2)}</p>;
      }
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className={line === '' ? 'h-2' : ''}>
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={j}>{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      );
    });
  }

  return (
    <div className="page-container max-w-4xl h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-glow">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Wellness Assistant</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-slow" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Online · Always here for you</span>
            </div>
          </div>
        </div>
        <button onClick={clearHistory} className="btn-ghost text-sm flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4" /> New Chat
        </button>
      </div>

      {/* Disclaimer */}
      <div className="flex-shrink-0 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl mb-4 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
        <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
        This AI assistant provides wellness support and is not a substitute for professional medical advice. For emergencies, contact a qualified healthcare provider.
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {initialLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
        ) : (
          messages.map((msg, i) => {
            const msgWithActions = msg as ChatMessage & { actions?: SuggestedAction[] };
            return (
              <div key={msg.id} className={`flex items-end gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white rounded-br-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="space-y-1">{formatContent(msg.content)}</div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msgWithActions.actions && msgWithActions.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msgWithActions.actions.map((action: SuggestedAction, j: number) => (
                        <button key={j} onClick={() => setCurrentPage(action.page)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/50 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors">
                          <action.icon className="w-3.5 h-3.5" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex items-end gap-3 animate-fade-in">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <div className="flex-shrink-0 flex flex-wrap gap-2 mb-3">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button key={i} onClick={() => sendMessage(prompt.text)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 hover:text-teal-600 dark:hover:text-teal-400 transition-all">
              <span>{prompt.icon}</span>
              {prompt.text}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 flex gap-2">
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="How are you feeling today? Ask me anything..."
          className="input-field flex-1"
          disabled={loading}
        />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
