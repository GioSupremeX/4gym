import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4 shadow-xl border-primary/20">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Σελίδα δεν βρέθηκε</h1>
          </div>
          
          <p className="mt-4 text-sm text-gray-600">
            Η σελίδα που ψάχνετε δεν υπάρχει. Ελέγξτε τη διεύθυνση ή επιστρέψτε στην αρχική σελίδα.
          </p>

          <div className="mt-8 flex justify-end">
            <a href="/" className="text-primary hover:underline font-medium">
              Επιστροφή στην Αρχική
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
