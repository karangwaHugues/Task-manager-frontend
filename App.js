import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => window.location.href = "/"} />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            token ? (
              <div className="App">
                <h1>📝 Task Manager</h1>
                <TaskForm />
                <TaskList />
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

