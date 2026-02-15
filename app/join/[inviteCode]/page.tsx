'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PERSONA_LABELS } from '@/lib/templates';

export default function JoinPage({ params }: { params: Promise<{ inviteCode: string }> }) {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState<string>('');
  const [displayName, setDisplayName] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<string>('ghost');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    params.then((p) => {
      setInviteCode(p.inviteCode);

      // Check if already a member
      const existingMemberId = localStorage.getItem('ghostbell_memberId');
      const existingHouseholdId = localStorage.getItem('ghostbell_householdId');

      if (existingMemberId && existingHouseholdId) {
        router.push(`/h/${existingHouseholdId}`);
      }
    });
  }, [params, router]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/household/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode,
          displayName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join household');
      }

      const data = await response.json();

      // Store in localStorage
      localStorage.setItem('ghostbell_memberId', data.memberId);
      localStorage.setItem('ghostbell_householdId', data.householdId);
      localStorage.setItem('ghostbell_displayName', data.displayName);
      localStorage.setItem('ghostbell_persona', selectedPersona);

      // Redirect to household dashboard
      router.push(`/h/${data.householdId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">👻 GhostBell</h1>
            <p className="text-gray-600">Join your household</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label htmlFor="persona" className="block text-sm font-medium text-gray-700 mb-2">
                Choose Narrator (optional)
              </label>
              <select
                id="persona"
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              >
                {Object.entries(PERSONA_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                This determines how notifications are narrated
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !displayName}
              className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Joining...' : 'Join Household'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Invite code: <span className="font-mono font-semibold">{inviteCode}</span></p>
          </div>
        </div>
      </div>
    </main>
  );
}
