import React, { useEffect, useState, useCallback, useMemo } from "react";
import "./App.css";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import LoginForm from "./components/Login";
import { getTasks, createTask, updateTask, deleteTask } from "./api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("latest");

  const fetchTasks = useCallback(
    async (authToken = token) => {
      if (!authToken) return;
      try {
        setLoading(true);
        setError(null);
        const response = await getTasks(authToken);
        setTasks(response.data || []);
      } catch (err) {
        console.error("Error loading tasks:", err);
        setError("Failed to load tasks");
        if (err.response?.status === 401) handleLogout();
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const savedTheme = localStorage.getItem("darkMode");

    if (savedTheme === "true") setDarkMode(true);

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setShowLogin(false);
        fetchTasks(savedToken);
      } catch (err) {
        console.error("Error loading session:", err);
        handleLogout();
      }
    }
  }, [fetchTasks]);

  // UseMemo for filtered tasks
  const filteredTasks = useMemo(() => {
    let temp = [...tasks];

    if (searchTerm) {
      temp = temp.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      temp = temp.filter((task) =>
        statusFilter === "completed" ? task.completed : !task.completed
      );
    }

    if (sortOption === "latest") {
      temp.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === "oldest") {
      temp.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOption === "a-z") {
      temp.sort((a, b) => a.title.localeCompare(b.title));
    }

    return temp;
  }, [tasks, searchTerm, statusFilter, sortOption]);

  const handleLogin = (userData, userToken) => {
    if (!userData || !userToken) {
      setError("Invalid login data");
      return;
    }
    setUser(userData);
    setToken(userToken);
    setShowLogin(false);
    setError(null);
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(userData));
    fetchTasks(userToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setTasks([]);
    setShowLogin(true);
    setError(null);
    localStorage.clear();
  };

  const handleAddTask = async (taskData) => {
    if (!token) {
      setError("Please log in to add tasks");
      return;
    }
    try {
      const response = await createTask(taskData, token);
      setTasks((prev) => [...prev, response.data]);
    } catch (err) {
      console.error("Error adding task:", err);
      setError("Failed to create task");
      if (err.response?.status === 401) handleLogout();
    }
  };

  const handleToggleComplete = async (id, completed) => {
    if (!token) return;
    try {
      const response = await updateTask(id, { completed }, token);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? response.data : task))
      );
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task");
      if (err.response?.status === 401) handleLogout();
    }
  };

  const handleDelete = async (id) => {
    if (!token) return;
    try {
      await deleteTask(id, token);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task");
      if (err.response?.status === 401) handleLogout();
    }
  };

  // New handleEdit for editing tasks
  const handleEdit = async (id, updatedData) => {
    if (!token) return;
    try {
      const response = await updateTask(id, updatedData, token);
      setTasks((prev) =>
        prev.map((task) => (task.id === id ? response.data : task))
      );
    } catch (err) {
      console.error("Error editing task:", err);
      setError("Failed to edit task");
      if (err.response?.status === 401) handleLogout();
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", newMode);
      return newMode;
    });
  };

  const styles = {
    layout: {
      display: "flex",
      minHeight: "100vh",
      backgroundColor: darkMode ? "#111827" : "#f9fafb",
      color: darkMode ? "#f3f4f6" : "#111827",
    },
    sidebar: {
      width: "250px",
      backgroundColor: "#1f2937",
      color: "#fff",
      padding: "2rem 1rem",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    main: {
      flex: 1,
      padding: "2rem",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "2rem",
    },
    filterBar: {
      display: "flex",
      gap: "1rem",
      marginBottom: "1.5rem",
      flexWrap: "wrap",
    },
    input: {
      padding: "0.5rem",
      borderRadius: "5px",
      border: "1px solid #ccc",
      fontSize: "14px",
    },
    error: {
      backgroundColor: "#f87171",
      color: "#fff",
      padding: "0.5rem 1rem",
      borderRadius: "5px",
      marginBottom: "1rem",
    },
    loading: {
      fontStyle: "italic",
      marginBottom: "1rem",
    },
  };

  if (showLogin) {
    return (
      <div className="App" style={styles.layout}>
        <div style={{ margin: "auto", textAlign: "center" }}>
          <h1>📝 Task Manager</h1>
          {error && <div style={styles.error}>{error}</div>}
          <LoginForm onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="App" style={styles.layout}>
      <aside style={styles.sidebar}>
        <div>
          <h2>📋 Dashboard</h2>
          <p>👤 {user?.email}</p>
        </div>
        <div>
          <button onClick={toggleDarkMode} aria-pressed={darkMode}>
            🌓 Toggle Theme
          </button>
          <button onClick={handleLogout} style={{ marginTop: "1rem" }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <h1>Task Manager</h1>
        </header>

        <div style={styles.filterBar}>
          <input
            type="text"
            placeholder="🔍 Search task..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.input}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            style={styles.input}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="a-z">A - Z</option>
          </select>
        </div>

        <TaskForm onAdd={handleAddTask} />

        {error && <div style={styles.error}>{error}</div>}
        {loading ? (
          <p style={styles.loading}>Loading...</p>
        ) : filteredTasks.length === 0 ? (
          <p>No tasks to show</p>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onToggle={handleToggleComplete}
            onDelete={handleDelete}
            onEdit={handleEdit} // passed handleEdit here
          />
        )}
      </main>
    </div>
  );
}

export default App;
