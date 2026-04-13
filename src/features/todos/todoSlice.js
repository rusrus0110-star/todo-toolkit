import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  filter: "all",
};

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    addTodo: {
      reducer: (state, action) => {
        state.items.unshift(action.payload);
      },
      prepare: (title) => {
        const normalizedTitle = String(title).trim();

        return {
          payload: {
            id: nanoid(),
            title: normalizedTitle,
            completed: false,
            createdAt: new Date().toISOString(),
          },
        };
      },
    },

    toggleTodo: (state, action) => {
      const todo = state.items.find((item) => item.id === action.payload);

      if (todo) {
        todo.completed = !todo.completed;
      }
    },

    deleteTodo: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },

    setFilter: (state, action) => {
      state.filter = action.payload;
    },

    clearCompleted: (state) => {
      state.items = state.items.filter((item) => !item.completed);
    },
  },
});

export const { addTodo, toggleTodo, deleteTodo, setFilter, clearCompleted } =
  todoSlice.actions;

export default todoSlice.reducer;
