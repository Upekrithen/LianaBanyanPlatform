import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

interface CoinInstance {
  id: number;
  x: number;
  y: number;
  amount: number;
}

let coinId = 0;
let globalListeners: Array<(x: number, y: number, amount: number) => void> = [];

export function triggerCoinFlip(x: number, y: number, amount = 1) {
  globalListeners.forEach((fn) => fn(x, y, amount));
}

const COIN_SOUND_KEY = 'xray_coin_sound';

export function getCoinSoundEnabled(): boolean {
  try {
    return localStorage.getItem(COIN_SOUND_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setCoinSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(COIN_SOUND_KEY, on ? 'true' : 'false');
  } catch {
    // noop
  }
}

function playCoinSound() {
  if (!getCoinSoundEnabled()) return;
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    // First blip — lower tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(987, now); // B5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.06);

    // Second blip — higher tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1319, now + 0.05); // E6
    gain2.gain.setValueAtTime(0.15, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.12);

    setTimeout(() => ctx.close(), 200);
  } catch {
    // Web Audio not supported
  }
}

const CoinSprite: React.FC<{ coin: CoinInstance; onDone: (id: number) => void }> = ({
  coin,
  onDone,
}) => {
  useEffect(() => {
    const t = setTimeout(() => onDone(coin.id), 850);
    return () => clearTimeout(t);
  }, [coin.id, onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        left: coin.x - 16,
        top: coin.y,
        zIndex: 99999,
        pointerEvents: 'none',
        animation: 'xray-coin-rise 0.8s ease-out forwards',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)',
            border: '2px solid #92400e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: 14,
            color: '#78350f',
            animation: 'xray-coin-spin 0.8s linear forwards',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.5)',
          }}
        >
          M
        </div>
        <span
          style={{
            fontWeight: 800,
            fontSize: 13,
            color: '#fbbf24',
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            whiteSpace: 'nowrap',
          }}
        >
          +{coin.amount}M
        </span>
      </div>
    </div>
  );
};

export const CoinFlipAnimation: React.FC = () => {
  const [coins, setCoins] = useState<CoinInstance[]>([]);
  const styleRef = useRef(false);

  useEffect(() => {
    if (!styleRef.current) {
      styleRef.current = true;
      const style = document.createElement('style');
      style.textContent = `
        @keyframes xray-coin-rise {
          0%   { opacity: 1; transform: translateY(0); }
          70%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-60px); }
        }
        @keyframes xray-coin-spin {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(720deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const handleTrigger = useCallback((x: number, y: number, amount: number) => {
    playCoinSound();
    const id = ++coinId;
    setCoins((prev) => [...prev, { id, x, y, amount }]);
  }, []);

  useEffect(() => {
    globalListeners.push(handleTrigger);
    return () => {
      globalListeners = globalListeners.filter((fn) => fn !== handleTrigger);
    };
  }, [handleTrigger]);

  const removeCoin = useCallback((id: number) => {
    setCoins((prev) => prev.filter((c) => c.id !== id));
  }, []);

  if (coins.length === 0) return null;

  return createPortal(
    <>
      {coins.map((coin) => (
        <CoinSprite key={coin.id} coin={coin} onDone={removeCoin} />
      ))}
    </>,
    document.body,
  );
};
