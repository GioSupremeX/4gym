import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AdminDashboard from "@/pages/AdminDashboard";
import { AboutPage, StudentsPage, ActivitiesPage, AnnouncementsPage, ContactPage, CategoryPage, ArticlePage } from "@/pages/ContentPages";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={AboutPage} />
      <Route path="/about/teachers" component={() => <CategoryPage category="teachers" title="Εκπαιδευτικό Προσωπικό" />} />
      <Route path="/about/heads" component={() => <CategoryPage category="heads" title="Υπεύθυνοι Τμημάτων" />} />
      <Route path="/about/schedule" component={() => <CategoryPage category="schedule" title="Ωράριο" />} />
      <Route path="/about/rules" component={() => <CategoryPage category="rules" title="Κανονισμός" />} />
      <Route path="/about/evaluation" component={() => <CategoryPage category="evaluation" title="Εσωτερική Αυτοαξιολόγηση" />} />
      <Route path="/students" component={StudentsPage} />
      <Route path="/activities" component={ActivitiesPage} />
      <Route path="/announcements" component={AnnouncementsPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/articles/:id" component={ArticlePage} />
      <Route path="/secret/edit" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
