import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Button, DatePicker, Input, Select, Tag } from "antd";
import dayjs from "dayjs";
import {
  DeleteOutlined,
  EditOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import { deleteTodo, setTodoStatus, updateTodo } from "./todoSlice";
import { selectProjectOptions, selectProjectsMap } from "./selectors";

const { TextArea } = Input;

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const statusOptions = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const priorityColorMap = {
  low: "default",
  medium: "gold",
  high: "red",
};

const statusColorMap = {
  todo: "default",
  in_progress: "processing",
  done: "success",
};

const statusLabelMap = {
  todo: "TO DO",
  in_progress: "IN PROGRESS",
  done: "DONE",
};

const TodoItem = ({ todo, canDrag }) => {
  const dispatch = useDispatch();
  const projectOptions = useSelector(selectProjectOptions);
  const projectsMap = useSelector(selectProjectsMap);

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(todo.text);
  const [description, setDescription] = useState(todo.description);
  const [status, setStatus] = useState(todo.status);
  const [priority, setPriority] = useState(todo.priority);
  const [dueDate, setDueDate] = useState(
    todo.dueDate ? dayjs(todo.dueDate) : null,
  );
  const [projectId, setProjectId] = useState(todo.projectId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    disabled: !canDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue =
    Boolean(todo.dueDate) &&
    todo.status !== "done" &&
    dayjs(todo.dueDate).isBefore(dayjs(), "day");

  const projectName = projectsMap[todo.projectId] || "Unknown project";

  const resetEditStateFromTodo = () => {
    setValue(todo.text);
    setDescription(todo.description);
    setStatus(todo.status);
    setPriority(todo.priority);
    setDueDate(todo.dueDate ? dayjs(todo.dueDate) : null);
    setProjectId(todo.projectId);
  };

  const handleDelete = () => {
    dispatch(deleteTodo(todo.id));
  };

  const handleQuickStatusChange = () => {
    const nextStatus =
      todo.status === "todo"
        ? "in_progress"
        : todo.status === "in_progress"
          ? "done"
          : "todo";

    dispatch(
      setTodoStatus({
        id: todo.id,
        status: nextStatus,
      }),
    );
  };

  const handleStartEdit = () => {
    resetEditStateFromTodo();
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedValue = value.trim();

    if (!trimmedValue || !projectId) {
      resetEditStateFromTodo();
      setIsEditing(false);
      return;
    }

    dispatch(
      updateTodo({
        id: todo.id,
        text: trimmedValue,
        description,
        status,
        priority,
        dueDate: dueDate ? dueDate.format("YYYY-MM-DD") : null,
        projectId,
      }),
    );

    setIsEditing(false);
  };

  const handleCancel = () => {
    resetEditStateFromTodo();
    setIsEditing(false);
  };

  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      handleSave();
    }

    if (event.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`todo-item ${isDragging ? "dragging" : ""}`}
    >
      <div className="todo-drag-handle-wrapper">
        <button
          type="button"
          className={`todo-drag-handle ${!canDrag ? "disabled" : ""}`}
          {...attributes}
          {...listeners}
          disabled={!canDrag}
          aria-label="Drag task"
          title={canDrag ? "Drag task" : "Enable manual order to drag"}
        >
          <HolderOutlined />
        </button>
      </div>

      <div className="todo-content">
        {isEditing ? (
          <div className="todo-edit-panel">
            <Input
              value={value}
              autoFocus
              size="middle"
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={handleKeyDown}
            />

            <TextArea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              autoSize={{ minRows: 3, maxRows: 5 }}
              onKeyDown={handleKeyDown}
              placeholder="Task description"
            />

            <div className="todo-edit-grid">
              <Select
                value={status}
                options={statusOptions}
                onChange={setStatus}
                className="todo-item-status-select"
              />

              <Select
                value={priority}
                options={priorityOptions}
                onChange={setPriority}
                className="todo-item-priority-select"
              />

              <DatePicker
                value={dueDate}
                format="DD MMM YYYY"
                onChange={setDueDate}
                className="todo-item-date-picker"
                placeholder="Select due date"
              />
            </div>

            <Select
              value={projectId}
              options={projectOptions}
              onChange={setProjectId}
              className="todo-item-project-select"
              placeholder="Select project"
            />

            <div className="todo-edit-actions">
              <Button type="primary" onClick={handleSave}>
                Save
              </Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="todo-title-row">
              <span
                className={`todo-text ${todo.status === "done" ? "completed" : ""}`}
                onDoubleClick={handleStartEdit}
                title="Double click to edit"
              >
                {todo.text}
              </span>
            </div>

            {todo.description && (
              <p className="todo-description">{todo.description}</p>
            )}

            <div className="todo-meta">
              <Tag color="blue">{projectName}</Tag>

              <Tag color={statusColorMap[todo.status]}>
                {statusLabelMap[todo.status]}
              </Tag>

              <Tag color={priorityColorMap[todo.priority]}>
                {todo.priority.toUpperCase()}
              </Tag>

              {todo.dueDate && (
                <Tag color={isOverdue ? "error" : "processing"}>
                  Due: {dayjs(todo.dueDate).format("DD MMM YYYY")}
                </Tag>
              )}
            </div>
          </>
        )}
      </div>

      {!isEditing && (
        <div className="todo-actions">
          <Button type="primary" onClick={handleQuickStatusChange}>
            {todo.status === "todo"
              ? "Start"
              : todo.status === "in_progress"
                ? "Complete"
                : "Reopen"}
          </Button>

          <Button icon={<EditOutlined />} onClick={handleStartEdit}>
            Edit
          </Button>

          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default TodoItem;
