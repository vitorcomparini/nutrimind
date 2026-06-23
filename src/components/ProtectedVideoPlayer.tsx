import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getLessonStreamToken } from "@/lib/lesson.functions";

type Props = { lessonId: string; title?: string; className?: string };

export function ProtectedVideoPlayer({ lessonId, title, className }: Props) {
  const fetchToken = useServerFn(getLessonStreamToken);
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setSrc(null);
    setError(null);
    fetchToken({ data: { lessonId } })
      .then((res) => { if (alive) setSrc(res.url); })
      .catch((e) => { if (alive) setError(e?.message ?? "Erro ao carregar vídeo"); });
    return () => { alive = false; };
  }, [lessonId, fetchToken]);

  return (
    <div
      className={`relative w-full aspect-video bg-black rounded-md overflow-hidden ${className ?? ""}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-destructive text-sm p-4 text-center">
          {error}
        </div>
      ) : !src ? (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
          Carregando vídeo...
        </div>
      ) : (
        <video
          src={src}
          title={title ?? "Aula"}
          className="absolute inset-0 w-full h-full"
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          playsInline
          preload="metadata"
        />
      )}
    </div>
  );
}
