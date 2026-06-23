import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowRight, Expand, Sparkles } from "lucide-react";

const WHATSAPP_NUMBER = "5516999674045";
const WHATSAPP_MESSAGE = "Olá, quero confirmar minha presença em um evento";

export const Route = createFileRoute("/app/eventos")({
  component: MenteeEventsPage,
  head: () => ({ meta: [{ title: "Próximos eventos — NutriMind Club" }] }),
});

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  art_url: string | null;
  whatsapp_message: string;
};

function MenteeEventsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .gte("event_date", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("event_date", { ascending: true })
      .then(({ data }) => {
        setEvents((data as EventRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-medium text-primary">
          <Sparkles className="h-4 w-4 animate-pulse" /> Agenda
        </span>
        <h1 className="font-serif text-3xl md:text-4xl mt-3 text-primary">Próximos eventos</h1>
        <p className="text-muted-foreground mt-2">Confira os encontros e novidades programados para você.</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-muted-foreground font-serif text-lg italic max-w-xl mx-auto py-16">
          Nenhum evento programado no momento. Em breve, novidades para vocês!
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((ev, i) => {
            const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
            const dateLabel = new Date(ev.event_date).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });
            return (
              <div
                key={ev.id}
                className="group relative bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                style={{ animation: `fade-in 0.6s ease-out ${i * 0.1}s both` }}
              >
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative aspect-[4/5] bg-muted overflow-hidden flex items-center justify-center">
                  {ev.art_url ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" aria-label="Ampliar imagem" className="group/img relative w-full h-full cursor-zoom-in">
                          <img
                            src={ev.art_url}
                            alt={ev.title}
                            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                          <span className="absolute bottom-2 right-2 bg-background/80 backdrop-blur text-foreground rounded-full p-1.5 opacity-0 group-hover/img:opacity-100 group-hover:opacity-100 transition-opacity">
                            <Expand className="h-4 w-4" />
                          </span>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl p-2 bg-background">
                        <img src={ev.art_url} alt={ev.title} className="w-full h-auto max-h-[85vh] object-contain rounded" />
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Sem arte</div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wider text-primary font-medium">{dateLabel}</p>
                  <h3 className="font-serif text-xl mt-2 text-foreground">{ev.title}</h3>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    Você já está automaticamente inscrita neste evento por ser um membro NutriMind. Apenas confirme sua presença com nossa CX através do botão abaixo:
                  </p>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-md text-xs tracking-wider uppercase font-medium hover:opacity-90 transition-opacity"
                  >
                    Confirmar minha presença <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
