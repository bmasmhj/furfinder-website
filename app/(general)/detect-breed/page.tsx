import type { Metadata } from "next";
import { DetectBreedPanel } from "@/components/adoption/DetectBreedPanel";

export const metadata: Metadata = {
  title: "Detect My Pet's Breed - The Fur Finder",
  description:
    "Upload a photo of your dog or cat and let our AI identify the breed, along with temperament, care level, and health notes.",
};

export default function DetectBreedPage() {
  return <DetectBreedPanel />;
}
