import React, { useEffect, useState } from 'react';
import { supabase, type CommunityPost, type SupportGroup } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus, Heart, MessageCircle, Share, MoreHorizontal, Users,
  Search, Loader2, Send, X, ChevronRight, Flag, Shield,
  Eye, EyeOff
} from 'lucide-react';

const REACTIONS = [
  { type: 'heart', emoji: '❤️', label: 'Love' },
  { type: 'support', emoji: '🤗', label: 'Support' },
  { type: 'relate', emoji: '🫂', label: 'I relate' },
  { type: 'strength', emoji: '💪', label: 'Strength' },
  { type: 'hug', emoji: '🤝', label: 'Hug' },
];

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function CommunityPage() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groups, setGroups] = useState<SupportGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostAnon, setNewPostAnon] = useState(false);
  const [newPostTags, setNewPostTags] = useState('');
  const [posting, setPosting] = useState(false);
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set());
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, { id: string; content: string; user_id: string; created_at: string; is_anonymous: boolean }[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  useEffect(() => {
    loadGroups();
    loadPosts();
    if (user) loadMyReactions();
  }, [user, selectedGroup]);

  async function loadGroups() {
    const { data } = await supabase.from('support_groups').select('*').order('member_count', { ascending: false });
    if (data) setGroups(data as SupportGroup[]);
  }

  async function loadPosts() {
    let query = supabase.from('community_posts').select('*').order('created_at', { ascending: false }).limit(20);
    if (selectedGroup) query = query.eq('group_id', selectedGroup);
    const { data } = await query;
    if (data) setPosts(data as CommunityPost[]);
    setLoading(false);
  }

  async function loadMyReactions() {
    const { data } = await supabase.from('post_reactions').select('post_id').eq('user_id', user!.id);
    if (data) setMyReactions(new Set(data.map((r: { post_id: string }) => r.post_id)));
  }

  async function handlePost() {
    if (!newPostContent.trim() || !user) return;
    setPosting(true);
    const tags = newPostTags.split(',').map(t => t.trim()).filter(Boolean);
    await supabase.from('community_posts').insert({
      content: newPostContent,
      title: newPostTitle || null,
      is_anonymous: newPostAnon,
      tags,
      group_id: selectedGroup,
    });
    setNewPostContent('');
    setNewPostTitle('');
    setNewPostTags('');
    setNewPostAnon(false);
    setShowNewPost(false);
    setPosting(false);
    loadPosts();
  }

  async function handleReact(postId: string) {
    if (!user) return;
    if (myReactions.has(postId)) {
      await supabase.from('post_reactions').delete().eq('post_id', postId).eq('user_id', user.id);
      setMyReactions(prev => { const n = new Set(prev); n.delete(postId); return n; });
      await supabase.from('community_posts').update({ reaction_count: posts.find(p => p.id === postId)!.reaction_count - 1 }).eq('id', postId);
    } else {
      await supabase.from('post_reactions').insert({ post_id: postId, reaction_type: 'heart' });
      setMyReactions(prev => new Set([...prev, postId]));
      await supabase.from('community_posts').update({ reaction_count: posts.find(p => p.id === postId)!.reaction_count + 1 }).eq('id', postId);
    }
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, reaction_count: p.reaction_count + (myReactions.has(postId) ? -1 : 1) } : p));
  }

  async function loadComments(postId: string) {
    const { data } = await supabase.from('community_comments').select('*').eq('post_id', postId).order('created_at');
    if (data) setComments(prev => ({ ...prev, [postId]: data as any }));
  }

  async function submitComment(postId: string) {
    if (!newComment[postId]?.trim() || !user) return;
    await supabase.from('community_comments').insert({ post_id: postId, content: newComment[postId] });
    setNewComment(prev => ({ ...prev, [postId]: '' }));
    loadComments(postId);
    await supabase.from('community_posts').update({ comment_count: posts.find(p => p.id === postId)!.comment_count + 1 }).eq('id', postId);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p));
  }

  function toggleExpand(postId: string) {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      loadComments(postId);
    }
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="page-container">
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar: Groups */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-4">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-500" /> Support Groups
            </h2>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedGroup(null)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${!selectedGroup ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                All Posts
              </button>
              {groups.map(group => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${selectedGroup === group.id ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{group.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{(group.member_count / 1000).toFixed(1)}k</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Community Guidelines */}
          <div className="card p-4 bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">Community Guidelines</span>
            </div>
            <ul className="space-y-1 text-xs text-teal-600 dark:text-teal-400">
              <li>• Be kind and supportive</li>
              <li>• No medical advice</li>
              <li>• Respect anonymity</li>
              <li>• Report harmful content</li>
              <li>• You are not alone</li>
            </ul>
          </div>
        </div>

        {/* Main: Posts */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedGroup ? groups.find(g => g.id === selectedGroup)?.name : 'Community Feed'}
            </h1>
            <button onClick={() => setShowNewPost(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Share
            </button>
          </div>

          {/* New Post Form */}
          {showNewPost && (
            <div className="card p-5 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Share with community</h3>
                <button onClick={() => setShowNewPost(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <input
                type="text" placeholder="Title (optional)"
                value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)}
                className="input-field mb-3 text-sm"
              />
              <textarea
                placeholder="Share your thoughts, experiences, or ask for support..."
                value={newPostContent} onChange={e => setNewPostContent(e.target.value)}
                className="input-field mb-3 min-h-[120px] resize-none text-sm"
              />
              <input
                type="text" placeholder="Tags (comma separated)"
                value={newPostTags} onChange={e => setNewPostTags(e.target.value)}
                className="input-field mb-3 text-sm py-2"
              />
              <div className="flex items-center justify-between">
                <button onClick={() => setNewPostAnon(!newPostAnon)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${newPostAnon ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                  {newPostAnon ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {newPostAnon ? 'Anonymous' : 'As myself'}
                </button>
                <button onClick={handlePost} disabled={posting || !newPostContent.trim()} className="btn-primary text-sm flex items-center gap-2 py-2">
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Post
                </button>
              </div>
            </div>
          )}

          {/* Posts */}
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-teal-500" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No posts yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 mb-4">Be the first to share in this community!</p>
              <button onClick={() => setShowNewPost(true)} className="btn-primary">Share Something</button>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => {
                const isExpanded = expandedPost === post.id;
                const reacted = myReactions.has(post.id);
                const postComments = comments[post.id] || [];

                return (
                  <div key={post.id} className="card p-5 hover:shadow-md transition-shadow">
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${post.is_anonymous ? 'bg-gray-400' : 'bg-gradient-to-br from-teal-400 to-emerald-500'}`}>
                          {post.is_anonymous ? '?' : (displayName[0] || 'U').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {post.is_anonymous ? 'Anonymous' : (post.user_id === user?.id ? displayName : 'Community Member')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(post.created_at)}</p>
                        </div>
                      </div>
                      {post.is_pinned && (
                        <span className="badge bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-xs">Pinned</span>
                      )}
                    </div>

                    {post.title && <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{post.title}</h3>}
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">{post.content}</p>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.map(tag => (
                          <span key={tag} className="text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 rounded-full">#{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <button onClick={() => handleReact(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${reacted ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <span className="text-base">{reacted ? '❤️' : '🤍'}</span>
                        <span>{post.reaction_count}</span>
                      </button>
                      <button onClick={() => toggleExpand(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${isExpanded ? 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comment_count}</span>
                      </button>
                      <div className="flex ml-1 gap-0.5">
                        {REACTIONS.map(r => (
                          <button key={r.type} title={r.label} className="p-1.5 rounded-lg text-base hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors hover:scale-125">
                            {r.emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comments Section */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3 animate-fade-in">
                        {postComments.length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-2">No comments yet. Be the first to respond!</p>
                        ) : (
                          postComments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-2">
                              <div className="w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-400 flex-shrink-0">
                                {comment.is_anonymous ? '?' : 'U'}
                              </div>
                              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                                  {comment.is_anonymous ? 'Anonymous' : (comment.user_id === user?.id ? displayName : 'Member')}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                        {user && (
                          <div className="flex gap-2">
                            <input
                              type="text" placeholder="Add a supportive comment..."
                              value={newComment[post.id] || ''} onChange={e => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && submitComment(post.id)}
                              className="input-field flex-1 py-2 text-sm"
                            />
                            <button onClick={() => submitComment(post.id)} disabled={!newComment[post.id]?.trim()} className="btn-primary py-2 px-3 disabled:opacity-50">
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
