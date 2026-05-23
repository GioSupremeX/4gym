import { useState, useEffect, useCallback } from "react";
import {
  Accessibility,
  X,
  Type,
  Maximize,
  Minimize,
  Image as ImageIcon,
  Palette,
  MousePointer2,
  AlignJustify,
  ArrowUpDown,
  Sparkles,
  Link2,
  Contrast,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type A11yState = {
  highContrast: boolean;
  largeText: boolean;
  disableAnimations: boolean;
  dyslexiaFont: boolean;
  hideImages: boolean;
  bigCursor: boolean;
  wideLineHeight: boolean;
  highlightLinks: boolean;
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
  }, []);

  useEffect(() => {
    apply(state);
  }, [state, apply]);

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

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Μενού Προσβασιμότητας"
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
        <Card className="fixed bottom-24 left-6 z-[9999] w-[320px] max-h-[80vh] overflow-y-auto shadow-2xl border-2 border-primary/20 rounded-2xl animate-fade-up">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <Accessibility className="h-5 w-5" />
                Μενού Προσβασιμότητας
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Active indicator */}
            {anyActive && (
              <div className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
                Ενεργός ρύθμιση προσβασιμότητας
              </div>
            )}

            {/* Grid of options */}
            <div className="grid grid-cols-2 gap-2.5">
              <A11yButton
                active={state.highContrast}
                onClick={() => toggle("highContrast")}
                icon={<Contrast className="h-5 w-5" />}
                label="Αντίθεση"
              />
              <A11yButton
                active={state.largeText}
                onClick={() => toggle("largeText")}
                icon={<Type className="h-5 w-5" />}
                label="Μεγάλο Κείμενο"
              />
              <A11yButton
                active={state.disableAnimations}
                onClick={() => toggle("disableAnimations")}
                icon={<Sparkles className="h-5 w-5" />}
                label="Παύση κιν."
              />
              <A11yButton
                active={state.dyslexiaFont}
                onClick={() => toggle("dyslexiaFont")}
                icon={<AlignJustify className="h-5 w-5" />}
                label="Φιλικό για δυσλεξία"
              />
              <A11yButton
                active={state.hideImages}
                onClick={() => toggle("hideImages")}
                icon={<ImageIcon className="h-5 w-5" />}
                label="Απόκρυψη εικ."
              />
              <A11yButton
                active={state.bigCursor}
                onClick={() => toggle("bigCursor")}
                icon={<MousePointer2 className="h-5 w-5" />}
                label="Μεγάλος δρομέας"
              />
              <A11yButton
                active={state.wideLineHeight}
                onClick={() => toggle("wideLineHeight")}
                icon={<ArrowUpDown className="h-5 w-5" />}
                label="Έυρος γραμμής"
              />
              <A11yButton
                active={state.highlightLinks}
                onClick={() => toggle("highlightLinks")}
                icon={<Link2 className="h-5 w-5" />}
                label="Σύνδεσμοι"
              />
            </div>

            {anyActive && (
              <Button variant="outline" className="w-full" onClick={reset}>
                <Minimize className="h-4 w-4 mr-2" />
                Επαναφορά
              </Button>
            )}
          </div>
        </Card>
      )}
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
          ? "bg-primary text-white border-primary shadow-md"
          : "bg-background text-foreground border-muted hover:border-primary/40 hover:shadow-sm"
      }`}
    >
      {icon}
      <span className="text-xs font-semibold leading-tight">{label}</span>
    </button>
  );
}
