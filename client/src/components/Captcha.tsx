import { useState, useEffect } from "react";
import { Shield, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface CaptchaChallenge {
  num1: number;
  num2: number;
  op: "+" | "-" | "×";
  answer: number;
}

export function generateCaptcha(): CaptchaChallenge {
  const ops: ("+" | "-" | "×")[] = ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let num1 = Math.floor(Math.random() * 10) + 1;
  let num2 = Math.floor(Math.random() * 10) + 1;
  let answer: number;
  if (op === "+") {
    answer = num1 + num2;
  } else if (op === "-") {
    answer = num1;
    num1 = num1 + num2;
  } else {
    num1 = Math.floor(Math.random() * 5) + 1;
    num2 = Math.floor(Math.random() * 5) + 1;
    answer = num1 * num2;
  }
  return { num1, num2, op, answer };
}

export function CaptchaField({ value, onChange, onValidate }: {
  value: string;
  onChange: (val: string) => void;
  onValidate: (isValid: boolean) => void;
}) {
  const [challenge, setChallenge] = useState<CaptchaChallenge>(generateCaptcha());
  const [error, setError] = useState(false);

  const refresh = () => {
    const c = generateCaptcha();
    setChallenge(c);
    onChange("");
    setError(false);
    onValidate(false);
  };

  useEffect(() => {
    const n = parseInt(value, 10);
    if (value === "") {
      setError(false);
      onValidate(false);
    } else if (!isNaN(n) && n === challenge.answer) {
      setError(false);
      onValidate(true);
    } else {
      setError(true);
      onValidate(false);
    }
  }, [value, challenge]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary" /> Επαλήθευση
      </label>
      <div className="flex gap-3 items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold font-mono bg-muted px-3 py-1.5 rounded-md border">
              {challenge.num1} {challenge.op} {challenge.num2} = ?
            </span>
            <Button type="button" variant="ghost" size="icon" onClick={refresh} className="shrink-0">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Απάντηση"
            className={`h-11 ${error && value ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
          {error && value && (
            <p className="text-xs text-destructive mt-1">Λάθος απάντηση, δοκιμάστε ξανά.</p>
          )}
        </div>
      </div>
    </div>
  );
}
