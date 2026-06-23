import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  Clock,
  Target,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import logoMark from "@/assets/logo-mark.png";
import logoHorizontal from "@/assets/logo-horizontal.png";
import logoWhite from "@/assets/logo-horizontal-white.png";
import mentorsImg from "@/assets/workshop-mentors.jpg";
import thaisImg from "@/assets/mentor-thais.jpg";
import alexandraImg from "@/assets/mentor-alexandra.jpg";
import vitorImg from "@/assets/mentor-vitor.jpg";

const CHECKOUT = "https://www.asaas.com/c/9b0oyk3p2amhfxym";
const SITE = "https://nutrimindclub.com.br";

export const Route = createFileRoute("/workshop")({
  head: () => ({
    meta: [
      { title: "Workshop · A Nova Era da Prática Clínica — NutriMind Club" },
      {
        name: "description",
        content:
          "Workshop intensivo para nutricionistas e profissionais da saúde que querem construir autoridade, gerar recorrência e crescer de forma estruturada. 28 de Maio, 18h às 22h.",
      },
      {
        property: "og:title",
        content: "A Nova Era da Prática Clínica — Workshop NutriMind",
      },
      {
        property: "og:description",
        content:
          "4 horas de conteúdo prático para evoluir o modelo da sua clínica. 28 de Maio, 18h às 22h.",
      },
      { property: "og:type", content: "event" },
      { property: "og:url", content: `${SITE}/workshop` },
    ],
    links: [{ rel: "canonical", href: `${SITE}/workshop` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Event",
          name: "A Nova Era da Prática Clínica",
          startDate: "2026-05-28T18:00:00-03:00",
          endDate: "2026-05-28T22:00:00-03:00",
          eventAttendanceMode:
            "https://schema.org/OnlineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: {
            "@type": "VirtualLocation",
            url: `${SITE}/workshop`,
          },
          organizer: { "@type": "Organization", name: "NutriMind Club" },
          offers: {
            "@type": "Offer",
            url: CHECKOUT,
            availability: "https://schema.org/InStock",
          },
        }),
      },
    ],
  }),
  component: WorkshopPage,
});

function WorkshopPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Steps />
      <ForWhom />
      <NotForWhom />
      <Testimonials />
      <Mentors />
      <Faq />
      <FinalCta />
      <Footer />
    </div>
  );
}

/* ───────────────────────── header ───────────────────────── */
function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <Link to="/">
          <img
            src={logoHorizontal}
            alt="NutriMind Club"
            className="h-9 w-auto"
          />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.18em] text-foreground/80">
          <a href="#sobre" className="hover:text-primary transition-colors">
            Sobre
          </a>
          <a href="#para-quem" className="hover:text-primary transition-colors">
            Para quem
          </a>
          <a
            href="#depoimentos"
            className="hover:text-primary transition-colors"
          >
            Depoimentos
          </a>
          <a
            href={CHECKOUT}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity"
          >
            Inscreva-se
          </a>
        </nav>
      </div>
    </header>
  );
}

