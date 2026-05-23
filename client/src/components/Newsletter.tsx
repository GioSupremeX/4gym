import { useState } from "react";
import { Mail, Send, CheckCircle, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { CaptchaField } from "@/components/Captcha";
import { useSettings } from "@/hooks/use-articles";

export function Newsletter() {
  const { toast } = useToast();
  const { data: settings } = useSettings();
  const [email, setEmail] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);

  const subscribe = useMutation({
    mutationFn: async (emailValue: string) => {
      const res = await apiRequest("POST", "/api/subscribers", { email: emailValue });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Επιτυχής εγγραφή!", description: "Θα λαμβάνετε νέα του σχολείου." });
      setEmail(""); setCaptchaValue(""); setCaptchaValid(false);
    },
    onError: (err: any) => {
      const msg = err.message || "";
      if (msg.includes("403")) {
        toast({ title: "Απενεργοποιημένο", description: "Η εγγραφή στο newsletter είναι προσωρινά απενεργοποιημένη.", variant: "destructive" });
      } else if (msg.includes("429")) {
        const secs = msg.match(/\d+/)?.[0] || "λίγα";
        toast({ title: "Περιμένετε", description: `Περιμένετε ${secs} δευτερόλεπτα.` });
      } else if (msg.includes("409") || msg.includes("already subscribed")) {
        toast({ title: "Το email υπάρχει ήδη", description: "Έχετε εγγραφεί με αυτό το email.", variant: "destructive" });
      } else {
        toast({ title: "Απέτυχε", description: "Δοκιμάστε ξανά αργότερα.", variant: "destructive" });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({ title: "Μη έγκυρο email", variant: "destructive" });
      return;
    }
    if (!captchaValid) {
      toast({ title: "Επαλήθευση", description: "Συμπληρώστε σωστά το αποτέλεσμα της μαθηματικής πράξης.", variant: "destructive" });
      return;
    }
    subscribe.mutate(email);
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

          {subscribe.isSuccess ? (
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold py-4 animate-fade-up">
              <CheckCircle className="h-5 w-5" />
              <span>Ευχαριστούμε! Θα λαμβάνετε νέα μας.</span>
            </div>
          ) : settings?.subscribeEnabled === "false" ? (
            <div className="flex items-center justify-center gap-3 py-4 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl max-w-md mx-auto">
              <ShieldAlert className="h-5 w-5" />
              <div className="text-left">
                <p className="font-bold text-sm">Η εγγραφή στο newsletter είναι προσωρινά απενεργοποιημένη.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="το@email.σας.gr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12"
                  disabled={subscribe.isPending}
                />
                <Button type="submit" disabled={subscribe.isPending} className="h-12 px-6 gap-2">
                  {subscribe.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Εγγραφή
                </Button>
              </div>
              <CaptchaField value={captchaValue} onChange={setCaptchaValue} onValidate={setCaptchaValid} />
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
