import { useSelector } from "react-redux";
import { Card, Typography } from "antd";
import { selectTodos } from "./selectors";
import TodoItem from "./TodoItem";

const { Title } = Typography;

const TodoList = () => {
  const todos = useSelector(selectTodos);

  return (
    <Card className="todo-card">
      <Title level={1} className="todo-title">
        Todo List
      </Title>

      <div className="todo-list">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>
    </Card>
  );
};

export default TodoList;
