import { createSlice, nanoid } from "@reduxjs/toolkit";

const TODOS_STORAGE_KEY = "todos-app-state";

const defaultProjects = [
  { id: "project-1", name: "Frontend App" },
  { id: "project-2", name: "Marketing Campaign" },
  { id: "project-3", name: "Portfolio Website" },
];

const defaultState = {
  projects: defaultProjects,
  items: [
    {
      id: "1",
      text: "Finish Redux Toolkit setup",
      completed: false,
      priority: "high",
      dueDate: "2026-04-15",
      projectId: "project-1",
      createdAt: "2026-04-13T08:00:00.000Z",
    },
    {
      id: "2",
      text: "Implement task filtering",
      completed: false,
      priority: "medium",
      dueDate: "2026-04-18",
      projectId: "project-1",
      createdAt: "2026-04-13T08:10:00.000Z",
    },
    {
      id: "3",
      text: "Prepare newsletter content",
      completed: true,
      priority: "low",
      dueDate: "2026-04-12",
      projectId: "project-2",
      createdAt: "2026-04-13T08:20:00.000Z",
    },
    {
      id: "4",
      text: "Improve UI with Ant Design",
      completed: false,
      priority: "medium",
      dueDate: "2026-04-20",
      projectId: "project-3",
      createdAt: "2026-04-13T08:30:00.000Z",
    },
  ],
  filter: "all",
  priorityFilter: "all",
  projectFilter: "all",
  sortBy: "manual",
};

const isValidPriority = (value) =>
  value === "low" || value === "medium" || value === "high";

const isValidStatusFilter = (value) =>
  value === "all" || value === "active" || value === "completed";

const isValidPriorityFilter = (value) =>
  value === "all" || value === "low" || value === "medium" || value === "high";

const isValidSortBy = (value) =>
  value === "manual" ||
  value === "date-asc" ||
  value === "date-desc" ||
  value === "priority-desc" ||
  value === "priority-asc";

const sanitizeProjectName = (value) => value?.trim() || "";

const normalizeProjects = (projects) => {
  if (!Array.isArray(projects) || projects.length === 0) {
    return defaultProjects;
  }

  const seen = new Set();
  const normalized = [];

  for (const project of projects) {
    const name = sanitizeProjectName(project?.name);

    if (!name) {
      continue;
    }

    const normalizedName = name.toLowerCase();

    if (seen.has(normalizedName)) {
      continue;
    }

    seen.add(normalizedName);

    normalized.push({
      id: String(project?.id ?? nanoid()),
      name,
    });
  }

  return normalized.length > 0 ? normalized : defaultProjects;
};

const normalizeItems = (items, projects) => {
  if (!Array.isArray(items)) {
    return defaultState.items;
  }

  const projectIds = new Set(projects.map((project) => project.id));
  const fallbackProjectId = projects[0]?.id ?? null;

  return items.map((item) => ({
    id: String(item?.id ?? nanoid()),
    text: typeof item?.text === "string" ? item.text : "Untitled task",
    completed: Boolean(item?.completed),
    priority: isValidPriority(item?.priority) ? item.priority : "medium",
    dueDate: item?.dueDate || null,
    projectId:
      typeof item?.projectId === "string" && projectIds.has(item.projectId)
        ? item.projectId
        : fallbackProjectId,
    createdAt: item?.createdAt || new Date().toISOString(),
  }));
};

const loadStateFromStorage = () => {
  try {
    const raw = localStorage.getItem(TODOS_STORAGE_KEY);

    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return defaultState;
    }

    const projects = normalizeProjects(parsed.projects);
    const items = normalizeItems(parsed.items, projects);

    return {
      projects,
      items,
      filter: isValidStatusFilter(parsed.filter) ? parsed.filter : "all",
      priorityFilter: isValidPriorityFilter(parsed.priorityFilter)
        ? parsed.priorityFilter
        : "all",
      projectFilter:
        parsed.projectFilter === "all" ||
        projects.some((project) => project.id === parsed.projectFilter)
          ? parsed.projectFilter
          : "all",
      sortBy: isValidSortBy(parsed.sortBy) ? parsed.sortBy : "manual",
    };
  } catch (error) {
    console.error("Failed to load todos state from localStorage:", error);
    return defaultState;
  }
};

const initialState = loadStateFromStorage();

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    addTodo: {
      reducer: (state, action) => {
        state.items.unshift(action.payload);
      },
      prepare: ({ text, priority, dueDate, projectId }) => {
        const value = text?.trim();

        if (!value) {
          throw new Error("Todo text cannot be empty");
        }

        if (!isValidPriority(priority)) {
          throw new Error("Invalid priority value");
        }

        if (!projectId || typeof projectId !== "string") {
          throw new Error("Project is required");
        }

        return {
          payload: {
            id: nanoid(),
            text: value,
            completed: false,
            priority,
            dueDate: dueDate || null,
            projectId,
            createdAt: new Date().toISOString(),
          },
        };
      },
    },

    addProject: {
      reducer: (state, action) => {
        const projectExists = state.projects.some(
          (project) =>
            project.name.toLowerCase() === action.payload.name.toLowerCase(),
        );

        if (projectExists) {
          return;
        }

        state.projects.push(action.payload);
      },
      prepare: ({ name }) => {
        const value = sanitizeProjectName(name);

        if (!value) {
          throw new Error("Project name cannot be empty");
        }

        return {
          payload: {
            id: nanoid(),
            name: value,
          },
        };
      },
    },

    toggleTodo: (state, action) => {
      const todo = state.items.find((item) => item.id === action.payload);

      if (!todo) return;

      todo.completed = !todo.completed;
    },

    deleteTodo: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    updateTodo: (state, action) => {
      const { id, text, priority, dueDate, projectId } = action.payload;
      const todo = state.items.find((item) => item.id === id);

      if (!todo) return;

      const value = text?.trim();

      if (!value) return;

      todo.text = value;
      todo.priority = isValidPriority(priority) ? priority : todo.priority;
      todo.dueDate = dueDate || null;

      const projectExists = state.projects.some(
        (project) => project.id === projectId,
      );

      if (projectExists) {
        todo.projectId = projectId;
      }
    },

    setFilter: (state, action) => {
      if (!isValidStatusFilter(action.payload)) {
        return;
      }

      state.filter = action.payload;
    },

    setPriorityFilter: (state, action) => {
      if (!isValidPriorityFilter(action.payload)) {
        return;
      }

      state.priorityFilter = action.payload;
    },

    setProjectFilter: (state, action) => {
      const value = action.payload;

      if (
        value === "all" ||
        state.projects.some((project) => project.id === value)
      ) {
        state.projectFilter = value;
      }
    },

    setSortBy: (state, action) => {
      if (!isValidSortBy(action.payload)) {
        return;
      }

      state.sortBy = action.payload;
    },

    clearCompleted: (state) => {
      state.items = state.items.filter((item) => !item.completed);
    },

    moveTodo: (state, action) => {
      const { activeId, overId } = action.payload;

      if (!activeId || !overId || activeId === overId) {
        return;
      }

      const oldIndex = state.items.findIndex((item) => item.id === activeId);
      const newIndex = state.items.findIndex((item) => item.id === overId);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const [movedItem] = state.items.splice(oldIndex, 1);
      state.items.splice(newIndex, 0, movedItem);
    },
  },
});

export const {
  addTodo,
  addProject,
  toggleTodo,
  deleteTodo,
  updateTodo,
  setFilter,
  setPriorityFilter,
  setProjectFilter,
  setSortBy,
  clearCompleted,
  moveTodo,
} = todoSlice.actions;

export default todoSlice.reducer;
