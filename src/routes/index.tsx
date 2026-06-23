import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logoMark from "@/assets/logo-mark.png";
import logoHorizontal from "@/assets/logo-horizontal.png";
import logoWhite from "@/assets/logo-horizontal-white.png";
import { ArrowRight, Menu, X, Sparkles, Expand } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const TYPEFORM = "https://cluba.typeform.com/to/jU4Yh8ph";
const WHATSAPP_NUMBER = "5516997356613";

export const Route = createFileRoute("/")({ component: Landing });

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  art_url: string | null;
  whatsapp_message: string;
};

const sections = [
  { id: "proposito", label: "Propósito" },
  { id: "pilares", label: "Pilares" },
  { id: "para-quem", label: "Para quem é" },
  { id: "estrutura", label: "Estrutura" },
  { id: "eventos", label: "Próximos eventos", highlight: true },
];

function Landing() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .gte("event_date", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("event_date", { ascending: true })
      .then(({ data }) => setEvents((data as EventRow[]) ?? []));
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="absolute top-0 left-0 right-0 z-20">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <img src={logoHorizontal} alt="NutriMind Club" className="h-9 w-auto" />
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            className="p-2 -mr-2 text-foreground hover:text-primary transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Hamburger drawer */}
      {menuOpen && (
        <button
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 animate-in fade-in"
        />
      )}
      <aside
        className={`fixed top-0 right-0 z-40 h-full w-[85%] max-w-sm bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-border">
          <img src={logoHorizontal} alt="" className="h-7 w-auto" />
          <button onClick={() => setMenuOpen(false)} aria-label="Fechar"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex flex-col p-2">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`text-left px-4 py-4 rounded-md text-base hover:bg-muted transition-colors flex items-center justify-between ${s.highlight ? "text-primary font-medium" : ""}`}
            >
              <span>{s.label}</span>
              {s.highlight && <Sparkles className="h-4 w-4 text-primary animate-pulse" />}
            </button>
          ))}
          <div className="mt-2 mx-4 border-t border-border pt-4">
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block w-full text-center bg-primary text-primary-foreground px-4 py-3 rounded-md text-sm tracking-wider uppercase font-medium hover:opacity-90 transition-opacity"
            >
              Área de membros
            </Link>
          </div>
        </nav>
      </aside>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
        <div className="max-w-3xl text-center">
          <img src={logoMark} alt="" className="h-20 w-auto mx-auto mb-10 opacity-90" />
          <span className="eyebrow">NutriMind Club</span>
          <h1 className="font-serif text-5xl md:text-7xl mt-6 leading-[1.05] text-primary">
            Novo ciclo.<br />Nova era.<br />Novo modelo de educação.
          </h1>
          <p className="mt-8 text-lg text-muted-foreground max-w-xl mx-auto">
            Mentoria para nutricionistas que querem sair da consulta avulsa e construir
            autoridade, segurança e ofertas de alto valor.
          </p>
          <div className="mt-10">
            <a
              href={TYPEFORM}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-md text-sm tracking-wider uppercase font-medium hover:opacity-90 transition-opacity"
            >
              Se aplique aqui <ArrowRight className="h-4 w-4" />
            </a>
            <p className="mt-4 text-xs text-muted-foreground">Iremos avaliar seu perfil e entraremos em contato</p>
          </div>
        </div>
      </section>

      {/* PROPÓSITO */}
      <section id="proposito" className="py-28 px-6 border-t border-border scroll-mt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Nosso propósito</span>
          <p className="mt-6 font-serif text-3xl md:text-4xl leading-snug text-foreground">
            Preparar nutricionistas clínicas e mentoras para o próximo nível —
            <span className="text-primary"> crescimento, autoridade e ofertas de alto valor</span>.
          </p>
        </div>
      </section>

      {/* PILARES */}
      <section id="pilares" className="py-28 px-6 bg-secondary/40 scroll-mt-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="eyebrow">Proposta de valor</span>
            <h2 className="font-serif text-4xl md:text-5xl mt-4">Três pilares. Um modelo completo.</h2>
            <span className="gold-rule mt-6" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { n: "01", t: "Ciência", d: "Protocolos, genética, exames e curadoria científica. Técnica que sustenta confiança." },
              { n: "02", t: "Visão de Negócio", d: "Mentalidade, vendas, posicionamento e liderança. ROI como âncora de cada decisão." },
              { n: "03", t: "Construção de Produto", d: "Programas, mentorias e serviços que solucionam o problema do cliente — e não dependem da sua hora." },
            ].map((p) => (
              <div key={p.n} className="bg-card border border-border p-8 rounded-md">
                <span className="text-xs font-mono text-primary">PILAR {p.n}</span>
                <h3 className="font-serif text-3xl mt-3 text-primary">{p.t}</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUEM É */}
      <section id="para-quem" className="py-28 px-6 scroll-mt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Para quem é</span>
          <p className="mt-6 font-serif text-3xl md:text-4xl leading-snug">
            Nutricionistas com <span className="text-primary">ambição saudável</span>.
          </p>
          <p className="mt-4 text-muted-foreground text-lg">
            Não é para curiosos. É para quem sustenta o próximo nível.
          </p>
        </div>
      </section>

      {/* ESTRUTURA */}
      <section id="estrutura" className="py-28 px-6 bg-primary text-primary-foreground scroll-mt-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-[0.22em] font-medium opacity-80">Estrutura de entrega</span>
            <h2 className="font-serif text-4xl md:text-5xl mt-4">Um ecossistema, não um curso.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: "7", l: "encontros em grupo / mês" },
              { n: "12", l: "encontros individuais / ano" },
              { n: "2", l: "imersões presenciais / ano" },
              { n: "1", l: "evento online com convidado / mês" },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-serif text-6xl">{s.n}</p>
                <p className="mt-3 text-sm opacity-80 leading-tight">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRÓXIMOS EVENTOS */}
      <section id="eventos" className="relative py-28 px-6 scroll-mt-20 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background"
        />
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 eyebrow text-primary">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Agenda
              <Sparkles className="h-4 w-4 animate-pulse" />
            </span>
            <h2 className="font-serif text-4xl md:text-5xl mt-4 text-primary">
              Próximos eventos
            </h2>
            <span className="gold-rule mt-6" />
          </div>

          {events.length === 0 ? (
            <p className="text-center text-muted-foreground font-serif text-lg italic max-w-xl mx-auto">
              Nenhum evento programado no momento. Em breve, novidades para vocês!
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((ev, i) => {
                const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(ev.whatsapp_message)}`;
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
                            <button
                              type="button"
                              aria-label="Ampliar imagem"
                              className="group/img relative w-full h-full cursor-zoom-in"
                            >
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
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-md text-xs tracking-wider uppercase font-medium hover:opacity-90 transition-opacity"
                      >
                        Quero me inscrever <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-28 px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-4xl md:text-5xl mt-4">Pronto para o próximo nível?</h2>
          <p className="mt-6 text-muted-foreground">
            As vagas são limitadas. Aplicações analisadas individualmente.
          </p>
          <a
            href={TYPEFORM}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-md text-sm tracking-wider uppercase font-medium hover:opacity-90 transition-opacity"
          >
            Se aplique aqui <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <footer className="border-t border-border bg-primary py-12 px-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between flex-wrap gap-6">
          <img src={logoWhite} alt="NutriMind Club" className="h-7 w-auto" />
          <div className="flex gap-6 text-xs text-primary-foreground/70">
            <Link to="/login" className="hover:text-primary-foreground">Área de membros</Link>
            <span>© {new Date().getFullYear()} NutriMind Club</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
