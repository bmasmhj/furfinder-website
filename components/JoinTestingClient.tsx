"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, Download, Mail, Smartphone, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Apple from "@/components/icons/Apple";
import PlayStore from "@/components/icons/PlayStore";
import { cn } from "@/lib/utils";
import { submitBetaRequest } from "@/app/actions/testing";
import { Loader2 } from "lucide-react";

type Platform = "ios" | "android" | null;

export default function JoinTestingClient() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitAndroid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await submitBetaRequest(email, "Android");
      if (result.success) {
        setSubmitted(true);
      } else {
        setSubmitError(result.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setSubmitError("Failed to submit request. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container relative mx-auto px-4 py-16 md:py-24">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 bg-primary/20 blur-[120px] rounded-full" />

      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          Help us build the <span className="text-primary">future</span> of pet safety
        </h1>
        <p className="text-xl text-muted-foreground">
          Join our beta testing program and be the first to experience the new Fur Finder. 
          Select your platform below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
        {/* iOS Selection Card */}
        <button
          onClick={() => { setPlatform("ios"); setSubmitted(false); }}
          className={cn(
            "group relative flex flex-col items-center p-8 rounded-3xl border-2 transition-all duration-300 text-left hover:scale-[1.02]",
            platform === "ios" 
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
              : "border-border bg-card/50 backdrop-blur-sm hover:border-primary/50"
          )}
        >
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300",
            platform === "ios" ? "bg-primary text-white" : "bg-muted group-hover:bg-primary/20"
          )}>
            <Apple className={cn("w-8 h-8", platform === "ios" ? "fill-white" : "fill-foreground group-hover:fill-primary")} />
          </div>
          <h3 className="text-2xl font-semibold mb-2">iOS Beta</h3>
          <p className="text-muted-foreground text-center">Available via Apple TestFlight</p>
          {platform === "ios" && (
            <div className="absolute top-4 right-4 text-primary">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          )}
        </button>

        {/* Android Selection Card */}
        <button
          onClick={() => { setPlatform("android"); setSubmitted(false); }}
          className={cn(
            "group relative flex flex-col items-center p-8 rounded-3xl border-2 transition-all duration-300 text-left hover:scale-[1.02]",
            platform === "android" 
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
              : "border-border bg-card/50 backdrop-blur-sm hover:border-primary/50"
          )}
        >
          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300",
            platform === "android" ? "bg-primary text-white" : "bg-muted group-hover:bg-primary/20"
          )}>
            <PlayStore className={cn("w-8 h-8", platform === "android" ? "fill-white" : "fill-foreground group-hover:fill-primary")} />
          </div>
          <h3 className="text-2xl font-semibold mb-2">Android Beta</h3>
          <p className="text-muted-foreground text-center">Join our internal testing group</p>
          {platform === "android" && (
            <div className="absolute top-4 right-4 text-primary">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          )}
        </button>
      </div>

      {/* Dynamic Content Area */}
      <div className="max-w-2xl mx-auto">
        {platform === "ios" && (
          <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-md overflow-hidden">
            <div className="h-2 bg-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                iOS Installation Steps
              </CardTitle>
              <CardDescription>Follow these steps to get the app on your iPhone.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-none w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">1</div>
                  <div className="space-y-1">
                    <p className="font-semibold text-lg">Install TestFlight</p>
                    <p className="text-muted-foreground text-sm">Download the TestFlight app from the App Store if you haven't already.</p>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <a href="https://apps.apple.com/app/testflight/id899247664" target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Download TestFlight
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-none w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">2</div>
                  <div className="space-y-1">
                    <p className="font-semibold text-lg">Join the Beta</p>
                    <p className="text-muted-foreground text-sm">Click the invite link below to join The Fur Finder testing group.</p>
                    <Button className="mt-2 bg-primary hover:bg-primary/90 text-white" asChild>
                      <a href="https://testflight.apple.com/join/hxx4NTgp" target="_blank" rel="noopener noreferrer">
                        Join Beta Group
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-none w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">3</div>
                  <div className="space-y-1">
                    <p className="font-semibold text-lg">Redeem Code (Optional)</p>
                    <p className="text-muted-foreground text-sm">If you were given a code, open TestFlight and tap "Redeem" at the top right.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {platform === "android" && (
          <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-md overflow-hidden">
            <div className="h-2 bg-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayStore className="w-5 h-5 text-primary" />
                Join Android Testing
              </CardTitle>
              <CardDescription>Enter your email associated with your Google Play account to receive an invite.</CardDescription>
            </CardHeader>
            <CardContent>
              {!submitted ? (
                <form onSubmit={handleSubmitAndroid} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Google Play Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your.email@gmail.com" 
                        className="pl-10 h-12 rounded-xl"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {submitError && (
                    <p className="text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                      {submitError}
                    </p>
                  )}
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-lg shadow-lg shadow-primary/20 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2 fill-white" />
                        Request Access
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="py-12 text-center space-y-4">
                  <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold">You're on the list!</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    We've received your request. You'll receive an email with instructions once you're added to the testing group.
                  </p>
                  <Button variant="ghost" onClick={() => setSubmitted(false)} className="mt-4">
                    Wait, I used the wrong email
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {!platform && (
          <div className="text-center p-12 border-2 border-dashed border-border rounded-3xl bg-card/30 backdrop-blur-sm">
            <Smartphone className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground italic">Please select your device platform above to see instructions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
