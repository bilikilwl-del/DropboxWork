import React, { useEffect, useState } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { MainApp } from './components/MainApp';

const VALID_SLUG_KEY = 'valid_slug';
const SESSION_VALID_KEY = 'session_valid';

function generateSlug(length = 12): string {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * 64));
  }
  return result;
}

function isValidSlug(str: string | null): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^[A-Za-z0-9-_]+$/.test(str);
}

function getSlugFromPath(): string | null {
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts.length > 0) {
    const last = parts[parts.length - 1];
    return isValidSlug(last) ? last : null;
  }
  return null;
}

export default function App() {
  const [slug, setSlug] = useState<string | null>(() => getSlugFromPath());
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    document.title = 'My Shared Files';
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setSlug(getSlugFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!slug) {
      setHasValidSession(false);
      return;
    }

    const storedSlug = sessionStorage.getItem(VALID_SLUG_KEY);
    const sessionValid = sessionStorage.getItem(SESSION_VALID_KEY);

    if (storedSlug && storedSlug === slug && isValidSlug(slug)) {
      if (sessionValid === 'true') {
        sessionStorage.setItem(SESSION_VALID_KEY, 'false');
      }
      setHasValidSession(true);
    } else {
      // If navigating directly or session expired, redirect to root with search params to run loader
      setHasValidSession(false);
      const search = window.location.search;
      window.history.replaceState(null, '', `/${search}`);
      setSlug(null);
    }
  }, [slug]);

  const handleLoadingComplete = () => {
    const newSlug = generateSlug(Math.floor(Math.random() * 3) + 8);
    sessionStorage.setItem(VALID_SLUG_KEY, newSlug);
    sessionStorage.setItem(SESSION_VALID_KEY, 'true');

    const search = window.location.search;
    window.history.replaceState(null, '', `/${newSlug}${search}`);
    setSlug(newSlug);
    setHasValidSession(true);
  };

  // If no slug or invalid session, show the initial loading progress screen
  if (!slug || !hasValidSession) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return <MainApp />;
}
