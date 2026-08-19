import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import client from '../api/client.js';
import { ErrorBanner } from '../components/Common.jsx';

const SCANNER_ID = 'qr-scanner-region';

export default function Scan() {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [manualTag, setManualTag] = useState('');
  const [lookingUp, setLookingUp] = useState(false);

  const lookupTag = async (rawValue) => {
    setLookingUp(true);
    setError('');
    try {
      // The QR payload is JSON like {"assetTag":"AST-000001","id":"..."} but we
      // also accept a bare tag typed in manually, so try to parse first.
      let tag = rawValue.trim();
      try {
        const parsed = JSON.parse(rawValue);
        if (parsed.assetTag) tag = parsed.assetTag;
      } catch {
        // not JSON, treat as a plain tag string
      }
      const { data } = await client.get(`/assets/tag/${encodeURIComponent(tag)}`);
      navigate(`/assets/${data.asset._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'No asset found for that code');
    } finally {
      setLookingUp(false);
    }
  };

  useEffect(() => {
    const instance = new Html5Qrcode(SCANNER_ID);
    scannerRef.current = instance;

    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startScan = async () => {
    setError('');
    try {
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          scannerRef.current.stop().then(() => setScanning(false));
          lookupTag(decodedText);
        },
        () => {} // ignore per-frame scan failures
      );
      setScanning(true);
    } catch (err) {
      setError('Could not access camera. Check browser permissions, or enter the tag manually below.');
    }
  };

  const stopScan = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* already stopped */ }
    }
    setScanning(false);
  };

  return (
    <div className="max-w-md">
      <h1 className="stencil text-2xl font-bold text-zinc-50 mb-1">Scan Asset Tag</h1>
      <p className="text-sm text-muted mb-6">Point your camera at a QR tag, or type it in manually.</p>

      <ErrorBanner message={error} />

      <div className="card p-6 mb-6">
        <div id={SCANNER_ID} className="w-full aspect-square bg-panel2 rounded-sm overflow-hidden border border-line" />
        <div className="mt-4">
          {!scanning ? (
            <button className="btn-primary w-full" onClick={startScan} disabled={lookingUp}>
              {lookingUp ? 'Looking up…' : 'Start Camera'}
            </button>
          ) : (
            <button className="btn-outline w-full" onClick={stopScan}>Stop Camera</button>
          )}
        </div>
      </div>

      <div className="card p-6">
        <label className="label">Enter Tag Manually</label>
        <div className="flex gap-3">
          <input
            className="input"
            placeholder="AST-000001"
            value={manualTag}
            onChange={(e) => setManualTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && manualTag && lookupTag(manualTag)}
          />
          <button className="btn-outline shrink-0" disabled={!manualTag || lookingUp} onClick={() => lookupTag(manualTag)}>
            Go
          </button>
        </div>
      </div>
    </div>
  );
}
