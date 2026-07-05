import { useEffect, useRef, useState } from 'react';

let googleScriptPromise;

function loadGoogleScript() {
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
    document.head.appendChild(script);
  });
  return googleScriptPromise;
}

export default function GoogleSignInButton({ onCredential, text = 'continue_with' }) {
  const buttonRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    loadGoogleScript()
      .then((google) => {
        if (cancelled || !buttonRef.current) return;
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => onCredential(response.credential),
        });
        google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 360,
          text,
        });
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [clientId, onCredential, text]);

  if (!clientId || failed) return null;

  return <div ref={buttonRef} className="flex justify-center" />;
}
