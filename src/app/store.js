import { configureStore } from "@reduxjs/toolkit";
import todoReducer from "../features/todos/todoSlice";

const TODOS_STORAGE_KEY = "todos-app-state";

export const store = configureStore({
  reducer: {
    todos: todoReducer,
  },
  devTools: import.meta.env.DEV,
});

store.subscribe(() => {
  try {
    const state = store.getState();
    localStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(state.todos));
  } catch (error) {
    console.error("Failed to save todos state to localStorage:", error);
  }
});
