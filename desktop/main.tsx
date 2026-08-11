import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/sonner";
import { PlannerApp } from "@/components/planner/PlannerApp";
import "@/styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PlannerApp />
    <Toaster />
  </StrictMode>,
);
