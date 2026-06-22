import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { SeoHead } from "@/components/SeoHead";

export default function NotFound() {
  return (
    <>
      <SeoHead title="Σελίδα δεν βρέθηκε" description="Η σελίδα που ψάχνετε δεν υπάρχει." />
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 font-body relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <Card className="w-full max-w-lg mx-4 shadow-2xl border-2 border-primary/15 rounded-3xl overflow-hidden animate-pop-in relative z-10">
        <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-accent" />
        <CardContent className="pt-10 pb-10 px-8 text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/15 to-primary/5 rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-primary/10">
            <AlertCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-primary mb-3">Σελίδα δεν βρέθηκε</h1>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-sm mx-auto">
            Η σελίδα που ψάχνετε δεν υπάρχει. Ελέγξτε τη διεύθυνση ή επιστρέψτε στην αρχική σελίδα.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                <Home className="h-4 w-4" /> Αρχική Σελίδα
              </span>
            </Link>
            <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 border-2 border-primary/15 text-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/5 transition-all duration-300">
              <ArrowLeft className="h-4 w-4" /> Πίσω
            </button>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
