import React from "react";

const DashboardLayout = ({ user, darkMode, toggleDarkMode, onLogout, children }) => {
  const styles = {
    container: {
      display: "flex",
      minHeight: "100vh",
      fontFamily: "Segoe UI, Roboto, sans-serif",
      backgroundColor: darkMode ? "#1e293b" : "#f8fafc",
      color: darkMode ? "#f8fafc" : "#1e293b",
    },
    sidebar: {
      width: "240px",
      backgroundColor: darkMode ? "#0f172a" : "#ffffff",
      padding: "2rem 1.5rem",
      boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    main: {
      flex: 1,
      padding: "2rem",
    },
    header: {
      fontSize: "1.5rem",
      fontWeight: "600",
      marginBottom: "2rem",
      borderBottom: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`,
      paddingBottom: "0.75rem",
    },
    userSection: {
      fontSize: "0.9rem",
      color: darkMode ? "#94a3b8" : "#475569",
      marginBottom: "2rem",
    },
    button: {
      padding: "0.5rem 1rem",
      marginBottom: "0.5rem",
      fontSize: "0.9rem",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "background-color 0.2s ease-in-out",
    },
    toggleBtn: {
      backgroundColor: darkMode ? "#334155" : "#e2e8f0",
      color: darkMode ? "#f8fafc" : "#1e293b",
    },
    logoutBtn: {
      backgroundColor: "#ef4444",
      color: "#fff",
    },
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div>
          <h2 style={styles.header}>📋 Dashboard</h2>
          <div style={styles.userSection}>Logged in as: <br /> <strong>{user?.email}</strong></div>
        </div>
        <div>
          <button
            style={{ ...styles.button, ...styles.toggleBtn }}
            onClick={toggleDarkMode}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button
            style={{ ...styles.button, ...styles.logoutBtn }}
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
