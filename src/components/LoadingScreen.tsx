import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const statusMessages = [
    'Initializing secure connection...',
    'Verifying credentials...',
    'Loading encrypted files...',
    'Finalizing setup...',
  ];

  useEffect(() => {
    const startTime = Date.now();
    let animId: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = (elapsed / 5000) * 100;
      let calculatedProgress: number;

      if (pct < 90) {
        const jitter = Math.sin(elapsed / 500) * 2;
        calculatedProgress = Math.min(pct + jitter, 89);
      } else if (pct >= 90 && pct < 100) {
        calculatedProgress = 90 + ((pct - 90) / 10) * 9.9;
      } else {
        calculatedProgress = 100;
      }

      const floored = Math.floor(Math.min(calculatedProgress, 100));
      setProgress(floored);

      const msgIndex = Math.floor((floored / 100) * statusMessages.length);
      setStatusIndex(Math.min(msgIndex, statusMessages.length - 1));

      if (floored < 100) {
        animId = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    };

    animId = requestAnimationFrame(tick);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [onComplete]);

  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-progress-container">
          <div className="loading-progress-bar">
            <div
              className="loading-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="loading-progress-text">{progress}%</span>
        </div>
        <p className="loading-status">{statusMessages[statusIndex]}</p>
      </div>
    </div>
  );
};
