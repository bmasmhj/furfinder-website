
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { db } from "@/lib/db";
import { DownloadButton } from "@/components/marketing/MarketingPrimitives";
import { Badge } from "@/components/ui/badge";
import { 
    MapPin, 
    Calendar, 
    Tag, 
    Info, 
    Phone, 
    ArrowLeft, 
    ShieldCheck,
    PawPrint,
} from "lucide-react";
import { PetFlyerActions, PrintButton } from "@/components/app/PetFlyerActions";
import LeafletMap from "@/components/app/LeafletMap";
import Apple from "@/components/icons/Apple";
import PlayStore from "@/components/icons/PlayStore";



interface PetReport {
    id: string;
    status: string;
    pet_type: string;
    pet_name: string;
    breed: string;
    size: string;
    color: string;
    markings: string;
    photo_uri: string;
    description: string;
    latitude: number;
    longitude: number;
    location_name: string;
    last_seen_date: string;
    reward: string;
    contact_name: string;
    contact_phone: string;
    show_contact_public: boolean;
    created_at: Date;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const pet = await db.queryOne<PetReport>(
        "SELECT pet_name, status, pet_type FROM pet_reports WHERE id = $1",
        [id]
    );

    if (!pet) {
        return {
            title: "Pet Not Found - The Fur Finder",
        };
    }

