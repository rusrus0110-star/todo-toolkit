import { createSelector } from "@reduxjs/toolkit";

const priorityRank = {
  low: 1,
  medium: 2,
  high: 3,
};

const getDateTimestamp = (value) => {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const parsed = new Date(value).getTime();

  if (Number.isNaN(parsed)) {
    return Number.MAX_SAFE_INTEGER;
  }

  return parsed;
};

export const selectTodos = (state) => state.todos.items;
export const selectProjects = (state) => state.todos.projects;
export const selectFilter = (state) => state.todos.filter;
export const selectPriorityFilter = (state) => state.todos.priorityFilter;
export const selectProjectFilter = (state) => state.todos.projectFilter;
export const selectSortBy = (state) => state.todos.sortBy;

export const selectProjectOptions = createSelector(
  [selectProjects],
  (projects) =>
    projects.map((project) => ({
      value: project.id,
      label: project.name,
    })),
);

export const selectProjectsMap = createSelector([selectProjects], (projects) =>
  projects.reduce((acc, project) => {
    acc[project.id] = project.name;
    return acc;
  }, {}),
);

export const selectProjectFilterOptions = createSelector(
  [selectProjects],
  (projects) => [
    { value: "all", label: "All projects" },
    ...projects.map((project) => ({
      value: project.id,
      label: project.name,
    })),
  ],
);

export const selectFilteredAndSortedTodos = createSelector(
  [
    selectTodos,
    selectFilter,
    selectPriorityFilter,
    selectProjectFilter,
    selectSortBy,
  ],
  (items, filter, priorityFilter, projectFilter, sortBy) => {
    let result = [...items];

    if (filter === "active") {
      result = result.filter((todo) => !todo.completed);
    }

    if (filter === "completed") {
      result = result.filter((todo) => todo.completed);
    }

    if (priorityFilter !== "all") {
      result = result.filter((todo) => todo.priority === priorityFilter);
    }

    if (projectFilter !== "all") {
      result = result.filter((todo) => todo.projectId === projectFilter);
    }

    if (sortBy === "date-asc") {
      result.sort(
        (a, b) => getDateTimestamp(a.dueDate) - getDateTimestamp(b.dueDate),
      );
    }

    if (sortBy === "date-desc") {
      result.sort(
        (a, b) => getDateTimestamp(b.dueDate) - getDateTimestamp(a.dueDate),
      );
    }

    if (sortBy === "priority-desc") {
      result.sort(
        (a, b) => priorityRank[b.priority] - priorityRank[a.priority],
      );
    }

    if (sortBy === "priority-asc") {
      result.sort(
        (a, b) => priorityRank[a.priority] - priorityRank[b.priority],
      );
    }

    return result;
  },
);

export const selectTodosStats = createSelector([selectTodos], (todos) => {
  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  const active = total - completed;

  return {
    total,
    active,
    completed,
  };
});

export const selectHasCompletedTodos = createSelector([selectTodos], (todos) =>
  todos.some((todo) => todo.completed),
);

export const selectCanDragTodos = createSelector(
  [selectSortBy],
  (sortBy) => sortBy === "manual",
);
