import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Button, Input, Select, Space } from "antd";
import {
  clearDoneTasks,
  setPriorityFilter,
  setProjectFilter,
  setSearchQuery,
  setSortBy,
  setStatusFilter,
} from "./todoSlice";
import {
  selectCanDragTodos,
  selectHasDoneTasks,
  selectPriorityFilter,
  selectProjectFilter,
  selectProjectFilterOptions,
  selectSearchQuery,
  selectSortBy,
  selectStatusFilter,
  selectTodosStats,
} from "./selectors";

const statusFilterOptions = [
  { value: "all", label: "All statuses" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const priorityFilterOptions = [
  { value: "all", label: "All priorities" },
  { value: "high", label: "High priority" },
  { value: "medium", label: "Medium priority" },
  { value: "low", label: "Low priority" },
];

const sortOptions = [
  { value: "manual", label: "Manual order" },
  { value: "date-asc", label: "Due date: nearest first" },
  { value: "date-desc", label: "Due date: latest first" },
  { value: "priority-desc", label: "Priority: high to low" },
  { value: "priority-asc", label: "Priority: low to high" },
];

const TodoFilters = () => {
  const dispatch = useDispatch();

  const currentStatusFilter = useSelector(selectStatusFilter);
  const currentPriorityFilter = useSelector(selectPriorityFilter);
  const currentProjectFilter = useSelector(selectProjectFilter);
  const currentSortBy = useSelector(selectSortBy);
  const currentSearchQuery = useSelector(selectSearchQuery);
  const projectFilterOptions = useSelector(selectProjectFilterOptions);
  const stats = useSelector(selectTodosStats);
  const hasDoneTasks = useSelector(selectHasDoneTasks);
  const canDragTodos = useSelector(selectCanDragTodos);

  const [searchInput, setSearchInput] = useState(currentSearchQuery);

  useEffect(() => {
    setSearchInput(currentSearchQuery);
  }, [currentSearchQuery]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      dispatch(setSearchQuery(searchInput));
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [dispatch, searchInput]);

  return (
    <div className="todo-filters-wrapper">
      <div className="todo-stats">
        <span>Total: {stats.total}</span>
        <span>To do: {stats.todo}</span>
        <span>In progress: {stats.inProgress}</span>
        <span>Done: {stats.done}</span>
      </div>

      <div className="todo-search-row">
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search by title or description"
          size="large"
          allowClear
        />
      </div>

      <div className="todo-controls-row">
        <Space wrap className="todo-filters">
          <Button
            danger
            disabled={!hasDoneTasks}
            onClick={() => dispatch(clearDoneTasks())}
          >
            Clear Done
          </Button>
        </Space>

        <div className="todo-selects-group">
          <Select
            value={currentStatusFilter}
            options={statusFilterOptions}
            onChange={(value) => dispatch(setStatusFilter(value))}
            className="todo-status-filter"
          />

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
