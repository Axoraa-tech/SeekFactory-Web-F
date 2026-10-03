"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";

/** The slice of Google Identity Services (accounts.google.com/gsi/client) used here. */
type GoogleIdentity = {
  accounts: {
    id: {
      initialize(config: {
        client_id: string;
        callback: (response: { credential?: string }) => void;
        ux_mode?: "popup" | "redirect";
        context?: "signin" | "signup" | "use";
      }): void;
      renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

interface GoogleSignInButtonProps {
  mode: "join" | "login";
  /** Receives the Google ID token once the user picks an account. */
  onCredential: (idToken: string) => void;
  /** Fired when Google returns without a token (popup closed is not reported by Google). */
  onError: () => void;
}

/**
 * Google's own "Continue with Google" button (Identity Services, popup mode).
 * The script loads only where this renders (buyer sign-in/join), keeping Google off pages China users see.
 */
export function GoogleSignInButton({ mode, onCredential, onError }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(() => typeof window !== "undefined" && Boolean(window.google));

  // Keep the latest handlers without re-initialising Google on every render
  const handlers = useRef({ onCredential, onError });
  handlers.current = { onCredential, onError };

  const render = useCallback(() => {
    const google = window.google;
    const container = containerRef.current;
    if (!google || !container) return;
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      ux_mode: "popup",
      context: mode === "join" ? "signup" : "signin",
      callback: (response) => {
        if (response.credential) handlers.current.onCredential(response.credential);
        else handlers.current.onError();
      },
    });
    google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "pill",
      text: mode === "join" ? "signup_with" : "continue_with",
      logo_alignment: "center",
      // Google caps the width at 400px
      width: Math.min(400, Math.max(200, container.offsetWidth)),
    });
  }, [mode]);

  useEffect(() => {
    if (ready) render();
  }, [ready, render]);

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setReady(true)} />
      <div ref={containerRef} className="flex h-10 w-full justify-center" />
    </>
  );
}
