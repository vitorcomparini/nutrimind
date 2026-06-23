import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CalendarPlus, Trash2, Pencil, ImagePlus } from "lucide-react";

export const Route = createFileRoute("/admin/eventos")({ component: EventosPage });

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  art_url: string | null;
  whatsapp_message: string;
};

function fmtDateTimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function EventosPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [msg, setMsg] = useState("Olá, gostaria de saber mais sobre o evento ");
  const [art, setArt] = useState<File | null>(null);

  const reset = () => {
    setTitle(""); setDate("");
    setMsg("Olá, gostaria de saber mais sobre o evento ");
    setArt(null); setEditing(null);
  };

  const load = async () => {
    const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: true });
    if (error) return toast.error(error.message);
    setEvents((data as EventRow[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const startEdit = (ev: EventRow) => {
    setEditing(ev);
    setTitle(ev.title);
    setDate(fmtDateTimeLocal(ev.event_date));
    setMsg(ev.whatsapp_message);
    setArt(null);
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let art_url = editing?.art_url ?? null;
    if (art) {
      const ext = art.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("event-art").upload(path, art, { contentType: art.type, upsert: true });
      if (up.error) { setSaving(false); return toast.error("Falha ao enviar arte: " + up.error.message); }
      art_url = supabase.storage.from("event-art").getPublicUrl(path).data.publicUrl;
    }
    const payload = {
      title, event_date: new Date(date).toISOString(), whatsapp_message: msg, art_url,
    };
    const { error } = editing
      ? await supabase.from("events").update(payload).eq("id", editing.id)
      : await supabase.from("events").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Evento atualizado." : "Evento criado.");
    reset(); setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este evento?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <span className="eyebrow">Próximos eventos</span>
          <h1 className="font-serif text-4xl mt-2 text-primary">Eventos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie os eventos exibidos na página inicial do site.
          </p>
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><CalendarPlus className="h-4 w-4 mr-1" /> Novo evento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar evento" : "Novo evento"}</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label>Título do evento</Label>
                <Input required value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2" placeholder="Ex.: Workshop de Genética" />
              </div>
              <div>
                <Label>Data e hora</Label>
                <Input required type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label>Arte do evento {editing && "(opcional — manter atual)"}</Label>
                <div className="mt-2 flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-md cursor-pointer hover:bg-muted text-sm">
                    <ImagePlus className="h-4 w-4" />
                    {art ? "Trocar imagem" : "Escolher imagem"}
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => setArt(e.target.files?.[0] ?? null)} />
                  </label>
                  {art && <span className="text-xs text-muted-foreground truncate max-w-[180px]">{art.name}</span>}
                  {!art && editing?.art_url && <img src={editing.art_url} alt="" className="h-12 w-12 object-cover rounded" />}
                </div>
              </div>
              <div>
                <Label>Mensagem prévia do WhatsApp</Label>
                <Textarea required value={msg} onChange={(e) => setMsg(e.target.value)} className="mt-2" rows={3} />
                <p className="text-xs text-muted-foreground mt-1">Texto enviado ao clicar em "Quero me inscrever".</p>
              </div>
              <Button type="submit" disabled={saving} className="w-full bg-primary hover:bg-primary/90">
                {saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar evento"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {events.length === 0 && (
          <p className="text-muted-foreground">Nenhum evento cadastrado.</p>
        )}
        {events.map((ev) => (
          <div key={ev.id} className="border border-border bg-card rounded-md p-4 flex items-center gap-4">
            <div className="w-20 h-20 bg-muted rounded overflow-hidden shrink-0">
              {ev.art_url ? <img src={ev.art_url} alt={ev.title} className="w-full h-full object-cover" /> : null}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-lg text-primary truncate">{ev.title}</p>
              <p className="text-xs text-muted-foreground">{new Date(ev.event_date).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" })}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{ev.whatsapp_message}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => startEdit(ev)} title="Editar" className="text-muted-foreground hover:text-primary p-2"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(ev.id)} title="Excluir" className="text-destructive hover:opacity-70 p-2"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
