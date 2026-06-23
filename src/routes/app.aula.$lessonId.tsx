import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedVideoPlayer } from "@/components/ProtectedVideoPlayer";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/app/aula/$lessonId")({ component: LessonPage });

type Lesson = { title: string; description: string | null };

function LessonPage() {
  const { lessonId } = Route.useParams();
  const [lesson, setLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    supabase.from("lessons").select("title, description").eq("id", lessonId).maybeSingle()
      .then(({ data }) => setLesson(data as Lesson | null));
  }, [lessonId]);

  if (!lesson) return <p className="text-muted-foreground">Carregando...</p>;
  return (
    <div className="space-y-6">
      <Link to="/app" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary text-sm">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <div>
        <h1 className="font-serif text-4xl text-primary">{lesson.title}</h1>
        {lesson.description && <p className="text-muted-foreground mt-2">{lesson.description}</p>}
      </div>
      <ProtectedVideoPlayer lessonId={lessonId} title={lesson.title} />
    </div>
  );
}
