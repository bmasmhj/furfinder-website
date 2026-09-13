"use client";

import { useEffect, useMemo, useState } from "react";
import { isPostRedirectUrl, submitPostRedirect } from "./postRedirect";

interface ExternalMatchRedirectProps {
  redirectUrl: string;
  delayMs: number;
}

export default function ExternalMatchRedirect({
  redirectUrl,
  delayMs,
}: ExternalMatchRedirectProps) {
  const totalSeconds = Math.ceil(delayMs / 1000);
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    const tickInterval = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    const redirectTimer = window.setTimeout(() => {
      if (isPostRedirectUrl(redirectUrl)) {
        submitPostRedirect(redirectUrl);
      } else {
        window.location.assign(redirectUrl);
      }
    }, delayMs);

    return () => {
      window.clearInterval(tickInterval);
      window.clearTimeout(redirectTimer);
    };
  }, [delayMs, redirectUrl]);

  const countdownText = useMemo(() => {
    if (secondsLeft <= 0) return "Redirecting now...";
    if (secondsLeft === 1) return "Redirecting in 1 second...";
    return `Redirecting in ${secondsLeft} seconds...`;
  }, [secondsLeft]);

  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <p className="text-sm font-medium text-foreground">{countdownText}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        If nothing happens, use the button below.
      </p>
    </div>
  );
}

