import type { Metadata } from "next";
import JoinTestingClient from "@/components/JoinTestingClient";

export const metadata: Metadata = {
  title: "Join Beta Testing | The Fur Finder",
  description:
    "Help us test The Fur Finder — Australia's AI-powered lost & found pet app. Join our iOS TestFlight or Android beta program.",
};

export default function JoinTestingPage() {
  return (
    <main className="min-h-screen bg-background">
      <JoinTestingClient />
    </main>
  );    
}
