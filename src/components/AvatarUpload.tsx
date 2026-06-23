import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  userId: string;
  currentUrl: string | null;
  fullName: string;
  size?: number;
  onUploaded: (url: string) => void;
};

export function AvatarUpload({ userId, currentUrl, fullName, size = 96, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const initials = (fullName || "?").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Imagem deve ter até 3MB.");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
      cacheControl: "3600", upsert: true, contentType: file.type,
    });
    if (upErr) { setUploading(false); toast.error(upErr.message); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = data.publicUrl;
    const { error: updErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
    setUploading(false);
    if (updErr) { toast.error(updErr.message); return; }
    onUploaded(url);
    toast.success("Foto atualizada.");
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative rounded-full overflow-hidden bg-muted border-2 border-primary/20 flex items-center justify-center text-primary font-serif"
        style={{ width: size, height: size, fontSize: size / 3 }}
      >
        {currentUrl ? (
          <img src={currentUrl} alt={fullName} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
          {currentUrl ? "Trocar foto" : "Enviar foto"}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">JPG ou PNG, até 3MB.</p>
      </div>
    </div>
  );
}
