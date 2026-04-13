import { createSelector } from "@reduxjs/toolkit";

export const selectTodosState = (state) => state.todos;
export const selectTodos = (state) => state.todos.items;
export const selectFilter = (state) => state.todos.filter;

export const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (items, filter) => {
    switch (filter) {
      case "active":
        return items.filter((todo) => !todo.completed);

      case "completed":
        return items.filter((todo) => todo.completed);

      case "all":
      default:
        return items;
    }
  },
);

export const selectTodosCount = createSelector([selectTodos], (items) => ({
  total: items.length,
  active: items.filter((todo) => !todo.completed).length,
  completed: items.filter((todo) => todo.completed).length,
}));
