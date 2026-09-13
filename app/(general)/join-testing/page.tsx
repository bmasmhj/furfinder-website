import type { Metadata } from "next";
import JoinTestingClient from "@/components/JoinTestingClient";

export const metadata: Metadata = {
  title: "Join Android Beta Testing | The Fur Finder",
  description:
    "Download The Fur Finder on iOS from the App Store or request access to the Android beta testing program.",
};

export default function JoinTestingPage() {
  return (
    <main className="min-h-screen bg-background">
      <JoinTestingClient />
    </main>
  );    
}
