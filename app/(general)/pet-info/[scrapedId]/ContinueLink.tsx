"use client";

import { ExternalLink } from "lucide-react";
import { isPostRedirectUrl, submitPostRedirect } from "./postRedirect";

interface ContinueLinkProps {
  url: string;
  label: string;
  className: string;
}

export default function ContinueLink({ url, label, className }: ContinueLinkProps) {
  if (isPostRedirectUrl(url)) {
    return (
      <button type="button" onClick={() => submitPostRedirect(url)} className={className}>
        {label}
        <ExternalLink size={16} />
      </button>
    );
  }

  return (
    <a href={url} rel="noopener noreferrer" className={className}>
      {label}
      <ExternalLink size={16} />
    </a>
  );
}
