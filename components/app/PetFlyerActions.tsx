"use client";

import { Printer, Share2, Heart, ExternalLink, Download } from "lucide-react";
import { useState } from "react";

export function PetFlyerActions({ petId }: { petId: string }) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Error copying link:", err);
        }
    };

    const openApp = (path: string) => {
        const deepLink = `furfinder://${path}`;
        const downloadUrl = "/download";
        
        // Try to open deep link
        window.location.href = deepLink;
        
        // Fallback after a short delay
        setTimeout(() => {
            if (document.hasFocus()) {
                window.location.href = downloadUrl;
            }
        }, 2000);
    };

    return (
        <div className="flex flex-wrap gap-3 print:hidden">
            <button 
                onClick={() => openApp(`pets/${petId}`)}
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#e5553a] hover:shadow-primary/25"
            >
                <ExternalLink size={18} />
                View in App
            </button>
            
            <button 
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3.5 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
            >
                <Share2 size={18} />
                {copied ? "Link Copied!" : "Share Flyer"}
            </button>

            <button 
                onClick={() => openApp(`pets/${petId}`)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3.5 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
            >
                <Heart size={18} />
                Save for Later
            </button>
        </div>
    );
}

export function PrintButton() {
    return (
        <button 
            onClick={() => window.print()} 
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
            <Printer size={16} />
            Print Flyer
        </button>
    );
}
