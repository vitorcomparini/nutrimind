import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { extractDriveFileId } from "@/lib/drive";
import { Plus, Trash2, FolderPlus, ChevronDown, ChevronRight, Search, ArrowUp, ArrowDown, ImagePlus, Pencil } from "lucide-react";
import defaultThumb from "@/assets/lesson-thumb-default.png";

export const Route = createFileRoute("/admin/aulas")({ component: AulasPage });

type Track = { id: string; title: string; description: string | null; sort_order: number };
type Lesson = { id: string; title: string; description: string | null; drive_file_id: string; sort_order: number; track_id: string | null; thumbnail_url: string | null };

function AulasPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const filteredLessons = useMemo(
    () => (q ? lessons.filter((l) => l.title.toLowerCase().includes(q)) : lessons),
    [lessons, q],
  );
  const visibleTracks = useMemo(() => {
    if (!q) return tracks;
    const ids = new Set(filteredLessons.map((l) => l.track_id));
    return tracks.filter((t) => ids.has(t.id));
  }, [tracks, filteredLessons, q]);

  const [trackOpen, setTrackOpen] = useState(false);
  const [tTitle, setTTitle] = useState("");
  const [tDesc, setTDesc] = useState("");

  const [lessonOpen, setLessonOpen] = useState<string | null>(null); // track id
  const [lTitle, setLTitle] = useState("");
  const [lDesc, setLDesc] = useState("");
  const [lUrl, setLUrl] = useState("");
  const [lThumb, setLThumb] = useState<File | null>(null);
  const [lUploading, setLUploading] = useState(false);

  // Edição
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [eTitle, setETitle] = useState("");
  const [eDesc, setEDesc] = useState("");
  const [eUrl, setEUrl] = useState("");
  const [eChangeUrl, setEChangeUrl] = useState(false);
  const [eThumb, setEThumb] = useState<File | null>(null);
  const [eClearThumb, setEClearThumb] = useState(false);
  const [eSaving, setESaving] = useState(false);

  const openEdit = (l: Lesson) => {
    setEditing(l);
    setETitle(l.title);
    setEDesc(l.description ?? "");
    setEUrl("");
    setEChangeUrl(false);
    setEThumb(null);
    setEClearThumb(false);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setESaving(true);
    const patch: { title: string; description: string | null; drive_file_id?: string; thumbnail_url?: string | null } = {
      title: eTitle,
      description: eDesc || null,
    };
    if (eChangeUrl) {
      const fid = extractDriveFileId(eUrl);
      if (!fid) { setESaving(false); return toast.error("Link/ID do Google Drive inválido."); }
      patch.drive_file_id = fid;
    }
    if (eThumb) {
      const ext = eThumb.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${editing.track_id ?? "orphan"}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("lesson-thumbnails").upload(path, eThumb, { contentType: eThumb.type });
      if (up.error) { setESaving(false); return toast.error("Falha ao enviar imagem: " + up.error.message); }
      patch.thumbnail_url = supabase.storage.from("lesson-thumbnails").getPublicUrl(path).data.publicUrl;
    } else if (eClearThumb) {
      patch.thumbnail_url = null;
    }
    const { error } = await supabase.from("lessons").update(patch).eq("id", editing.id);
    setESaving(false);
    if (error) return toast.error(error.message);
    toast.success("Aula atualizada.");
    setEditing(null);
    load();
  };

  const load = async () => {
    const [{ data: t }, { data: l }] = await Promise.all([
      supabase.from("tracks").select("*").order("sort_order"),
      supabase.from("lessons").select("*").order("sort_order"),
    ]);
    setTracks((t as Track[]) ?? []);
    setLessons((l as Lesson[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const createTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("tracks").insert({
      title: tTitle, description: tDesc || null, sort_order: tracks.length,
    });
    if (error) return toast.error(error.message);
    toast.success("Trilha criada.");
    setTTitle(""); setTDesc(""); setTrackOpen(false);
    load();
  };

  const removeTrack = async (id: string) => {
    if (!confirm("Excluir trilha e todas as suas aulas?")) return;
    await supabase.from("tracks").delete().eq("id", id);
    load();
  };

  const moveTrack = async (id: string, dir: -1 | 1) => {
    const sorted = [...tracks].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((t) => t.id === id);
    const swap = idx + dir;
    if (idx < 0 || swap < 0 || swap >= sorted.length) return;
    const a = sorted[idx], b = sorted[swap];
    setTracks((prev) => prev.map((t) => t.id === a.id ? { ...t, sort_order: b.sort_order } : t.id === b.id ? { ...t, sort_order: a.sort_order } : t));
    const [r1, r2] = await Promise.all([
      supabase.from("tracks").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("tracks").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    if (r1.error || r2.error) {
      toast.error("Não foi possível reordenar.");
      load();
    }
  };

  const createLesson = async (e: React.FormEvent, trackId: string) => {
    e.preventDefault();
    const fid = extractDriveFileId(lUrl);
    if (!fid) return toast.error("Link/ID do Google Drive inválido.");
    const trackLessons = lessons.filter((x) => x.track_id === trackId);
    setLUploading(true);
    let thumbnail_url: string | null = null;
    if (lThumb) {
      const ext = lThumb.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${trackId}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("lesson-thumbnails").upload(path, lThumb, { contentType: lThumb.type });
      if (up.error) { setLUploading(false); return toast.error("Falha ao enviar imagem: " + up.error.message); }
      thumbnail_url = supabase.storage.from("lesson-thumbnails").getPublicUrl(path).data.publicUrl;
    }
    const { error } = await supabase.from("lessons").insert({
      title: lTitle, description: lDesc || null, drive_file_id: fid,
      sort_order: trackLessons.length, track_id: trackId, thumbnail_url,
    });
    setLUploading(false);
    if (error) return toast.error(error.message);
    toast.success("Aula adicionada.");
    setLTitle(""); setLDesc(""); setLUrl(""); setLThumb(null); setLessonOpen(null);
    load();
  };

  const removeLesson = async (id: string) => {
    if (!confirm("Excluir aula?")) return;
    await supabase.from("lessons").delete().eq("id", id);
    load();
  };

  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const orphan = filteredLessons.filter((l) => !l.track_id);

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <span className="eyebrow">Conteúdo</span>
          <h1 className="font-serif text-4xl mt-2 text-primary">Trilhas e aulas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Organize as aulas em trilhas. Os vídeos ficam no Google Drive (privados) — cole o link ao adicionar uma aula.
          </p>
        </div>
        <Dialog open={trackOpen} onOpenChange={setTrackOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><FolderPlus className="h-4 w-4 mr-1" /> Nova trilha</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova trilha</DialogTitle></DialogHeader>
            <form onSubmit={createTrack} className="space-y-4">
              <div>
                <Label>Título da trilha</Label>
                <Input required value={tTitle} onChange={(e) => setTTitle(e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label>Descrição (opcional)</Label>
                <Textarea value={tDesc} onChange={(e) => setTDesc(e.target.value)} className="mt-2" />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">Criar trilha</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar aulas pelo título..."
          className="pl-9"
        />
      </div>

      <div className="space-y-4">
        {visibleTracks.map((tr) => {
          const items = filteredLessons.filter((l) => l.track_id === tr.id);
          const isOpen = q ? true : (expanded[tr.id] ?? true);
          const allSorted = [...tracks].sort((a, b) => a.sort_order - b.sort_order);
          const pos = allSorted.findIndex((t) => t.id === tr.id);
          const canUp = !q && pos > 0;
          const canDown = !q && pos < allSorted.length - 1;
          return (
            <div key={tr.id} className="border border-border bg-card rounded-md">
              <div className="p-4 flex items-start justify-between gap-3">
                <button onClick={() => toggle(tr.id)} className="flex items-start gap-2 text-left min-w-0 flex-1">
                  {isOpen ? <ChevronDown className="h-5 w-5 mt-1 shrink-0" /> : <ChevronRight className="h-5 w-5 mt-1 shrink-0" />}
                  <div className="min-w-0">
                    <p className="font-serif text-xl text-primary">{tr.title}</p>
                    {tr.description && <p className="text-sm text-muted-foreground mt-1">{tr.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{items.length} aula(s)</p>
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveTrack(tr.id, -1)}
                    disabled={!canUp}
                    title="Mover para cima"
                    className="p-2 text-muted-foreground hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveTrack(tr.id, 1)}
                    disabled={!canDown}
                    title="Mover para baixo"
                    className="p-2 text-muted-foreground hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <Dialog open={lessonOpen === tr.id} onOpenChange={(o) => setLessonOpen(o ? tr.id : null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" /> Aula</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Nova aula em "{tr.title}"</DialogTitle></DialogHeader>
                      <form onSubmit={(e) => createLesson(e, tr.id)} className="space-y-4">
                        <div>
                          <Label>Título</Label>
                          <Input required value={lTitle} onChange={(e) => setLTitle(e.target.value)} className="mt-2" />
                        </div>
                        <div>
                          <Label>Descrição (opcional)</Label>
                          <Textarea value={lDesc} onChange={(e) => setLDesc(e.target.value)} className="mt-2" />
                        </div>
                        <div>
                          <Label>Link ou ID do Google Drive</Label>
                          <Input
                            required
                            value={lUrl}
                            onChange={(e) => setLUrl(e.target.value)}
                            placeholder="https://drive.google.com/file/d/.../view"
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            O arquivo deve estar na conta do Google Drive conectada e permanecer privado.
                          </p>
                        </div>
                        <div>
                          <Label>Imagem de capa (opcional)</Label>
                          <div className="mt-2 flex items-center gap-3">
                            <label className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md cursor-pointer hover:bg-muted text-sm">
                              <ImagePlus className="h-4 w-4" />
                              {lThumb ? "Trocar imagem" : "Escolher imagem"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setLThumb(e.target.files?.[0] ?? null)}
                              />
                            </label>
                            {lThumb && (
                              <span className="text-xs text-muted-foreground truncate max-w-[180px]">{lThumb.name}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Se não enviar, usaremos a logo padrão da NutriMind como capa.
                          </p>
                        </div>
                        <Button type="submit" disabled={lUploading} className="w-full bg-primary hover:bg-primary/90">
                          {lUploading ? "Enviando..." : "Adicionar"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <button onClick={() => removeTrack(tr.id)} className="text-destructive hover:opacity-70 p-2"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              {isOpen && (
                <div className="border-t border-border p-4">
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma aula nesta trilha.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((l) => (
                        <div key={l.id} className="border border-border rounded-md overflow-hidden">
                          <div className="w-full aspect-video bg-muted overflow-hidden">
                            <img src={l.thumbnail_url ?? defaultThumb} alt={l.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-3 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-serif truncate">{l.title}</p>
                              <p className="text-xs text-muted-foreground font-mono truncate">{l.drive_file_id}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => openEdit(l)} title="Editar" className="text-muted-foreground hover:text-primary p-1"><Pencil className="h-4 w-4" /></button>
                              <button onClick={() => removeLesson(l.id)} title="Excluir" className="text-destructive hover:opacity-70 p-1"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {tracks.length === 0 && (
          <p className="text-muted-foreground">Nenhuma trilha cadastrada. Crie a primeira trilha para começar.</p>
        )}

        {q && visibleTracks.length === 0 && orphan.length === 0 && tracks.length > 0 && (
          <p className="text-muted-foreground">Nenhuma aula encontrada para "{query}".</p>
        )}

        {orphan.length > 0 && (
          <div className="border border-dashed border-border rounded-md p-4">
            <p className="font-serif text-lg mb-2">Aulas sem trilha</p>
            <p className="text-xs text-muted-foreground mb-3">Aulas antigas cadastradas antes das trilhas. Exclua-as e recadastre dentro de uma trilha.</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orphan.map((l) => (
                <div key={l.id} className="border border-border rounded-md p-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-serif truncate">{l.title}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{l.drive_file_id}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(l)} title="Editar" className="text-muted-foreground hover:text-primary p-1"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => removeLesson(l.id)} title="Excluir" className="text-destructive hover:opacity-70 p-1"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar aula</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input required value={eTitle} onChange={(e) => setETitle(e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label>Descrição (opcional)</Label>
                <Textarea value={eDesc} onChange={(e) => setEDesc(e.target.value)} className="mt-2" />
              </div>

              <div>
                <Label>Link do Google Drive</Label>
                {!eChangeUrl ? (
                  <div className="mt-2 flex items-center justify-between gap-3 border border-border rounded-md p-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">ID atual</p>
                      <p className="text-sm font-mono truncate">{editing.drive_file_id}</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => setEChangeUrl(true)}>
                      Alterar link
                    </Button>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    <Input
                      autoFocus
                      value={eUrl}
                      onChange={(e) => setEUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/.../view"
                    />
                    <button
                      type="button"
                      onClick={() => { setEChangeUrl(false); setEUrl(""); }}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      Cancelar alteração do link
                    </button>
                  </div>
                )}
              </div>

              <div>
                <Label>Imagem de capa (opcional)</Label>
                <div className="mt-2 flex items-center gap-3 flex-wrap">
                  <div className="w-24 aspect-video bg-muted rounded overflow-hidden shrink-0">
                    <img
                      src={eThumb ? URL.createObjectURL(eThumb) : (eClearThumb ? defaultThumb : (editing.thumbnail_url ?? defaultThumb))}
                      alt="Prévia"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md cursor-pointer hover:bg-muted text-sm">
                    <ImagePlus className="h-4 w-4" />
                    {eThumb ? "Trocar imagem" : "Escolher imagem"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { setEThumb(e.target.files?.[0] ?? null); setEClearThumb(false); }}
                    />
                  </label>
                  {(editing.thumbnail_url || eThumb) && !eClearThumb && (
                    <button
                      type="button"
                      onClick={() => { setEThumb(null); setEClearThumb(true); }}
                      className="text-xs text-destructive hover:opacity-70"
                    >
                      Remover (usar logo padrão)
                    </button>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={eSaving} className="w-full bg-primary hover:bg-primary/90">
                {eSaving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
