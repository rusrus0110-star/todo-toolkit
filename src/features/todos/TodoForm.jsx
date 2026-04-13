import { useState } from "react";
import { useDispatch } from "react-redux";
import { Input, Button, message } from "antd";
import { addTodo } from "./todoSlice";

const TodoForm = () => {
  const [text, setText] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = () => {
    try {
      dispatch(addTodo(text));
      setText("");
    } catch (error) {
      message.error(error.message || "Failed to add todo");
    }
  };

  return (
    <div className="todo-form">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter new todo"
        size="large"
        onPressEnter={handleSubmit}
      />

      <Button
        type="primary"
        size="large"
        block
        className="add-todo-button"
        onClick={handleSubmit}
      >
        Add Todo
      </Button>
    </div>
  );
};

export default TodoForm;
