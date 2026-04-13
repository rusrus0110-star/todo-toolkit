import { useDispatch, useSelector } from "react-redux";
import { Card, Empty, Typography } from "antd";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { moveTodo } from "./todoSlice";
import { selectCanDragTodos, selectFilteredAndSortedTodos } from "./selectors";
import TodoFilters from "./TodoFilters";
import TodoItem from "./TodoItem";

const { Title } = Typography;

const TodoList = () => {
  const dispatch = useDispatch();
  const todos = useSelector(selectFilteredAndSortedTodos);
  const canDrag = useSelector(selectCanDragTodos);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event) => {
    if (!canDrag) {
      return;
    }

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    dispatch(
      moveTodo({
        activeId: active.id,
        overId: over.id,
      }),
    );
  };

  return (
    <Card className="todo-card">
      <Title level={1} className="todo-title">
        Personal Task Manager
      </Title>

      <TodoFilters />

      <div className="todo-list">
        {todos.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={todos.map((todo) => todo.id)}
              strategy={verticalListSortingStrategy}
            >
              {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} canDrag={canDrag} />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div className="todo-empty">
            <Empty description="No tasks match the current filters" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default TodoList;
