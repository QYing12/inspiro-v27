import { create } from "zustand";
import { scraps as seedScraps, tasks as seedTasks, projects, categories } from "./fixtures.js";
import { frameInsightAsTask } from "./fakeAI.js";

export const useStore = create((set, get) => ({
  projects,
  categories,
  scraps: seedScraps,
  tasks: seedTasks,

  // filter state shared across pages
  projectFilter: "all", // "all" | projectId
  setProjectFilter: (id) => set({ projectFilter: id }),

  // capture
  addScrap: (scrap) =>
    set((s) => ({
      scraps: [
        {
          ...scrap,
          id: `s${Date.now()}`,
          date: new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }),
          cardSize: "normal",
        },
        ...s.scraps,
      ],
    })),

  // insight → task flow (core product pipeline)
  sendInsightsToTasks: (scrapId, insightTexts) => {
    const scrap = get().scraps.find((s) => s.id === scrapId);
    if (!scrap) return [];
    const newTasks = insightTexts.map((text) => ({
      id: `t${Date.now()}${Math.random().toString(16).slice(2, 6)}`,
      ...frameInsightAsTask(text, scrap.projectId),
      sourceScrapId: scrapId,
    }));
    set((s) => ({ tasks: [...newTasks, ...s.tasks] }));
    return newTasks;
  },

  setTaskStatus: (id, status) =>
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)) })),

  toggleTaskDone: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, status: t.status === "completed" ? "active" : "completed" } : t
      ),
    })),

  // Inline task editing — immediate persistence, no draft buffer.
  // Both edits keep existing fields intact so checkbox/completion logic
  // elsewhere in the store keeps working untouched.
  updateTaskTitle: (id, title) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, title } : t)),
    })),

  updateTaskNote: (id, note) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, note } : t)),
    })),

  getProject: (id) => get().projects.find((p) => p.id === id),
  getScrap: (id) => get().scraps.find((s) => s.id === id),

  getFilteredScraps: () => {
    const { scraps, projectFilter } = get();
    if (projectFilter === "all") return scraps;
    // A scrap may belong to multiple projects via optional `projectIds`.
    // When present it takes precedence over the singular `projectId`.
    return scraps.filter((s) => {
      if (Array.isArray(s.projectIds) && s.projectIds.length) {
        return s.projectIds.includes(projectFilter);
      }
      return s.projectId === projectFilter;
    });
  },
  getFilteredTasks: () => {
    const { tasks, projectFilter } = get();
    return projectFilter === "all"
      ? tasks
      : tasks.filter((t) => t.projectId === projectFilter);
  },
}));
