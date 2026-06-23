import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { PlayCircle, Search } from "lucide-react";
import defaultThumb from "@/assets/lesson-thumb-default.png";

export const Route = createFileRoute("/app/aulas")({ component: StudentHome });

type Track = { id: string; title: string; description: string | null; sort_order: number };
type Lesson = { id: string; title: string; description: string | null; drive_file_id: string; created_at: string; track_id: string | null; sort_order: number; thumbnail_url: string | null };

function StudentHome() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const filteredLessons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lessons;
    return lessons.filter((l) => l.title.toLowerCase().includes(q));
  }, [lessons, query]);

  const visibleTracks = useMemo(() => {
    if (!query.trim()) return tracks;
    const ids = new Set(filteredLessons.map((l) => l.track_id));
    return tracks.filter((t) => ids.has(t.id));
  }, [tracks, filteredLessons, query]);

  useEffect(() => {
    Promise.all([
      supabase.from("tracks").select("*").order("sort_order"),
      supabase.from("lessons").select("*").order("sort_order"),
    ]).then(([t, l]) => {
      setTracks((t.data as Track[]) ?? []);
      setLessons((l.data as Lesson[]) ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <span className="eyebrow">Conteúdos</span>
        <h1 className="font-serif text-4xl md:text-5xl mt-3 text-primary">Sua central de aulas</h1>
        <span className="gold-rule mt-4" />
        <p className="text-muted-foreground mt-5 max-w-2xl">
          Acompanhe as trilhas da mentoria NutriMind. Escolha uma aula abaixo para começar.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquisar aulas pelo título..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando aulas...</p>
      ) : tracks.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-md">
          <p className="text-muted-foreground">Nenhuma trilha publicada ainda.</p>
        </div>
      ) : visibleTracks.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-md">
          <p className="text-muted-foreground">Nenhuma aula encontrada para "{query}".</p>
        </div>
      ) : (
        <div className="space-y-12">
          {visibleTracks.map((tr) => {
            const items = filteredLessons.filter((l) => l.track_id === tr.id);
            return (
              <section key={tr.id}>
                <div className="mb-5">
                  <h2 className="font-serif text-2xl text-primary">{tr.title}</h2>
                  {tr.description && <p className="text-muted-foreground mt-1 text-sm max-w-2xl">{tr.description}</p>}
                </div>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Em breve.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((l) => (
                      <Link
                        key={l.id}
                        to="/app/aula/$lessonId"
                        params={{ lessonId: l.id }}
                        className="group block rounded-md overflow-hidden border border-border bg-card hover:border-primary transition-colors"
                      >
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          <img src={l.thumbnail_url ?? defaultThumb} alt={l.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                            <PlayCircle className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("pt-BR")}</p>
                          <p className="mt-1 font-serif text-lg text-foreground group-hover:text-primary transition-colors">{l.title}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
