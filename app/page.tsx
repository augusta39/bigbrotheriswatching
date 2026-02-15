'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    // Bell page handles auto-join, so no redirect needed
  }, [router]);

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      router.push(`/join/${inviteCode.trim()}`);
    }
  };

  const handleTryDemo = () => {
    // Redirect to demo household bell page
    // In production, this would be the householdId from the seeded data
    router.push('/bell/demo');
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">👁️ BigBrotherIsWatching</h1>
          <p className="text-sm text-gray-500">
            One QR code • No names • Just get it done
          </p>
        </div>

        <div className="space-y-6">
          {/* Join with Code */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Join a Household</h2>
            <form onSubmit={handleJoinWithCode} className="space-y-4">
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter invite code
                </label>
                <input
                  type="text"
                  id="inviteCode"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="e.g., apt404"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={!inviteCode.trim()}
                className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Join Household
              </button>
            </form>
          </div>

          {/* Demo Household */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-4">Try the Demo</h2>
            <p className="text-sm text-gray-600 mb-4">
              Experience anonymous notifications
            </p>
            <button
              onClick={handleTryDemo}
              className="w-full bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors"
            >
              Try Demo
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              No signup needed • Fully anonymous
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">How it works</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="bg-white/60 backdrop-blur rounded-lg p-4">
              <div className="text-2xl mb-2">📱</div>
              <p>Scan one QR code anywhere in your home</p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-lg p-4">
              <div className="text-2xl mb-2">🔔</div>
              <p>Ring the bell for dryer, sink, trash, etc</p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-lg p-4">
              <div className="text-2xl mb-2">👤</div>
              <p>Completely anonymous - no names shown</p>
            </div>
            <div className="bg-white/60 backdrop-blur rounded-lg p-4">
              <div className="text-2xl mb-2">✅</div>
              <p>React and mark done - no confrontation</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
