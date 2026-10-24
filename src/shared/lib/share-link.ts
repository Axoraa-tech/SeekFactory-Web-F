/** Native sharing and the existing clipboard fallback. Cancellation is not a share. */
export async function shareLink(title: string, url: string): Promise<void> {
  if (navigator.share) await navigator.share({ title, url });
  else await navigator.clipboard.writeText(url);
}
