import TodoForm from "./features/todos/TodoForm";
import TodoList from "./features/todos/TodoList";
import "./index.css";

function App() {
  return (
    <main className="app">
      <div className="app-container">
        <TodoForm />
        <TodoList />
      </div>
    </main>
  );
}

export default App;
