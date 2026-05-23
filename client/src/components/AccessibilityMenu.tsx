import { useState, useEffect, useCallback } from "react";
import {
  Accessibility,
  X,
  Type,
  Minimize,
  Image as ImageIcon,
  MousePointer2,
  AlignJustify,
  ArrowUpDown,
  Sparkles,
  Link2,
  Contrast,
  Sun,
  Moon,
  Eye,
  Monitor,
  VolumeX,
  Keyboard,
  Ban,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type A11yState = {
  highContrast: boolean;
  largeText: boolean;
  disableAnimations: boolean;
  dyslexiaFont: boolean;
  hideImages: boolean;
  bigCursor: boolean;
  wideLineHeight: boolean;
  highlightLinks: boolean;
  darkMode: boolean;
  grayscale: boolean;
  invertColors: boolean;
  saturation: boolean;
  readingMask: boolean;
  textSpacing: boolean;
  pauseMedia: boolean;
  focusHighlight: boolean;
};

const STORAGE_KEY = "school-a11y";

const defaultState: A11yState = {
  highContrast: false,
  largeText: false,
  disableAnimations: false,
  dyslexiaFont: false,
  hideImages: false,
  bigCursor: false,
  wideLineHeight: false,
  highlightLinks: false,
  darkMode: false,
  grayscale: false,
  invertColors: false,
  saturation: false,
  readingMask: false,
  textSpacing: false,
  pauseMedia: false,
  focusHighlight: false,
};

function readState(): A11yState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultState };
}

