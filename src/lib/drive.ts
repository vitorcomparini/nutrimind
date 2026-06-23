// Helpers para Google Drive (link/ID).
export function extractDriveFileId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // ID puro (alfanumérico, _ ou -)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) return trimmed;
  // /file/d/{id}/...
  const m1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return m1[1];
  // ?id={id} ou &id={id}
  const m2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return m2[1];
  // /d/{id}
  const m3 = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m3) return m3[1];
  return null;
}