    const isFound = pet.status.toLowerCase() === "found";
    const displayName = isFound ? `Found ${pet.pet_type}` : pet.pet_name;
    const title = `${pet.status.toUpperCase()}: ${displayName} - The Fur Finder`;
    const description = `Help us find ${displayName}, a ${pet.pet_type}. View details and report sightings.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
        },
    };
}

function maskPhoneNumber(phone: string) {
    if (!phone) return "";
    const cleaned = phone.trim();
    if (cleaned.length < 6) return cleaned;
    // Show first 6 characters and then XXXX
    return cleaned.slice(0, 6) + " XXXX";
}

export default async function PetIdPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const pet = await db.queryOne<PetReport>(
        "SELECT * FROM pet_reports WHERE id = $1",
        [id]
    );

    if (!pet) {
        notFound();
    }

    const isLost = pet.status.toLowerCase() === "lost";
    const isFound = pet.status.toLowerCase() === "found";
    const statusColor = isLost ? "destructive" : "secondary";
    
    // Found pets usually don't have names
    const displayName = isFound ? `Found ${pet.pet_type}` : pet.pet_name;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-16">
                
                {/* Navigation */}
                <div className="mb-6 flex items-center justify-between print:hidden md:mb-8">
                    <Link 
                        href="/pets" 
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
                    >
                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        Back to All Pets
                    </Link>
                    <PrintButton />
                </div>

                {/* Flyer Section */}
                <div id="flyer-content" className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl print:border-none print:shadow-none md:rounded-3xl">
                    <div className="grid md:grid-cols-2">
                        {/* Left Side: Image */}
                        <div className="relative aspect-square w-full bg-muted md:aspect-auto">
                            {pet.photo_uri ? (
                                <img
                                    src={pet.photo_uri}
                                    alt={displayName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-muted/50">
                                    <PawPrint size={80} className="text-muted-foreground/20 md:size-120" />
                                </div>
                            )}
                            <div className="absolute left-4 top-4 print:left-4 print:top-4 md:left-6 md:top-6">
                                <Badge variant={statusColor as any} className="px-4 py-1.5 text-sm font-black uppercase tracking-widest shadow-lg md:px-6 md:py-2 md:text-base">
                                    {pet.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Right Side: Details */}
                        <div className="flex flex-col p-6 md:p-12 print:p-6">
                            <div className="mb-6 md:mb-8">
                                <div className="mb-2 flex items-center gap-2 text-primary">
                                    <PawPrint size={20} />
                                    <span className="text-xs font-bold uppercase tracking-wider md:text-sm">{pet.pet_type} Report</span>
                                </div>
                                <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground md:text-6xl print:text-5xl">
                                    {displayName}
                                </h1>
                                {pet.reward && (
                                    <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-1.5 text-base font-black text-white shadow-lg md:mt-4 md:px-4 md:py-2 md:text-lg">
                                        REWARD: {pet.reward}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-6 md:space-y-8">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-4 md:gap-x-6 md:gap-y-6">
                                    <DetailItem icon={<Tag size={20} />} label="Breed" value={pet.breed || "Unknown"} />
                                    <DetailItem icon={<Info size={20} />} label="Color" value={pet.color} />
                                    <DetailItem icon={<MapPin size={20} />} label="Last Seen" value={pet.location_name} />
                                    <DetailItem icon={<Calendar size={20} />} label="Date Reported" value={pet.last_seen_date} />
                                </div>

                                {pet.markings && (
                                    <div className="border-t border-border pt-4 md:pt-6">
                                        <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">Distinctive Markings</p>
                                        <p className="font-semibold leading-relaxed text-foreground">{pet.markings}</p>
                                    </div>
                                )}

                                <div className="rounded-2xl bg-muted/40 p-4 md:p-6 print:bg-muted/10 print:p-4">
                                    <h3 className="mb-2 font-bold text-foreground">Description</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground md:text-[15px] print:text-foreground">
                                        {pet.description || "No additional description provided."}
                                    </p>
                                </div>

                                {pet.show_contact_public && (
                                    <div className="mt-4 flex items-center gap-4 rounded-2xl border-2 border-primary/20 bg-primary/5 p-4 md:p-6 print:border-primary print:bg-transparent">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-md md:h-14 md:w-14">
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <p className="mb-1 text-[11px] font-black uppercase tracking-widest text-primary">Contact Now</p>
                                            <p className="text-xl font-black text-foreground md:text-2xl">{maskPhoneNumber(pet.contact_phone)}</p>
                                            <p className="text-xs font-medium text-muted-foreground text-opacity-80 md:text-sm">Ask for {pet.contact_name}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-8 md:pt-12">
                                <PetFlyerActions petId={id} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-lg print:hidden md:mt-12 md:rounded-3xl">
                    <div className="flex items-center justify-between border-b border-border bg-muted/30 p-4 md:p-6">
                        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground md:text-xl">
                            <MapPin size={22} className="text-primary" />
                            Sighting Location
                        </h2>
                        <span className="text-xs font-medium text-muted-foreground md:text-sm">{pet.latitude.toFixed(4)}, {pet.longitude.toFixed(4)}</span>
                    </div>
                    <div className="relative aspect-video w-full bg-muted md:aspect-[21/9]">
                        <LeafletMap 
                            lat={pet.latitude} 
                            lng={pet.longitude} 
                            petName={displayName} 
                            petId={id} 
                        />
                    </div>
                </div>

                {/* Safety & App Section */}
                <div id="download-section" className="mt-8 grid gap-6 print:hidden md:mt-12 md:grid-cols-3 md:gap-8">
                    <div className="relative flex flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#ff8a6e] p-6 text-white shadow-xl md:col-span-2 md:rounded-3xl md:p-10">
                        <div className="relative z-10">
                            <h2 className="mb-3 text-2xl font-black leading-tight md:mb-4 md:text-4xl">Have you seen {displayName}?</h2>
                            <p className="mb-6 text-base opacity-90 md:mb-8 md:max-w-lg md:text-lg">
                                Download our app to report sightings, get instant proximity alerts, and help bring {displayName} home. Every second counts!
                            </p>
                            <div className="flex flex-wrap gap-3 md:gap-4">
                                <DownloadButton href="/download" variant="secondary">
                                      <Apple className="h-5 w-5" /> App Store
                                </DownloadButton>
                                <DownloadButton href="/download" variant="secondary">
                                        <PlayStore className="h-5 w-5" />
                                      Google Play
                                </DownloadButton>
                            </div>
                        </div>
                        <div className="absolute -right-20 -bottom-20 pointer-events-none opacity-10">
                            <PawPrint size={300} />
                        </div>
                    </div>

                    <div className="flex flex-col justify-center rounded-2xl border border-border bg-card p-6 shadow-sm md:rounded-3xl md:p-8">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 md:mb-6 md:h-14 md:w-14">
                            <ShieldCheck size={32} />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-foreground md:mb-3 md:text-xl">Safety First</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground text-opacity-80">
                            When reporting a sighting, keep your distance. Pets can be scared and unpredictable. Take a photo if possible and upload it through the app immediately.
                        </p>
                        <div className="mt-4 border-t border-border pt-4 md:mt-6 md:pt-6">
                            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Report ID</p>
                            <code className="rounded bg-muted px-2 py-1 text-[10px] text-foreground/70">{id}</code>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3 md:gap-4">
            <div className="mt-1 text-primary">
                {icon}
            </div>
            <div>
                <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/70 md:text-[11px]">{label}</p>
                <p className="text-sm font-bold leading-tight text-foreground md:text-base">{value}</p>
            </div>
        </div>
    );
}