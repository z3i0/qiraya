/**
 * Triggers a browser download for an audio URL using the /api/download route.
 * This guarantees proper attachment download headers, cross-origin compatibility,
 * and clean UTF-8 filenames across all browsers and devices.
 */
export function downloadAudio(url: string, filename: string): void {
  if (!url || typeof window === "undefined") return;

  const safeFilename = filename.endsWith(".mp3") ? filename : `${filename}.mp3`;
  const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(safeFilename)}`;

  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
