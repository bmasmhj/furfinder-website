"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Mail, Smartphone, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Apple from "@/components/icons/Apple";
import PlayStore from "@/components/icons/PlayStore";
import { cn } from "@/lib/utils";
import { submitBetaRequest } from "@/app/actions/testing";
import { Loader2 } from "lucide-react";
import { downloadApp } from "@/lib/downloadHandler";
import Reveal from "@/components/marketing/Reveal";

type Platform = "android" | null;
const SUPPORT_EMAIL = "support@thefurfinder.com";

export default function JoinTestingClient() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const requestSectionRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (
      params.get("platform")?.toLowerCase() === "android" ||
      window.location.hash === "#android-beta-request"
    ) {
      setPlatform("android");
    }
  }, []);

  useEffect(() => {
    if (platform !== "android") return;

    const scrollTimer = window.setTimeout(() => {
      requestSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      emailInputRef.current?.focus({ preventScroll: true });
    }, 80);

    return () => window.clearTimeout(scrollTimer);
  }, [platform]);

  const handleSelectAndroid = () => {
    setPlatform("android");
    setSubmitted(false);
  };

  const handleSubmitAndroid = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitBetaRequest(normalizedEmail, "Android");
      if (result.success) {
        setSubmitted(true);
      } else {
        setSubmitError(result.error || "Something went wrong. Please try again.");
      }
    } catch {
      setSubmitError("Failed to submit request. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-5xl px-6 py-16 md:py-24">
      <svg aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[280px] w-full opacity-[0.5]" viewBox="0 0 1440 280" preserveAspectRatio="none">
        <path d="M-40 50 C 300 5, 600 95, 900 35 S 1500 55, 1600 15" stroke="hsl(var(--forest) / 0.08)" strokeWidth="1.5" fill="none" />
      </svg>

      <Reveal className="relative mx-auto mb-14 max-w-2xl text-center">
        <h1 className="font-display text-[40px] italic leading-[1.1] tracking-[-0.02em] text-forest max-md:text-[30px]">
          Help us build the <span className="text-coral-text not-italic">future of pet safety.</span>
        </h1>
        <p className="mt-4 font-body text-[16px] leading-relaxed text-forest/75">
          Download The Fur Finder on iPhone, or request Android beta testing access. Select your device below to get started.
        </p>
      </Reveal>

      <Reveal delay={80} className="relative mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
        {/* iOS App Store Card */}
        <a
          href={downloadApp("ios")}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center rounded-[20px] border-[1.5px] border-forest/15 bg-card p-8 text-center transition-colors hover:border-forest/35"
        >
          <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-[1.5px] border-forest/15 text-forest">
            <Apple className="h-7 w-7 fill-current" />
          </span>
          <h3 className="font-display text-[20px] italic text-forest">iOS App</h3>
          <p className="mt-1 font-body text-sm text-forest/70">Download from the App Store</p>
          <span className="mt-4 inline-flex items-center gap-2 font-body text-sm font-semibold text-forest">
            Open App Store
            <ArrowRight className="h-4 w-4" />
          </span>
        </a>

        {/* Android Selection Card */}
        <button
          onClick={handleSelectAndroid}
          aria-pressed={platform === "android"}
          className={cn(
            "group relative flex flex-col items-center rounded-[20px] border-[1.5px] p-8 text-center transition-colors",
            platform === "android" ? "border-amber bg-amber/10" : "border-forest/15 bg-card hover:border-forest/35"
          )}
        >
          <span
            className={cn(
              "mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-[1.5px] transition-colors",
              platform === "android" ? "border-amber bg-amber text-forest" : "border-forest/15 text-forest"
            )}
          >
            <PlayStore className="h-7 w-7 fill-current" />
          </span>
          <h3 className="font-display text-[20px] italic text-forest">Android Beta</h3>
          <p className="mt-1 font-body text-sm text-forest/70">Join our internal testing group</p>
          {platform === "android" && (
            <span className="absolute right-4 top-4 text-leaf-text">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          )}
        </button>
      </Reveal>

      {/* Dynamic Content Area */}
      <div ref={requestSectionRef} id="android-beta-request" className="relative mx-auto max-w-2xl scroll-mt-24">
        {platform === "android" && (
          <Card className="overflow-hidden rounded-[20px] border-[1.5px] border-forest/15 shadow-none">
            <div className="h-1.5 bg-amber" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-[19px] italic font-normal text-forest">
                <PlayStore className="h-5 w-5 fill-current text-forest" />
                Join Android Testing
              </CardTitle>
              <CardDescription className="font-body text-forest/70">
                Use the Google account email on your Android device. We&apos;ll send your access request to the team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!submitted ? (
                <form onSubmit={handleSubmitAndroid} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-body text-forest">Google Play Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/50" />
                      <Input
                        ref={emailInputRef}
                        id="email"
                        type="email"
                        placeholder="your.email@gmail.com"
                        className="h-12 rounded-xl pl-10"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (submitError) setSubmitError(null);
                        }}
                        autoComplete="email"
                        inputMode="email"
                        required
                      />
                    </div>
                    <p className="font-body text-xs text-forest/75">
                      This helps us add the correct Google account to the internal testing list.
                    </p>
                  </div>
                  {submitError && (
                    <div className="rounded-lg border-[1.5px] border-coral/30 bg-coral/10 px-3 py-2" role="alert">
                      <p className="font-body text-sm font-medium text-coral-text">{submitError}</p>
                      <p className="mt-1 font-body text-xs text-forest/70">
                        If this keeps happening, email{" "}
                        <a href={`mailto:${SUPPORT_EMAIL}`} className="underline underline-offset-2 hover:text-forest">
                          {SUPPORT_EMAIL}
                        </a>
                        .
                      </p>
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={isSubmitting || !email.trim()}
                    className="h-12 w-full rounded-xl bg-amber font-body text-lg font-semibold text-forest hover:bg-amber disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Request Access
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4 py-12 text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-leaf/40 bg-leaf/10 text-leaf-text">
                    <CheckCircle2 className="h-8 w-8" />
                  </span>
                  <h3 className="font-display text-[22px] italic text-forest">You&apos;re on the list!</h3>
                  <p className="mx-auto max-w-sm font-body text-sm text-forest/75">
                    We&apos;ve received your request for <strong className="text-forest">{email.trim().toLowerCase()}</strong>.
                    You&apos;ll get an email with testing steps once your account is added.
                  </p>
                  <Button variant="ghost" onClick={() => setSubmitted(false)} className="mt-4 font-body text-forest hover:text-coral-text">
                    Wait, I used the wrong email
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!platform && (
          <div className="rounded-[20px] border-[1.5px] border-dashed border-forest/15 p-12 text-center">
            <Smartphone className="mx-auto mb-4 h-10 w-10 text-forest/25" strokeWidth={1.5} />
            <p className="font-body italic text-forest/70">Select Android above to request beta testing access.</p>
          </div>
        )}
      </div>
    </div>
  );
}
