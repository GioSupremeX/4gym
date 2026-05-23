import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Comment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Flag, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { CaptchaField } from "@/components/Captcha";

export function CommentSection({ articleId, commentsEnabled }: { articleId: number; commentsEnabled: boolean | string }) {
  const { toast } = useToast();
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);
  const [reportReason, setReportReason] = useState<number | null>(null);

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/articles/${articleId}/comments`],
    enabled: commentsEnabled !== "false",
  });

  const createComment = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName, authorEmail, content, parentCommentId: null }),
      });
      if (!res.ok) throw new Error("Failed to create comment");
      return res.json();
    },
    onSuccess: () => {
      setAuthorName(""); setAuthorEmail(""); setContent(""); setCaptchaValue(""); setCaptchaValid(false);
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}/comments`] });
      toast({ title: "Επιτυχία", description: "Το σχόλιό σας δημοσιεύθηκε." });
    },
    onError: (err: any) => {
      const msg = err.message || "";
      if (msg.includes("403")) {
        toast({ title: "Απενεργοποιημένο", description: "Τα σχόλια είναι προσωρινά απενεργοποιημένα.", variant: "destructive" });
      } else if (msg.includes("429")) {
        const secs = msg.match(/\d+/)?.[0] || "λίγα";
        toast({ title: "Περιμένετε", description: `Περιμένετε ${secs} δευτερόλεπτα.` });
      } else {
        toast({ title: "Σφάλμα", description: "Αποτυχία δημοσίευσης σχολίου.", variant: "destructive" });
      }
    },
  });

  const reportComment = useMutation({
    mutationFn: async (data: { commentId: number; reason: string }) => {
      const res = await fetch(`/api/comments/${data.commentId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: data.reason }),
      });
      if (!res.ok) throw new Error("Failed to report comment");
      return res.json();
    },
    onSuccess: () => {
      setReportReason(null);
      queryClient.invalidateQueries({ queryKey: ["/api/comments/reports"] });
      toast({ title: "Επιτυχία", description: "Το σχόλιο αναφέρθηκε με επιτυχία." });
    },
    onError: (error) => {
      console.error("Report comment error:", error);
      toast({ title: "Σφάλμα", description: "Αποτυχία αναφοράς σχολίου.", variant: "destructive" });
    },
  });

  if (commentsEnabled === "false") {
    return (
      <Card className="mt-12 border-2 border-amber-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3 text-amber-700">
            <ShieldAlert className="h-6 w-6" />
            <div>
              <p className="font-bold">Τα σχόλια είναι προσωρινά απενεργοποιημένα.</p>
              <p className="text-sm">Η δυνατότητα σχολιασμού έχει απενεργοποιηθεί από τον διαχειριστή.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-12 border-2 border-primary/10 shadow-lg animate-fade-up">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <CardTitle className="flex items-center gap-2 text-primary font-display">
          <MessageSquare className="h-5 w-5" />
          Σχόλια ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        {/* New Comment Form */}
        <div className="space-y-4 border-b pb-8">
          <h3 className="font-bold text-foreground">Προσθέστε ένα σχόλιο</h3>
          <Input
            placeholder="Όνομα"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="border-2"
          />
          <Input
            placeholder="Email"
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            className="border-2"
          />
          <Textarea
            placeholder="Το σχόλιό σας..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-2 min-h-[100px]"
          />
          <CaptchaField value={captchaValue} onChange={setCaptchaValue} onValidate={setCaptchaValid} />
          <Button
            onClick={() => {
              if (!captchaValid) {
                toast({ title: "Επαλήθευση", description: "Συμπληρώστε σωστά το αποτέλεσμα της μαθηματικής πράξης.", variant: "destructive" });
                return;
              }
              createComment.mutate();
            }}
            disabled={!authorName || !authorEmail || !content || createComment.isPending}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {createComment.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Δημοσίευση Σχολίου
          </Button>
        </div>

        {/* Comments List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground animate-pulse">Φόρτωση σχολίων...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground italic">Δεν υπάρχουν σχόλια ακόμα.</div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 bg-muted/30 rounded-lg border border-primary/10">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-foreground">{comment.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(comment.publishedAt), "PPP", { locale: el })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const reason = prompt("Λόγος αναφοράς:");
                      if (reason) reportComment.mutate({ commentId: comment.id, reason });
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-3 text-foreground whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
