import { createFileRoute } from "@tanstack/react-router";
import { PlannerApp } from "@/components/planner/PlannerApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyForge - Offline Study Planner & Task Tracker" },
      {
        name: "description",
        content:
          "StudyForge is a fast, private study planner: add, edit and complete tasks, track progress and streaks, with dark mode and offline local storage.",
      },
      { property: "og:title", content: "StudyForge - Offline Study Planner" },
      {
        property: "og:description",
        content:
          "Plan study sessions, track progress bars and streaks, and keep every task saved on your own device.",
      },
    ],
  }),
  component: PlannerApp,
});
