import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/tasks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
        setFilteredTasks(res.data);
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [token]);

  useEffect(() => {
    let filtered = [...tasks];

    if (priorityFilter !== 'All') {
      filtered = filtered.filter(task => task.priority === priorityFilter.toLowerCase());
    }

    if (statusFilter === 'Completed') {
      filtered = filtered.filter(task => task.completed);
    } else if (statusFilter === 'Pending') {
      filtered = filtered.filter(task => !task.completed);
    }

    setFilteredTasks(filtered);
  }, [priorityFilter, statusFilter, tasks]);

  if (loading) return <p style={{ padding: '2rem' }}>Loading dashboard...</p>;
  if (error) return <p style={{ padding: '2rem', color: 'red' }}>{error}</p>;

  const total = filteredTasks.length;
  const completed = filteredTasks.filter(t => t.completed).length;
  const pending = filteredTasks.filter(t => !t.completed).length;
  const overdue = filteredTasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length;

  const priorityData = [
    { name: 'Low', value: filteredTasks.filter(t => t.priority === 'low').length },
    { name: 'Medium', value: filteredTasks.filter(t => t.priority === 'medium').length },
    { name: 'High', value: filteredTasks.filter(t => t.priority === 'high').length }
  ];

  const COLORS = ['#28a745', '#ffc107', '#dc3545'];

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Dashboard</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label htmlFor="priorityFilter" style={{ marginRight: '0.5rem' }}>
            Priority:
          </label>
          <select
            id="priorityFilter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={selectStyle}
          >
            <option>All</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div>
          <label htmlFor="statusFilter" style={{ marginRight: '0.5rem' }}>
            Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option>All</option>
            <option>Completed</option>
            <option>Pending</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={cardStyle}>Total: {total}</div>
        <div style={cardStyle}>Completed: {completed}</div>
        <div style={cardStyle}>Pending: {pending}</div>
        <div style={cardStyle}>Overdue: {overdue}</div>
      </div>

      {/* Charts */}
      <div style={{ display: 'flex', marginTop: '2rem', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ width: '300px', height: '300px' }}>
          <h4>Priority Distribution</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={priorityData} dataKey="value" nameKey="name" outerRadius={100}>
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  backgroundColor: '#f8f9fa',
  padding: '1rem 2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  fontSize: '1.1rem',
  flex: '1'
};

const selectStyle = {
  padding: '0.5rem',
  borderRadius: '5px',
  border: '1px solid #ccc'
};

export default Dashboard;
