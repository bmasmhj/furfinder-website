const POST_REDIRECT_HOSTS = new Set(["cogc.cloud.inform.com"]);

export function isPostRedirectUrl(url: string): boolean {
  try {
    return POST_REDIRECT_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function submitPostRedirect(url: string): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  form.style.display = "none";
  document.body.appendChild(form);
  form.submit();
}
