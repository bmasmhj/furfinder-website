const blockedHostnames = new Set(["localhost", "localhost.localdomain"])

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split(".").map(Number)
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false
  }

  return (
    parts[0] === 0 ||
    parts[0] === 10 ||
    parts[0] === 127 ||
    (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    (parts[0] === 198 && (parts[1] === 18 || parts[1] === 19)) ||
    parts[0] >= 224
  )
}

export function isSafeHttpsUrl(value: string) {
  try {
    const url = new URL(value.trim())
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "")

    if (url.protocol !== "https:" || url.username || url.password) {
      return false
    }

    if (
      !hostname ||
      blockedHostnames.has(hostname) ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname === "::1" ||
      hostname.startsWith("fc") ||
      hostname.startsWith("fd") ||
      hostname.startsWith("fe80:") ||
      isPrivateIpv4(hostname) ||
      (!hostname.includes(".") && !hostname.includes(":"))
    ) {
      return false
    }

    return true
  } catch {
    return false
  }
}
