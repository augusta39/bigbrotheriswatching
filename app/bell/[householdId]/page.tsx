'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { generateMessage, URGENCY_OPTIONS } from '@/lib/templates';

type Blast = {
  id: string;
  categoryLabel: string;
  eventLabel: string;
  urgency: string;
  status: string;
  createdAt: string;
  claimedAt?: string;
  doneAt?: string;
  reactions: Array<{
    kind: string;
    member: { id: string };
  }>;
};

export default function BellPage({ params }: { params: Promise<{ householdId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const householdId = resolvedParams.householdId;

  const [memberId, setMemberId] = useState<string>('');
  const [persona, setPersona] = useState<string>('ghost');
  const [blasts, setBlasts] = useState<Blast[]>([]);
  const [activeTab, setActiveTab] = useState<'OPEN' | 'CLAIMED' | 'DONE'>('OPEN');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Presets from API
  const [categories, setCategories] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);

  // Create blast form state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('whenever');

  useEffect(() => {
    const initializeMembership = async () => {
      // Check if we already have a member ID for this household
      const storageKey = `ghostbell_member_${householdId}`;
      let storedMemberId = localStorage.getItem(storageKey);
      const storedPersona = localStorage.getItem('ghostbell_persona') || 'ghost';

      if (!storedMemberId) {
        // Auto-create anonymous member
        try {
          const response = await fetch('/api/household/join', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              householdId,
              anonymous: true,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.memberId) {
              storedMemberId = data.memberId;
              localStorage.setItem(storageKey, data.memberId);
            }
          }
        } catch (error) {
          console.error('Error creating anonymous member:', error);
          setLoading(false);
          return;
        }
      }

      setMemberId(storedMemberId || '');
      setPersona(storedPersona);
    };

    initializeMembership();
  }, [householdId]);

  // Fetch presets
  const fetchPresets = async () => {
    try {
      const response = await fetch(`/api/presets?householdId=${householdId}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
        setEvents(data.events);
        // Set defaults if available
        if (data.categories.length > 0) setSelectedCategory(data.categories[0]);
        if (data.events.length > 0) setSelectedEvent(data.events[0]);
      }
    } catch (error) {
      console.error('Error fetching presets:', error);
    }
  };

  // Fetch blasts
  const fetchBlasts = async () => {
    try {
      const response = await fetch(`/api/blasts?householdId=${householdId}`);
      if (response.ok) {
        const data = await response.json();
        setBlasts(data.blasts);
      }
    } catch (error) {
      console.error('Error fetching blasts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (memberId) {
      fetchPresets();
      fetchBlasts();
    }
  }, [memberId, householdId]);

  // Polling every 5 seconds
  useEffect(() => {
    if (!memberId) return;

    const interval = setInterval(fetchBlasts, 5000);
    return () => clearInterval(interval);
  }, [memberId, householdId]);

  const handleCreateBlast = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/blasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          householdId,
          memberId,
          categoryLabel: selectedCategory,
          eventLabel: selectedEvent,
          urgency: selectedUrgency,
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setSelectedUrgency('whenever');
        fetchBlasts();
      }
    } catch (error) {
      console.error('Error creating blast:', error);
    }
  };

  const handleReaction = async (blastId: string, kind: string) => {
    try {
      await fetch(`/api/blasts/${blastId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId,
          kind,
        }),
      });
      fetchBlasts();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleMarkDone = async (blastId: string) => {
    try {
      await fetch(`/api/blasts/${blastId}/done`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId,
        }),
      });
      fetchBlasts();
    } catch (error) {
      console.error('Error marking done:', error);
    }
  };

  const filteredBlasts = blasts.filter(b => b.status === activeTab);

  const getReactionCount = (blast: Blast, kind: string) => {
    return blast.reactions.filter(r => r.kind === kind).length;
  };

  const hasUserReacted = (blast: Blast, kind: string) => {
    return blast.reactions.some(r => r.kind === kind && r.member.id === memberId);
  };

  // Generate live preview
  const previewMessage = selectedCategory && selectedEvent
    ? generateMessage({
        persona: persona as any,
        categoryLabel: selectedCategory,
        eventLabel: selectedEvent,
        urgency: selectedUrgency as any,
      })
    : '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">👁️ BigBrotherIsWatching</h1>
        </div>

        {/* Big Ring Bell Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-6 px-8 rounded-2xl shadow-lg text-xl mb-6 transition-all transform hover:scale-105"
        >
          🔔 Ring Bell
        </button>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['OPEN', 'CLAIMED', 'DONE'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Blast Feed */}
        <div className="space-y-4">
          {filteredBlasts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-gray-500">No {activeTab.toLowerCase()} blasts</p>
            </div>
          ) : (
            filteredBlasts.map((blast) => (
              <div key={blast.id} className="bg-white rounded-xl p-6 shadow-md">
                {/* Message */}
                <div className="mb-4">
                  <p className="text-lg font-medium">
                    {generateMessage({
                      persona: persona as any,
                      categoryLabel: blast.categoryLabel,
                      eventLabel: blast.eventLabel,
                      urgency: blast.urgency as any,
                    })}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(blast.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Status Chip - No Names */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    blast.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                    blast.status === 'CLAIMED' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {blast.status}
                  </span>
                  {blast.status === 'CLAIMED' && (
                    <span className="ml-2 text-sm text-gray-600">
                      Someone is on it
                    </span>
                  )}
                  {blast.status === 'DONE' && (
                    <span className="ml-2 text-sm text-gray-600">
                      Completed
                    </span>
                  )}
                </div>

                {/* Reactions */}
                {blast.status !== 'DONE' && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => handleReaction(blast.id, 'MINE')}
                      disabled={blast.status === 'CLAIMED' && !hasUserReacted(blast, 'MINE') && !hasUserReacted(blast, 'ON_IT')}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        hasUserReacted(blast, 'MINE')
                          ? 'bg-purple-100 border-purple-300'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      👋 Mine {getReactionCount(blast, 'MINE') > 0 && `(${getReactionCount(blast, 'MINE')})`}
                    </button>
                    <button
                      onClick={() => handleReaction(blast.id, 'ON_IT')}
                      disabled={blast.status === 'CLAIMED' && !hasUserReacted(blast, 'MINE') && !hasUserReacted(blast, 'ON_IT')}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        hasUserReacted(blast, 'ON_IT')
                          ? 'bg-purple-100 border-purple-300'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      🫡 On it {getReactionCount(blast, 'ON_IT') > 0 && `(${getReactionCount(blast, 'ON_IT')})`}
                    </button>
                    <button
                      onClick={() => handleReaction(blast.id, 'NOT_ME')}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        hasUserReacted(blast, 'NOT_ME')
                          ? 'bg-purple-100 border-purple-300'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      🚫 Not me {getReactionCount(blast, 'NOT_ME') > 0 && `(${getReactionCount(blast, 'NOT_ME')})`}
                    </button>
                    <button
                      onClick={() => handleReaction(blast.id, 'ACK')}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        hasUserReacted(blast, 'ACK')
                          ? 'bg-purple-100 border-purple-300'
                          : 'bg-white border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      🙏 Acknowledged {getReactionCount(blast, 'ACK') > 0 && `(${getReactionCount(blast, 'ACK')})`}
                    </button>
                  </div>
                )}

                {/* Mark Done Button - Only if you claimed it */}
                {blast.status === 'CLAIMED' && (hasUserReacted(blast, 'MINE') || hasUserReacted(blast, 'ON_IT')) && (
                  <button
                    onClick={() => handleMarkDone(blast.id)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    ✅ Mark Done
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Blast Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Ring Bell</h2>

            <form onSubmit={handleCreateBlast} className="space-y-6">
              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category (1-2 words)
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Event Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event (1-2 words)
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required
                >
                  {events.map((evt) => (
                    <option key={evt} value={evt}>
                      {evt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency
                </label>
                <select
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  {URGENCY_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Preview */}
              {previewMessage && (
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                  <p className="text-xs text-purple-600 font-semibold mb-1">PREVIEW</p>
                  <p className="text-sm font-medium text-gray-800">{previewMessage}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Send Blast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
