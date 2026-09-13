"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin, ExternalLink } from "lucide-react";

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface LeafletMapProps {
    lat: number;
    lng: number;
    petName: string;
    petId: string;
}

export default function LeafletMap({ lat, lng, petName, petId }: LeafletMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const openAppLocation = () => {
        const deepLink = `furfinder://map?lat=${lat}&lng=${lng}&petId=${petId}`;
        const downloadSection = document.getElementById("download-section");
        
        window.location.href = deepLink;
        
        setTimeout(() => {
            if (document.hasFocus()) {
                downloadSection?.scrollIntoView({ behavior: "smooth" });
            }
        }, 1500);
    };

    if (!isMounted) {
        return (
            <div className="flex h-full items-center justify-center bg-muted">
                <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            <MapContainer 
                center={[lat, lng]} 
                zoom={15} 
                scrollWheelZoom={false} 
                className="h-full w-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} icon={DefaultIcon}>
                    <Popup>
                        <div className="text-center p-1">
                            <p className="font-bold text-sm mb-1">{petName} last seen here</p>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>

            {/* Overlay button */}
            <div className="absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2">
                <button 
                    onClick={openAppLocation}
                    className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-xl transition hover:bg-[#e5553a] hover:scale-105 active:scale-95"
                >
                    <MapPin size={16} />
                    View Live Location in App
                    <ExternalLink size={14} className="opacity-70" />
                </button>
            </div>
        </div>
    );
}
