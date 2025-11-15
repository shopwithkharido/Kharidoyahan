import React, { useState, useEffect } from 'react';

function AdminPanel({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    category: 'Social Media',
    reward: '',
    requirements: '',
    status: 'active',
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTasks();
    fetchSubmissions();
    fetchUsers();
    fetchWithdrawals();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/tasks', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/submissions', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/withdrawals', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data);
      }
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const url = editingTask 
        ? `http://localhost:5000/api/admin/tasks/${editingTask.id}`
        : 'http://localhost:5000/api/admin/tasks';
      
      const response = await fetch(url, {
        method: editingTask ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...taskForm,
          reward: parseFloat(taskForm.reward),
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Task ${editingTask ? 'updated' : 'created'} successfully!` });
        setShowTaskForm(false);
        setEditingTask(null);
        setTaskForm({
          title: '',
          description: '',
          category: 'Social Media',
          reward: '',
          requirements: '',
          status: 'active',
        });
        fetchTasks();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.message || 'Operation failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error. Please try again.' });
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Task deleted successfully!' });
        fetchTasks();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete task' });
    }
  };

  const handleReviewSubmission = async (submissionId, status, adminNote = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminNote }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Submission ${status}!` });
        fetchSubmissions();
        fetchUsers();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update submission' });
    }
  };

  const handleWithdrawalAction = async (transactionId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/withdrawals/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Withdrawal ${status}!` });
        fetchWithdrawals();
        fetchUsers();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update withdrawal' });
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Social Media': 'bg-blue-100 text-blue-800',
      'Survey': 'bg-green-100 text-green-800',
      'App Testing': 'bg-purple-100 text-purple-800',
      'Data Entry': 'bg-yellow-100 text-yellow-800',
      'Video': 'bg-red-100 text-red-800',
      'Referral': 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'completed': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-indigo-600">EarnHub Admin</span>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Admin: {user.name}</span>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-gray-600 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-indigo-600">{users.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-gray-600 text-sm">Active Tasks</p>
            <p className="text-3xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'active').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-gray-600 text-sm">Pending Submissions</p>
            <p className="text-3xl font-bold text-yellow-600">
              {submissions.filter(s => s.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-gray-600 text-sm">Pending Withdrawals</p>
            <p className="text-3xl font-bold text-red-600">
              {withdrawals.filter(w => w.status === 'pending').length}
            </p>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-6 py-4 font-medium ${activeTab === 'tasks' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-6 py-4 font-medium ${activeTab === 'submissions' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
              >
                Submissions
              </button>
              <button
                onClick={() => setActiveTab('withdrawals')}
                className={`px-6 py-4 font-medium ${activeTab === 'withdrawals' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
              >
                Withdrawals
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 font-medium ${activeTab === 'users' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
              >
                Users
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'tasks' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Manage Tasks</h3>
                  <button
                    onClick={() => {
                      setShowTaskForm(!showTaskForm);
                      setEditingTask(null);
                      setTaskForm({
                        title: '',
                        description: '',
                        category: 'Social Media',
                        reward: '',
                        requirements: '',
                        status: 'active',
                      });
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {showTaskForm ? 'Cancel' : 'Create New Task'}
                  </button>
                </div>

                {showTaskForm && (
                  <form onSubmit={handleTaskSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">
                      {editingTask ? 'Edit Task' : 'Create New Task'}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Title</label>
                        <input
                          type="text"
                          value={taskForm.title}
                          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Category</label>
                        <select
                          value={taskForm.category}
                          onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option>Social Media</option>
                          <option>Survey</option>
                          <option>App Testing</option>
                          <option>Data Entry</option>
                          <option>Video</option>
                          <option>Referral</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Reward (₹)</label>
                        <input
                          type="number"
                          value={taskForm.reward}
                          onChange={(e) => setTaskForm({ ...taskForm, reward: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Status</label>
                        <select
                          value={taskForm.status}
                          onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 font-medium mb-2">Description</label>
                        <textarea
                          value={taskForm.description}
                          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows="3"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 font-medium mb-2">Requirements</label>
                        <textarea
                          value={taskForm.requirements}
                          onChange={(e) => setTaskForm({ ...taskForm, requirements: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows="3"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </button>
                  </form>
                )}

                <div className="space-y-4">
                  {tasks.map(task => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{task.title}</h4>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(task.category)} mt-2`}>
                            {task.category}
                          </span>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)} ml-2 mt-2`}>
                            {task.status}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-green-600">₹{task.reward}</p>
                          <div className="mt-2 space-x-2">
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setTaskForm(task);
                                setShowTaskForm(true);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{task.description}</p>
                      <p className="text-sm text-gray-600">Requirements: {task.requirements}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Review Submissions</h3>
                <div className="space-y-4">
                  {submissions.map(submission => (
                    <div key={submission.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">{submission.taskTitle}</h4>
                          <p className="text-sm text-gray-600">User: {submission.userName} ({submission.userEmail})</p>
                          <p className="text-sm text-gray-600">{new Date(submission.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.status)}`}>
                            {submission.status.toUpperCase()}
                          </span>
                          <p className="text-lg font-bold text-green-600 mt-2">₹{submission.reward}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded mb-3">
                        <p className="text-sm text-gray-600 font-medium">Proof:</p>
                        <p className="text-gray-700">{submission.proof}</p>
                      </div>
                      {submission.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleReviewSubmission(submission.id, 'approved', 'Great work!')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const note = prompt('Enter rejection reason:');
                              if (note) handleReviewSubmission(submission.id, 'rejected', note);
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'withdrawals' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Manage Withdrawals</h3>
                <div className="space-y-4">
                  {withdrawals.map(withdrawal => (
                    <div key={withdrawal.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-lg font-bold text-gray-900">{withdrawal.userName}</p>
                          <p className="text-sm text-gray-600">{withdrawal.userEmail}</p>
                          <p className="text-sm text-gray-600">{new Date(withdrawal.timestamp).toLocaleString()}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            Method: {withdrawal.method?.toUpperCase()} - {withdrawal.details}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-red-600">₹{withdrawal.amount.toFixed(2)}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(withdrawal.status)} mt-2`}>
                            {withdrawal.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      {withdrawal.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleWithdrawalAction(withdrawal.id, 'completed')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Mark as Completed
                          </button>
                          <button
                            onClick={() => handleWithdrawalAction(withdrawal.id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">User Management</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wallet</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tasks</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.filter(u => u.role !== 'admin').map(user => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">₹{user.wallet.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.tasksCompleted || 0}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
