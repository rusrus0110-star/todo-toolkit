import { useDispatch } from "react-redux";
import { Button } from "antd";
import { toggleTodo, deleteTodo } from "./todoSlice";

const TodoItem = ({ todo }) => {
  const dispatch = useDispatch();

  const handleToggle = () => {
    dispatch(toggleTodo(todo.id));
  };

  const handleDelete = () => {
    dispatch(deleteTodo(todo.id));
  };

  return (
    <div className="todo-item">
      <span className={`todo-text ${todo.completed ? "completed" : ""}`}>
        {todo.text}
      </span>

      <div className="todo-actions">
        <Button type="primary" onClick={handleToggle}>
          {todo.completed ? "Undo" : "Complete"}
        </Button>

        <Button danger onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
};

export default TodoItem;
