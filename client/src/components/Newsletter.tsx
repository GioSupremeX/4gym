import { useState } from "react";
import { Mail, Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function Newsletter() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({ title: "Μη έγκυρο email", variant: "destructive" });
      return;
    }
    setStatus("loading");
    setTimeout(() => {
      setStatus("success");
      toast({ title: "Επιτυχής εγγραφή!", description: "Θα λαμβάνετε νέα του σχολείου." });
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    }, 1200);
  };

  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 via-secondary/10 to-accent/5 border-y border-primary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-primary mb-2">Μείνετε σε επαφή</h3>
            <p className="text-muted-foreground">Εγγραφείτε για να λαμβάνετε τις τελευταίες ανακοινώσεις και νέα του σχολείου.</p>
          </div>

          {status === "success" ? (
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold py-4">
              <CheckCircle className="h-5 w-5" />
              <span>Ευχαριστούμε! Θα λαμβάνετε νέα μας.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="το@email.σας.gr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-12"
                disabled={status === "loading"}
              />
              <Button type="submit" disabled={status === "loading"} className="h-12 px-6 gap-2">
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Εγγραφή
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
