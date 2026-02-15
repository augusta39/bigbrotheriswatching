'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PERSONA_LABELS } from '@/lib/templates';

export default function SettingsPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [persona, setPersona] = useState('ghost');
  const [noNamesMode, setNoNamesMode] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(5);
  const [householdId, setHouseholdId] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const storedDisplayName = localStorage.getItem('ghostbell_displayName') || '';
    const storedPersona = localStorage.getItem('ghostbell_persona') || 'ghost';
    const storedNoNamesMode = localStorage.getItem('ghostbell_noNamesMode') === 'true';
    const storedPollingInterval = parseInt(localStorage.getItem('ghostbell_pollingInterval') || '5');
    const storedHouseholdId = localStorage.getItem('ghostbell_householdId') || '';

    setDisplayName(storedDisplayName);
    setPersona(storedPersona);
    setNoNamesMode(storedNoNamesMode);
    setPollingInterval(storedPollingInterval);
    setHouseholdId(storedHouseholdId);

    // Fetch household info for invite code
    if (storedHouseholdId) {
      fetchHouseholdInfo(storedHouseholdId);
    }
  }, []);

  const fetchHouseholdInfo = async (hId: string) => {
    // For simplicity, we'll generate the QR link without fetching
    // In a full implementation, you'd fetch the invite code from the API
    setInviteCode('apt404'); // This should be fetched from API
  };

  const handleSave = () => {
    localStorage.setItem('ghostbell_displayName', displayName);
    localStorage.setItem('ghostbell_persona', persona);
    localStorage.setItem('ghostbell_noNamesMode', String(noNamesMode));
    localStorage.setItem('ghostbell_pollingInterval', String(pollingInterval));

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleBack = () => {
    if (householdId) {
      router.push(`/h/${householdId}`);
    } else {
      router.push('/');
    }
  };

  const handleViewQR = () => {
    if (inviteCode) {
      router.push(`/qr/${inviteCode}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            ←
          </button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              This is how you appear to your household
            </p>
          </div>

          {/* Narrator Persona */}
          <div>
            <label htmlFor="persona" className="block text-sm font-medium text-gray-700 mb-2">
              Narrator Persona
            </label>
            <select
              id="persona"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            >
              {Object.entries(PERSONA_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Changes how messages are narrated for you
            </p>
          </div>

          {/* No Names Mode */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="noNamesMode"
              checked={noNamesMode}
              onChange={(e) => setNoNamesMode(e.target.checked)}
              className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <div className="flex-1">
              <label htmlFor="noNamesMode" className="block text-sm font-medium text-gray-700">
                No Names Mode
              </label>
              <p className="text-xs text-gray-500 mt-1">
                When enabled, claimed blasts show "Claimed" without the person's name
              </p>
            </div>
          </div>

          {/* Polling Interval (Advanced) */}
          <div>
            <label htmlFor="pollingInterval" className="block text-sm font-medium text-gray-700 mb-2">
              Polling Interval (seconds)
            </label>
            <input
              type="number"
              id="pollingInterval"
              value={pollingInterval}
              onChange={(e) => setPollingInterval(parseInt(e.target.value) || 5)}
              min="1"
              max="60"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              How often to check for new blasts (1-60 seconds)
            </p>
          </div>

          {/* QR Code Link */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleViewQR}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>📱</span>
              View Household QR Code
            </button>
            <p className="mt-2 text-xs text-gray-500 text-center">
              Print and post this QR code around your home for easy access
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {saved ? '✓ Saved!' : 'Save Settings'}
          </button>
        </div>

        {/* Household Info */}
        <div className="mt-6 bg-white rounded-xl p-6 text-sm text-gray-600">
          <h2 className="font-semibold text-gray-900 mb-2">Household Info</h2>
          <p>Household ID: <span className="font-mono text-xs">{householdId}</span></p>
          {inviteCode && (
            <p>Invite Code: <span className="font-mono font-semibold text-purple-600">{inviteCode}</span></p>
          )}
        </div>
      </div>
    </main>
  );
}
