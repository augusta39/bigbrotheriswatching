'use client';

import { useEffect, useState, useRef, use } from 'react';
import QRCode from 'qrcode';

export default function QRCodePage({ params }: { params: Promise<{ inviteCode: string }> }) {
  const resolvedParams = use(params);
  const householdId = resolvedParams.inviteCode; // Can be householdId or inviteCode
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return;

      try {
        // Generate bell URL - this is the single QR code for the household
        const bellUrl = `${window.location.origin}/bell/${householdId}`;

        // Generate QR code
        await QRCode.toCanvas(canvasRef.current, bellUrl, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
      }
    };

    generateQR();
  }, [householdId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 inline-block">
          <h1 className="text-3xl font-bold mb-4">👁️ BigBrotherIsWatching</h1>
          <p className="text-xl text-gray-700 mb-8">Scan me to ring the bell</p>

          {error ? (
            <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="flex justify-center mb-6">
              <canvas ref={canvasRef} className="border-4 border-purple-200 rounded-lg" />
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-gray-600 font-semibold">
              One QR for your whole household
            </p>
            <p className="text-xs text-gray-500">
              Or visit: {typeof window !== 'undefined' && `${window.location.origin}/bell/${householdId}`}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Print and post this anywhere in your home
            </p>
          </div>

          <div className="mt-8 print:hidden">
            <button
              onClick={handlePrint}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              🖨️ Print QR Code
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
