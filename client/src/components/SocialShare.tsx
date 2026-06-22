import { useState } from "react";
import { Share2, Facebook, Twitter, Link2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function SocialShare({ title, url }: { title: string; url: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast({ title: "Αντιγράφηκε!", description: "Ο σύνδεσμος αντιγράφηκε στο clipboard." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Απέτυχε", variant: "destructive" });
    }
  };

  const shareTo = (platform: string) => {
    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl)}`;
        break;
    }
    if (shareUrl) window.open(shareUrl, "_blank", "width=600,height=400");
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-2 border-primary/20 hover:bg-primary/5"
      >
        <Share2 className="h-4 w-4" />
        Κοινοποίηση
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white dark:bg-background border-2 border-primary/10 rounded-xl shadow-xl p-2 flex items-center gap-1 z-50">
          <button
            onClick={() => shareTo("facebook")}
            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
            title="Facebook"
          >
            <Facebook className="h-5 w-5" />
          </button>
          <button
            onClick={() => shareTo("twitter")}
            className="p-2 rounded-lg hover:bg-sky-50 text-sky-500 transition-colors"
            title="Twitter"
          >
            <Twitter className="h-5 w-5" />
          </button>
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg hover:bg-primary/5 text-primary transition-colors"
            title="Αντιγραφή συνδέσμου"
          >
            {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Link2 className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Κλείσιμο"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
