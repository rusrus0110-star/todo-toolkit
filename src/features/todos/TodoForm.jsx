import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, DatePicker, Input, Select, message } from "antd";
import dayjs from "dayjs";
import { addProject, addTodo } from "./todoSlice";
import { selectProjectOptions, selectProjects } from "./selectors";

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const TodoForm = () => {
  const dispatch = useDispatch();
  const projects = useSelector(selectProjects);
  const projectOptions = useSelector(selectProjectOptions);

  const defaultProjectId = useMemo(() => projects[0]?.id ?? null, [projects]);

  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState(null);
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  const resetTaskForm = () => {
    setText("");
    setPriority("medium");
    setDueDate(null);
  };

  const handleCreateProject = () => {
    const value = newProjectName.trim();

    if (!value) {
      message.error("Project name cannot be empty");
      return;
    }

    const duplicateProject = projects.find(
      (project) => project.name.toLowerCase() === value.toLowerCase(),
    );

    if (duplicateProject) {
      setProjectId(duplicateProject.id);
      setNewProjectName("");
      setIsCreatingProject(false);
      message.info("Project already exists and has been selected");
      return;
    }

    try {
      const action = dispatch(addProject({ name: value }));
      const createdProjectId = action.payload?.id;

      if (createdProjectId) {
        setProjectId(createdProjectId);
      }

      setNewProjectName("");
      setIsCreatingProject(false);
      message.success("Project created");
    } catch (error) {
      message.error(error.message || "Failed to create project");
    }
  };

  const handleSubmit = () => {
    if (!projectId) {
      message.error("Please select or create a project first");
      return;
    }

    try {
      dispatch(
        addTodo({
          text,
          priority,
          dueDate: dueDate ? dueDate.format("YYYY-MM-DD") : null,
          projectId,
        }),
      );

      resetTaskForm();
    } catch (error) {
      message.error(error.message || "Failed to add todo");
    }
  };

  return (
    <div className="todo-form">
      <div className="todo-form-stack">
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Enter new task"
          size="large"
          onPressEnter={handleSubmit}
        />

        <div className="todo-form-row">
          <Select
            value={priority}
            size="large"
            onChange={setPriority}
            options={priorityOptions}
            className="todo-priority-select"
          />

          <DatePicker
            value={dueDate ? dayjs(dueDate) : null}
            size="large"
            format="DD MMM YYYY"
            onChange={(value) => setDueDate(value)}
            className="todo-date-picker"
            placeholder="Select due date"
          />
        </div>

        <div className="todo-project-row">
          <Select
            value={projectId}
            size="large"
            onChange={setProjectId}
            options={projectOptions}
            className="todo-project-select"
            placeholder="Select project"
          />

          <Button
            size="large"
            onClick={() => setIsCreatingProject((prev) => !prev)}
          >
            {isCreatingProject ? "Cancel" : "New Project"}
          </Button>
        </div>

        {isCreatingProject && (
          <div className="todo-new-project-row">
            <Input
              value={newProjectName}
              size="large"
              placeholder="Enter project name"
              onChange={(event) => setNewProjectName(event.target.value)}
              onPressEnter={handleCreateProject}
            />

            <Button type="primary" size="large" onClick={handleCreateProject}>
              Create
            </Button>
          </div>
        )}

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
    </div>
  );
};

export default TodoForm;