function writeState(s: A11yState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(readState);

  const apply = useCallback((s: A11yState) => {
    const root = document.documentElement;
    root.classList.toggle("a11y-high-contrast", s.highContrast);
    root.classList.toggle("a11y-large-text", s.largeText);
    root.classList.toggle("a11y-no-animations", s.disableAnimations);
    root.classList.toggle("a11y-dyslexia", s.dyslexiaFont);
    root.classList.toggle("a11y-hide-images", s.hideImages);
    root.classList.toggle("a11y-big-cursor", s.bigCursor);
    root.classList.toggle("a11y-wide-line", s.wideLineHeight);
    root.classList.toggle("a11y-highlight-links", s.highlightLinks);
    root.classList.toggle("a11y-dark-mode", s.darkMode);
    root.classList.toggle("a11y-grayscale", s.grayscale);
    root.classList.toggle("a11y-invert", s.invertColors);
    root.classList.toggle("a11y-saturation", s.saturation);
    root.classList.toggle("a11y-reading-mask", s.readingMask);
    root.classList.toggle("a11y-text-spacing", s.textSpacing);
    root.classList.toggle("a11y-pause-media", s.pauseMedia);
    root.classList.toggle("a11y-focus-highlight", s.focusHighlight);
  }, []);

  useEffect(() => {
    apply(state);
  }, [state, apply]);

  // Keyboard shortcut Ctrl+U to toggle menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = (key: keyof A11yState) => {
    const next = { ...state, [key]: !state[key] };
    setState(next);
    writeState(next);
  };

  const reset = () => {
    setState({ ...defaultState });
    writeState({ ...defaultState });
  };

  const anyActive = Object.values(state).some(Boolean);

  const options: { key: keyof A11yState; icon: React.ReactNode; label: string }[] = [
    { key: "highContrast", icon: <Contrast className="h-5 w-5" />, label: "Αντίθεση" },
    { key: "largeText", icon: <Type className="h-5 w-5" />, label: "Μεγάλο Κείμενο" },
    { key: "textSpacing", icon: <ArrowUpDown className="h-5 w-5" />, label: "Έυρυνα Γράμματα" },
    { key: "wideLineHeight", icon: <AlignJustify className="h-5 w-5" />, label: "Έυρος Γραμμής" },
    { key: "dyslexiaFont", icon: <Layers className="h-5 w-5" />, label: "Φιλικό Δυσλεξίας" },
    { key: "darkMode", icon: <Moon className="h-5 w-5" />, label: "Σκοτεινό" },
    { key: "grayscale", icon: <Sun className="h-5 w-5" />, label: "Ασπρόμαυρο" },
    { key: "invertColors", icon: <Eye className="h-5 w-5" />, label: "Αντιστροφή" },
    { key: "saturation", icon: <Ban className="h-5 w-5" />, label: "Κορεσμός" },
    { key: "hideImages", icon: <ImageIcon className="h-5 w-5" />, label: "Χωρίς Εικόνες" },
    { key: "pauseMedia", icon: <VolumeX className="h-5 w-5" />, label: "Παύση Media" },
    { key: "readingMask", icon: <Monitor className="h-5 w-5" />, label: "Μάσκα Ανάγνωσης" },
    { key: "focusHighlight", icon: <Keyboard className="h-5 w-5" />, label: "Επιλογή Πεδίων" },
    { key: "highlightLinks", icon: <Link2 className="h-5 w-5" />, label: "Σύνδεσμοι" },
    { key: "bigCursor", icon: <MousePointer2 className="h-5 w-5" />, label: "Μεγ. Δρομέας" },
    { key: "disableAnimations", icon: <Sparkles className="h-5 w-5" />, label: "Παύση Κίνησης" },
  ];

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Μενού Προσβασιμότητας (Ctrl+U)"
        className={`fixed bottom-6 left-6 z-[9999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 border-2 ${
          anyActive
            ? "bg-primary text-white border-primary scale-110"
            : "bg-white text-primary border-primary/30 hover:border-primary hover:scale-105"
        }`}
      >
        <Accessibility className="h-7 w-7" />
        {anyActive && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 left-6 z-[9999] w-[340px] max-h-[85vh] overflow-y-auto shadow-2xl border-2 border-primary/20 rounded-2xl animate-fade-up bg-white">
          <div className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-primary flex items-center gap-2 text-lg">
                <Accessibility className="h-6 w-6" />
                Μενού Προσβασιμότητας
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-gray-500 -mt-2">Ctrl+U για άνοιγμα/κλείσιμο</p>

            {/* Active indicator */}
            {anyActive && (
              <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Ενεργός ρύθμιση προσβασιμότητας
              </div>
            )}

            {/* Grid of options */}
            <div className="grid grid-cols-2 gap-2.5">
              {options.map((opt) => (
                <A11yButton
                  key={opt.key}
                  active={state[opt.key]}
                  onClick={() => toggle(opt.key)}
                  icon={opt.icon}
                  label={opt.label}
                />
              ))}
            </div>

            {anyActive && (
              <Button variant="outline" className="w-full border-2" onClick={reset}>
                <Minimize className="h-4 w-4 mr-2" />
                Επαναφορά Προεπιλογών
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Reading mask overlay */}
      {state.readingMask && <ReadingMask onClose={() => toggle("readingMask")} />}
    </>
  );
}

function A11yButton({ active, onClick, icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center select-none ${
        active
          ? "bg-primary text-white border-primary shadow-md scale-[1.02]"
          : "bg-white text-foreground border-gray-200 hover:border-primary/40 hover:shadow-sm hover:bg-gray-50"
      }`}
    >
      {icon}
      <span className="text-xs font-semibold leading-tight">{label}</span>
    </button>
  );
}

function ReadingMask({ onClose }: { onClose: () => void }) {
  const [y, setY] = useState(window.innerHeight / 2);

  useEffect(() => {
    const move = (e: MouseEvent) => setY(e.clientY);
    window.addEventListener("mousemove", move);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("keydown", esc);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      <div className="absolute inset-0 bg-black/80" style={{ clipPath: `inset(0 0 calc(100% - ${y - 60}px) 0)` }} />
      <div className="absolute inset-0 bg-black/80" style={{ clipPath: `inset(calc(${y + 60}px) 0 0 0)` }} />
      <div className="absolute left-0 right-0 h-[120px] bg-transparent" style={{ top: y - 60 }} />
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[9999] bg-white text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg pointer-events-auto"
      >
        Κλείσιμο Μάσκας (Esc)
      </button>
    </div>
  );
}