/* ───────────────────────── hero ───────────────────────── */
function Hero() {
  return (
    <section
      id="sobre"
      className="relative min-h-screen flex items-center px-6 pt-28 pb-16 overflow-hidden bg-primary text-primary-foreground"
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 30% 30%, oklch(0.55 0.13 32) 0%, transparent 60%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl grid md:grid-cols-2 gap-12 items-center">
        <div>
          <img
            src={logoMark}
            alt=""
            className="h-12 w-auto mb-8 opacity-90 invert"
          />
          <span className="text-xs uppercase tracking-[0.22em] opacity-80">
            Workshop online · ao vivo
          </span>
          <h1 className="font-serif text-5xl md:text-6xl mt-5 leading-[1.05]">
            A nova era da prática clínica já começou.
          </h1>
          <p className="mt-6 font-serif text-2xl md:text-3xl leading-snug opacity-90">
            Quem não evoluir no modelo, vai competir por preço.
          </p>
          <p className="mt-6 text-base md:text-lg opacity-80 max-w-xl leading-relaxed">
            Um workshop intensivo para nutricionistas e profissionais da saúde
            que atendem pacientes ou lideram clínicas e querem construir
            autoridade, gerar recorrência de pacientes e crescer de forma
            estruturada — sem perder a essência do cuidado.
          </p>

          <ul className="mt-8 space-y-3 text-sm md:text-base">
            <li className="flex items-center gap-3">
              <Calendar className="h-5 w-5 opacity-80" />
              <span>28 de Maio · 18h às 22h</span>
            </li>
            <li className="flex items-center gap-3">
              <Clock className="h-5 w-5 opacity-80" />
              <span>4 horas de conteúdo prático e aplicável</span>
            </li>
            <li className="flex items-center gap-3">
              <Target className="h-5 w-5 opacity-80" />
              <span>
                Para profissionais que decidiram evoluir o modelo da sua prática
                clínica
              </span>
            </li>
          </ul>

          <div className="mt-10">
            <a
              href={CHECKOUT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-background text-primary px-8 py-4 rounded-md text-sm tracking-wider uppercase font-medium hover:opacity-90 transition-opacity"
            >
              Quero participar <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-lg bg-primary-foreground/5 blur-2xl" />
          <img
            src={mentorsImg}
            alt="Mentores do workshop NutriMind Club"
            width={1024}
            height={1024}
            className="relative rounded-lg shadow-2xl object-cover w-full max-h-[560px]"
          />
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── 3 passos ───────────────────────── */
function Steps() {
  const steps = [
    {
      n: "01",
      t: "Mentalidade",
      d: "Antes de qualquer estratégia, existe um ponto de virada. Ao ajustar a mentalidade certa, o profissional clínico passa a enxergar oportunidades onde antes via limites, assume o protagonismo da própria carreira e rompe crenças que travam crescimento financeiro e reconhecimento profissional.",
    },
    {
      n: "02",
      t: "Estruturação de produtos",
      d: "O maior erro da clínica moderna é vender apenas consultas. Ao estruturar produtos de alto valor percebido, você deixa de trocar tempo por dinheiro, aumenta faturamento e conquista liberdade para cuidar melhor dos pacientes.",
    },
    {
      n: "03",
      t: "Crescimento exponencial",
      d: "Crescimento real não depende de sorte nem de redes sociais lotadas. Com um método claro, você passa a ser procurado pelos pacientes certos, constrói autoridade, sai da guerra de preços e cria demanda constante pelos seus serviços.",
    },
  ];

  return (
    <section className="py-28 px-6 border-t border-border">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="eyebrow">Passo a passo</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4">
            Os 3 passos que serão destravados no Workshop
          </h2>
          <span className="gold-rule mt-6" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div
              key={s.n}
              className="bg-card border border-border p-8 rounded-md"
            >
              <span className="text-xs font-mono text-primary">
                PASSO {s.n}
              </span>
              <h3 className="font-serif text-3xl mt-3 text-primary">{s.t}</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed text-sm">
                {s.d}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-14">
          <a
            href={CHECKOUT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-md text-sm tracking-wider uppercase font-medium hover:opacity-90 transition-opacity"
          >
            Quero participar <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── pra quem é ───────────────────────── */
function ForWhom() {
  const items = [
    {
      t: "Para quem quer parar de vender só consultas",
      d: "Você percebeu que agenda cheia não é sinônimo de crescimento. Este workshop é para quem quer sair do modelo de consulta avulsa, estruturar produtos de alto valor e crescer com mais previsibilidade e menos exaustão.",
    },
    {
      t: "Para quem quer crescer sem perder a essência",
      d: "Crescer não precisa significar atendimento impessoal. Para nutricionistas que querem faturar mais, ter mais tempo e elevar o nível do cuidado, sem transformar a clínica em uma linha de produção.",
    },
    {
      t: "Para quem busca autoridade, não volume",
      d: "Autoridade atrai pacientes certos. Alcance vazio não. Para quem entende que o futuro da nutrição passa por mentalidade, produtos bem estruturados e um método claro de crescimento exponencial.",
    },
    {
      t: "Para quem pensa no futuro da nutrição",
      d: "Ideal para quem quer ser procurado pelos pacientes ideais, sair da guerra de preços e construir posicionamento sólido — mesmo ainda não tendo grande alcance nas redes sociais.",
    },
  ];

  return (
    <section id="para-quem" className="py-28 px-6 bg-secondary/40">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="eyebrow">Pra quem é</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4 text-primary">
            Profissionais com ambição saudável
          </h2>
          <span className="gold-rule mt-6" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((i) => (
            <div
              key={i.t}
              className="bg-card border border-border rounded-md p-8 flex gap-4"
            >
              <Check className="h-6 w-6 shrink-0 text-success mt-1" />
              <div>
                <h3 className="font-serif text-xl text-primary">{i.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {i.d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── pra quem NÃO é ───────────────────────── */
function NotForWhom() {
  const items = [
    {
      t: "Para quem busca atalhos ou promessas fáceis",
      d: "Crescimento real exige responsabilidade. Se você espera promessas rápidas, scripts milagrosos ou ganhos sem mudança de postura, este workshop não é para você.",
    },
    {
      t: "Para quem acredita que vender é errado",
      d: "Valor também faz parte do cuidado. Se você acredita que estruturar produtos ou falar de dinheiro desvaloriza a clínica, este conteúdo provavelmente vai gerar desconforto.",
    },
    {
      t: "Para quem compete apenas por preço",
      d: "Preço baixo atrai o paciente errado. Este workshop não é para quem prefere disputar pacientes pela consulta mais barata, sem se posicionar ou gerar valor real.",
    },
    {
      t: "Para quem evita se posicionar",
      d: "Protagonismo é indispensável para crescer. Se você prefere se esconder atrás da técnica e evitar decisões estratégicas, este workshop não vai funcionar.",
    },
  ];
  return (
    <section className="py-28 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="eyebrow">Pra quem não é</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4">
            Honestidade antes da inscrição
          </h2>
          <span className="gold-rule mt-6" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((i) => (
            <div
              key={i.t}
              className="border border-border rounded-md p-8 flex gap-4 bg-card/50"
            >
              <X className="h-6 w-6 shrink-0 text-destructive mt-1" />
              <div>
                <h3 className="font-serif text-xl">{i.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {i.d}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-14">
          <a
            href={CHECKOUT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-md text-sm tracking-wider uppercase font-medium hover:opacity-90 transition-opacity"
          >
            Quero participar <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── depoimentos / resultados ───────────────────────── */
function Testimonials() {
  const stats = [
    { t: "Novos produtos", d: "Estruturados a partir do método" },
    { t: "Aumento do ticket", d: "Sem precisar atender mais pacientes" },
    { t: "Aumento do faturamento", d: "Com previsibilidade e clareza" },
    { t: "Crescimento constante", d: "Mês a mês, com método" },
  ];

  return (
    <section id="depoimentos" className="py-28 px-6 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.22em] opacity-80">
            Resultados
          </span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4">
            Já imaginou fazer, em uma venda, o que era seu faturamento mensal?
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-14">
          {stats.map((s) => (
            <div key={s.t}>
              <p className="font-serif text-2xl md:text-3xl">{s.t}</p>
              <p className="mt-3 text-sm opacity-80 leading-tight">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="max-w-3xl mx-auto text-center space-y-4 opacity-90">
          <p>
            Novas receitas vêm de novos produtos. Novos produtos trazem novos
            pacientes — e fidelizam os atuais.
          </p>
          <p>
            No Workshop você vai entender que é possível, sim, ser bem
            remunerado quando você decide entregar o seu melhor serviço.
          </p>
          <p>
            Conquiste segurança na hora de precificar seus serviços, com a
            estratégia correta.
          </p>
        </div>
        <div className="text-center mt-12">
          <a
            href={CHECKOUT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-background text-primary px-8 py-4 rounded-md text-sm tracking-wider uppercase font-medium hover:opacity-90 transition-opacity"
          >
            Quero participar <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── mentores ───────────────────────── */
function Mentors() {
  const mentors = [
    {
      first: "Thaís",
      last: "Cintas",
      photo: thaisImg,
      bio: "Nutricionista, mentora e empreendedora, com mais de 13 anos de experiência na área da saúde, unindo ciência, prática clínica e propósito. Atua como mentora de nutricionistas que desejam prosperar, crescer com estratégia e construir consultórios rentáveis, éticos e alinhados com seus valores.",
      quote:
        "Acredito que saúde começa dentro de casa e se sustenta em escolhas conscientes no dia a dia.",
    },
    {
      first: "Alexandra",
      last: "Casoni",
      photo: alexandraImg,
      bio: "Mãe, empresária, mentora, investidora e ex-CEO da Flormel, com mais de 22 anos de experiência em empreendedorismo. Liderou o reposicionamento da marca e a criação do bombom zero mais vendido do Brasil. Foi convidada shark nas 8ª e 9ª temporadas do Shark Tank Brasil.",
      quote:
        "A líder não espera por oportunidades, ela se prepara para elas.",
    },
    {
      first: "Vitor",
      last: "Comparini",
      photo: vitorImg,
      bio: "Farmacêutico clínico e empresário com mais de 20 anos de atuação no setor magistral. Homeopata e especialista em adequação nutricional. Hoje ajuda médicos e nutricionistas a ampliarem seus resultados por meio da prescrição personalizada estratégica.",
      quote:
        "Resultado é consequência de método aplicado com consistência.",
    },
  ];
  return (
    <section className="py-28 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="eyebrow">Mentores</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4">
            Quem irá te guiar nessa jornada
          </h2>
          <span className="gold-rule mt-6" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {mentors.map((m) => (
            <article
              key={m.last}
              className="bg-card border border-border rounded-md overflow-hidden"
            >
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={m.photo}
                  alt={`${m.first} ${m.last}`}
                  className="w-full h-full object-cover grayscale"
                  loading="lazy"
                />
              </div>
              <div className="p-8">
              <p className="font-serif text-3xl text-primary leading-tight">
                <span className="font-bold">{m.first}</span>
                <br />
                <span className="opacity-80">{m.last}</span>
              </p>
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
                {m.bio}
              </p>
              <p className="mt-5 text-sm italic text-foreground/80 border-l-2 border-primary pl-4">
                "{m.quote}"
              </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── faq ───────────────────────── */
function Faq() {
  const items = [
    {
      q: "Será ao vivo?",
      a: "Sim. O Workshop acontecerá ao vivo, online, no dia 28 de Maio, das 18h às 22h, através da plataforma Zoom.",
    },
    {
      q: "Como terei acesso ao Workshop?",
      a: "Você receberá o link da reunião algumas horas antes, através dos canais de comunicação fornecidos no ato da compra.",
    },
    {
      q: "Vai ficar gravado?",
      a: "Acreditamos que o melhor aprendizado acontece ao vivo, com conexão e interação. Mas, caso tenha conflito de agenda, abriremos acesso à gravação por um valor adicional. Fale com nossa equipe após a compra.",
    },
    {
      q: "Como compro o acesso?",
      a: "É só clicar em qualquer botão de inscrição desta página, seguir o processo de compra e aguardar nossas informações pelos canais de contato.",
    },
  ];
  return (
    <section className="py-28 px-6 bg-secondary/40">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-12">
          <span className="eyebrow">F.A.Q.</span>
          <h2 className="font-serif text-4xl md:text-5xl mt-4">
            Perguntas frequentes
          </h2>
        </div>
        <div className="space-y-3">
          {items.map((it, idx) => (
            <FaqItem key={idx} q={it.q} a={it.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        aria-expanded={open}
      >
        <span className="font-serif text-lg">{q}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── final cta ───────────────────────── */
function FinalCta() {
  return (
    <section className="py-28 px-6 text-center">
      <div className="mx-auto max-w-2xl">
        <span className="eyebrow">Última chamada</span>
        <h2 className="font-serif text-4xl md:text-5xl mt-4">
          Pronto para a nova era da clínica?
        </h2>
        <p className="mt-6 text-muted-foreground">
          As vagas são limitadas. Garanta a sua e participe ao vivo no dia 28 de
          Maio.
        </p>
        <a
          href={CHECKOUT}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-md text-sm tracking-wider uppercase font-medium hover:opacity-90 transition-opacity"
        >
          Quero participar <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

/* ───────────────────────── footer ───────────────────────── */
function Footer() {
  return (
    <footer className="border-t border-border bg-primary py-12 px-6">
      <div className="mx-auto max-w-6xl flex items-center justify-between flex-wrap gap-6">
        <img src={logoWhite} alt="NutriMind Club" className="h-7 w-auto" />
        <div className="flex gap-6 text-xs text-primary-foreground/70">
          <Link to="/" className="hover:text-primary-foreground">
            Página inicial
          </Link>
          <span>© {new Date().getFullYear()} NutriMind Club</span>
        </div>
      </div>
    </footer>
  );
}
