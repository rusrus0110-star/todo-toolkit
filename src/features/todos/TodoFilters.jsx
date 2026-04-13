import { useDispatch, useSelector } from "react-redux";
import { Alert, Button, Select, Space } from "antd";
import {
  clearCompleted,
  setFilter,
  setPriorityFilter,
  setProjectFilter,
  setSortBy,
} from "./todoSlice";
import {
  selectCanDragTodos,
  selectFilter,
  selectHasCompletedTodos,
  selectPriorityFilter,
  selectProjectFilter,
  selectProjectFilterOptions,
  selectSortBy,
  selectTodosStats,
} from "./selectors";

const sortOptions = [
  { value: "manual", label: "Manual order" },
  { value: "date-asc", label: "Due date: nearest first" },
  { value: "date-desc", label: "Due date: latest first" },
  { value: "priority-desc", label: "Priority: high to low" },
  { value: "priority-asc", label: "Priority: low to high" },
];

const priorityFilterOptions = [
  { value: "all", label: "All priorities" },
  { value: "high", label: "High priority" },
  { value: "medium", label: "Medium priority" },
  { value: "low", label: "Low priority" },
];

const TodoFilters = () => {
  const dispatch = useDispatch();

  const currentFilter = useSelector(selectFilter);
  const currentPriorityFilter = useSelector(selectPriorityFilter);
  const currentProjectFilter = useSelector(selectProjectFilter);
  const currentSortBy = useSelector(selectSortBy);
  const projectFilterOptions = useSelector(selectProjectFilterOptions);
  const stats = useSelector(selectTodosStats);
  const hasCompletedTodos = useSelector(selectHasCompletedTodos);
  const canDragTodos = useSelector(selectCanDragTodos);

  return (
    <div className="todo-filters-wrapper">
      <div className="todo-stats">
        <span>Total: {stats.total}</span>
        <span>Active: {stats.active}</span>
        <span>Completed: {stats.completed}</span>
      </div>

      <div className="todo-controls-row">
        <Space wrap className="todo-filters">
          <Button
            type={currentFilter === "all" ? "primary" : "default"}
            disabled={currentFilter === "all"}
            onClick={() => dispatch(setFilter("all"))}
          >
            All
          </Button>

          <Button
            type={currentFilter === "active" ? "primary" : "default"}
            disabled={currentFilter === "active"}
            onClick={() => dispatch(setFilter("active"))}
          >
            Active
          </Button>

          <Button
            type={currentFilter === "completed" ? "primary" : "default"}
            disabled={currentFilter === "completed"}
            onClick={() => dispatch(setFilter("completed"))}
          >
            Completed
          </Button>

          <Button
            danger
            disabled={!hasCompletedTodos}
            onClick={() => dispatch(clearCompleted())}
          >
            Clear Completed
          </Button>
        </Space>

        <div className="todo-selects-group">
          <Select
            value={currentProjectFilter}
            options={projectFilterOptions}
            onChange={(value) => dispatch(setProjectFilter(value))}
            className="todo-project-filter"
          />

          <Select
            value={currentPriorityFilter}
            options={priorityFilterOptions}
            onChange={(value) => dispatch(setPriorityFilter(value))}
            className="todo-priority-filter"
          />

          <Select
            value={currentSortBy}
            options={sortOptions}
            onChange={(value) => dispatch(setSortBy(value))}
            className="todo-sort-select"
          />
        </div>
      </div>

      {!canDragTodos && (
        <Alert
          type="info"
          showIcon
          className="todo-drag-alert"
          title="Drag & drop is available only in Manual order mode."
        />
      )}
    </div>
  );
};

export default TodoFilters;
