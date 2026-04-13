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
      description: "Configure store, slices, selectors and connect Provider.",
      status: "todo",
      priority: "high",
      dueDate: "2026-04-15",
      projectId: "project-1",
      createdAt: "2026-04-13T08:00:00.000Z",
    },
    {
      id: "2",
      text: "Implement task filtering",
      description: "Add filters by status, priority and project.",
      status: "in_progress",
      priority: "medium",
      dueDate: "2026-04-18",
      projectId: "project-1",
      createdAt: "2026-04-13T08:10:00.000Z",
    },
    {
      id: "3",
      text: "Prepare newsletter content",
      description: "Write draft copy for the spring campaign email.",
      status: "done",
      priority: "low",
      dueDate: "2026-04-12",
      projectId: "project-2",
      createdAt: "2026-04-13T08:20:00.000Z",
    },
    {
      id: "4",
      text: "Improve UI with Ant Design",
      description: "Refine spacing, visual hierarchy and responsive behavior.",
      status: "todo",
      priority: "medium",
      dueDate: "2026-04-20",
      projectId: "project-3",
      createdAt: "2026-04-13T08:30:00.000Z",
    },
  ],
  statusFilter: "all",
  priorityFilter: "all",
  projectFilter: "all",
  searchQuery: "",
  sortBy: "manual",
};

const isValidPriority = (value) =>
  value === "low" || value === "medium" || value === "high";

const isValidStatus = (value) =>
  value === "todo" || value === "in_progress" || value === "done";

const isValidStatusFilter = (value) =>
  value === "all" ||
  value === "todo" ||
  value === "in_progress" ||
  value === "done";

const isValidPriorityFilter = (value) =>
  value === "all" || value === "low" || value === "medium" || value === "high";

const isValidSortBy = (value) =>
  value === "manual" ||
  value === "date-asc" ||
  value === "date-desc" ||
  value === "priority-desc" ||
  value === "priority-asc";

const sanitizeProjectName = (value) => value?.trim() || "";
const sanitizeText = (value) => value?.trim() || "";
const sanitizeDescription = (value) => value?.trim() || "";

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
    description: typeof item?.description === "string" ? item.description : "",
    status: isValidStatus(item?.status)
      ? item.status
      : item?.completed
        ? "done"
        : "todo",
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
      statusFilter: isValidStatusFilter(parsed.statusFilter)
        ? parsed.statusFilter
        : isValidStatusFilter(parsed.filter)
          ? parsed.filter
          : "all",
      priorityFilter: isValidPriorityFilter(parsed.priorityFilter)
        ? parsed.priorityFilter
        : "all",
      projectFilter:
        parsed.projectFilter === "all" ||
        projects.some((project) => project.id === parsed.projectFilter)
          ? parsed.projectFilter
          : "all",
      searchQuery:
        typeof parsed.searchQuery === "string" ? parsed.searchQuery : "",
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
      prepare: ({
        text,
        description,
        status,
        priority,
        dueDate,
        projectId,
      }) => {
        const normalizedText = sanitizeText(text);
        const normalizedDescription = sanitizeDescription(description);

        if (!normalizedText) {
          throw new Error("Task title cannot be empty");
        }

        if (!isValidStatus(status)) {
          throw new Error("Invalid status value");
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
            text: normalizedText,
            description: normalizedDescription,
            status,
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

    setTodoStatus: (state, action) => {
      const { id, status } = action.payload;
      const todo = state.items.find((item) => item.id === id);

      if (!todo || !isValidStatus(status)) {
        return;
      }

      todo.status = status;
    },

    deleteTodo: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    updateTodo: (state, action) => {
      const { id, text, description, status, priority, dueDate, projectId } =
        action.payload;
      const todo = state.items.find((item) => item.id === id);

      if (!todo) {
        return;
      }

      const normalizedText = sanitizeText(text);

      if (!normalizedText) {
        return;
      }

      todo.text = normalizedText;
      todo.description = sanitizeDescription(description);
      todo.status = isValidStatus(status) ? status : todo.status;
      todo.priority = isValidPriority(priority) ? priority : todo.priority;
      todo.dueDate = dueDate || null;

      const projectExists = state.projects.some(
        (project) => project.id === projectId,
      );

      if (projectExists) {
        todo.projectId = projectId;
      }
    },

    setStatusFilter: (state, action) => {
      if (!isValidStatusFilter(action.payload)) {
        return;
      }

      state.statusFilter = action.payload;
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

    setSearchQuery: (state, action) => {
      state.searchQuery =
        typeof action.payload === "string" ? action.payload : "";
    },

    setSortBy: (state, action) => {
      if (!isValidSortBy(action.payload)) {
        return;
      }

      state.sortBy = action.payload;
    },

    clearDoneTasks: (state) => {
      state.items = state.items.filter((item) => item.status !== "done");
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
  setTodoStatus,
  deleteTodo,
  updateTodo,
  setStatusFilter,
  setPriorityFilter,
  setProjectFilter,
  setSearchQuery,
  setSortBy,
  clearDoneTasks,
  moveTodo,
} = todoSlice.actions;

export default todoSlice.reducer;
