import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1/";
const MAX_FILE_BYTES = 25 * 1024 * 1024;

export async function POST(request: NextRequest) {
  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const photo = incoming.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return NextResponse.json({ error: "A pet photo is required" }, { status: 400 });
  }
  if (photo.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "Photo is too large (max 25MB)" }, { status: 400 });
  }
  if (!photo.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are supported" }, { status: 400 });
  }

  const upstreamForm = new FormData();
  upstreamForm.append("photos", photo, photo.name || "pet-photo.jpg");

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(`${API_BASE_URL}ai/detect-breed-public`, {
      method: "POST",
      body: upstreamForm,
      signal: AbortSignal.timeout(30000),
    });
  } catch (error) {
    console.error("[AI detect-breed] upstream error", error);
    return NextResponse.json({ error: "Breed detection service is unavailable right now" }, { status: 502 });
  }

  const upstreamData = await upstreamRes.json().catch(() => null);

  if (!upstreamRes.ok) {
    const message =
      (upstreamData && typeof upstreamData === "object" && "message" in upstreamData
        ? String((upstreamData as { message?: unknown }).message)
        : null) || "Couldn't identify this pet, please try a clearer photo.";
    return NextResponse.json({ error: message }, { status: upstreamRes.status === 422 ? 422 : 502 });
  }

  return NextResponse.json(upstreamData?.data ?? upstreamData);
}
