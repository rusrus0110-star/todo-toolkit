import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  items: [
    { id: "1", text: "Todo 1", completed: false },
    { id: "2", text: "Todo 2", completed: false },
    { id: "3", text: "Todo 3", completed: true },
  ],
};

const todoSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    addTodo: {
      reducer: (state, action) => {
        state.items.push(action.payload);
      },
      prepare: (text) => {
        const value = text?.trim();

        if (!value) {
          throw new Error("Todo text cannot be empty");
        }

        return {
          payload: {
            id: nanoid(),
            text: value,
            completed: false,
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
  },
});

export const { addTodo, toggleTodo, deleteTodo } = todoSlice.actions;
export default todoSlice.reducer;
