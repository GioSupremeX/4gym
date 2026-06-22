import { useState } from "react";
import { Send, Loader2, CheckCircle, Mail, User, MessageSquare, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { CaptchaField } from "@/components/Captcha";
import { useSettings } from "@/hooks/use-articles";

export function ContactForm() {
  const { toast } = useToast();
  const { data: settings } = useSettings();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [captchaValue, setCaptchaValue] = useState("");
  const [captchaValid, setCaptchaValid] = useState(false);

  const sendMessage = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/contacts", { name, email, subject, message });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Επιτυχία!", description: "Το μήνυμά σας στάλθηκε." });
      setName(""); setEmail(""); setSubject(""); setMessage(""); setCaptchaValue(""); setCaptchaValid(false);
    },
    onError: (err: any) => {
      const msg = err.message || "";
      if (msg.includes("403")) {
        toast({ title: "Απενεργοποιημένο", description: "Η αποστολή μηνυμάτων είναι προσωρινά απενεργοποιημένη.", variant: "destructive" });
      } else if (msg.includes("429")) {
        const secs = msg.match(/\d+/)?.[0] || "λίγα";
        toast({ title: "Περιμένετε", description: `Περιμένετε ${secs} δευτερόλεπτα πριν ξανά στείλετε.`, variant: "destructive" });
      } else {
        toast({ title: "Σφάλμα", description: "Δοκιμάστε ξανά.", variant: "destructive" });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({ title: "Συμπληρώστε όλα τα πεδία", variant: "destructive" });
      return;
    }
    if (!captchaValid) {
      toast({ title: "Επαλήθευση", description: "Συμπληρώστε σωστά το αποτέλεσμα της μαθηματικής πράξης.", variant: "destructive" });
      return;
    }
    sendMessage.mutate();
  };

  const messagesDisabled = settings?.messagesEnabled === "false";

  return (
    <Card className="border-2 border-primary/10 shadow-lg rounded-2xl">
      <CardContent className="p-6 md:p-8 space-y-6">
        {messagesDisabled ? (
          <div className="flex items-center justify-center gap-3 py-8 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl">
            <ShieldAlert className="h-6 w-6" />
            <div>
              <p className="font-bold">Η φόρμα επικοινωνίας είναι προσωρινά απενεργοποιημένη.</p>
              <p className="text-sm">Παρακαλώ επικοινωνήστε τηλεφωνικά ή μέσω email.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Όνομα
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Το όνομά σας" className="h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" /> Email
                </label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="το@email.σας.gr" className="h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">Θέμα</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Θέμα μηνύματος" className="h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Μήνυμα
              </label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Γράψτε το μήνυμά σας..." rows={5} />
            </div>
            <Button type="submit" disabled={sendMessage.isPending} className="w-full h-12 gap-2">
              {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : sendMessage.isSuccess ? <CheckCircle className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              {sendMessage.isSuccess ? "Στάλθηκε" : "Αποστολή Μηνύματος"}
            </Button>
            <CaptchaField value={captchaValue} onChange={setCaptchaValue} onValidate={setCaptchaValid} />
          </form>
        )}
      </CardContent>
    </Card>
  );
}
