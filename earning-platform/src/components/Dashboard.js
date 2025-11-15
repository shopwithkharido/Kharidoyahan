import React, { useState, useEffect } from 'react';

function Dashboard({ user, onLogout, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [proof, setProof] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('upi');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTasks();
    fetchSubmissions();
    fetchTransactions();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        onUpdateUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.filter(task => task.status === 'active'));
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/submissions/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/transactions/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId: selectedTask.id,
          proof,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Task submitted successfully! Waiting for approval.' });
        setProof('');
        setSelectedTask(null);
        fetchSubmissions();
      } else {
        setMessage({ type: 'error', text: data.message || 'Submission failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const amount = parseFloat(withdrawAmount);
    if (amount < 100) {
      setMessage({ type: 'error', text: 'Minimum withdrawal amount is ₹100' });
      setLoading(false);
      return;
    }

    if (amount > user.wallet) {
      setMessage({ type: 'error', text: 'Insufficient balance' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/transactions/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          method: withdrawMethod,
          details: withdrawDetails,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Withdrawal request submitted successfully!' });
        setWithdrawAmount('');
        setWithdrawDetails('');
        fetchTransactions();
        fetchUserData();
      } else {
        setMessage({ type: 'error', text: data.message || 'Withdrawal failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
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
      'completed': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-2xl font-bold text-indigo-600">EarnHub</span>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome, {user.name}</p>
                <p className="text-lg font-bold text-green-600">₹{user.wallet.toFixed(2)}</p>
              </div>
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
            <p className="text-gray-600 text-sm">Total Earnings</p>
            <p className="text-3xl font-bold text-green-600">₹{user.wallet.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-gray-600 text-sm">Tasks Completed</p>
            <p className="text-3xl font-bold text-indigo-600">{user.tasksCompleted || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-gray-600 text-sm">Pending Tasks</p>
            <p className="text-3xl font-bold text-yellow-600">
              {submissions.filter(s => s.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <p className="text-gray-600 text-sm">Available Tasks</p>
            <p className="text-3xl font-bold text-blue-600">{tasks.length}</p>
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
                Available Tasks
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-6 py-4 font-medium ${activeTab === 'submissions' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
              >
                My Submissions
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`px-6 py-4 font-medium ${activeTab === 'wallet' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
              >
                Wallet
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'tasks' && (
              <div>
                {selectedTask ? (
                  <div>
                    <button
                      onClick={() => setSelectedTask(null)}
                      className="mb-4 text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to Tasks
                    </button>

                    <div className="bg-gray-50 p-6 rounded-lg mb-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold text-gray-900">{selectedTask.title}</h3>
                        <span className="text-2xl font-bold text-green-600">₹{selectedTask.reward}</span>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedTask.category)} mb-4`}>
                        {selectedTask.category}
                      </span>
                      <p className="text-gray-700 mb-4">{selectedTask.description}</p>
                      <div className="bg-white p-4 rounded border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                        <p className="text-gray-700 whitespace-pre-line">{selectedTask.requirements}</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmitTask}>
                      <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                          Proof of Completion (Screenshot URL, Description, etc.)
                        </label>
                        <textarea
                          value={proof}
                          onChange={(e) => setProof(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows="4"
                          placeholder="Provide proof that you completed the task..."
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:bg-gray-400"
                      >
                        {loading ? 'Submitting...' : 'Submit Task'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {tasks.length === 0 ? (
                      <p className="text-gray-600 col-span-2 text-center py-8">No tasks available at the moment.</p>
                    ) : (
                      tasks.map(task => (
                        <div key={task.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                            <span className="text-xl font-bold text-green-600">₹{task.reward}</span>
                          </div>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(task.category)} mb-3`}>
                            {task.category}
                          </span>
                          <p className="text-gray-700 mb-4 line-clamp-2">{task.description}</p>
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                          >
                            View Details & Start
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div>
                {submissions.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">You haven't submitted any tasks yet.</p>
                ) : (
                  <div className="space-y-4">
                    {submissions.map(submission => (
                      <div key={submission.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{submission.taskTitle}</h3>
                            <p className="text-sm text-gray-600">{new Date(submission.timestamp).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.status)}`}>
                              {submission.status.toUpperCase()}
                            </span>
                            <p className="text-lg font-bold text-green-600 mt-2">₹{submission.reward}</p>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-600 font-medium">Your Proof:</p>
                          <p className="text-gray-700">{submission.proof}</p>
                        </div>
                        {submission.adminNote && (
                          <div className="mt-3 bg-yellow-50 p-3 rounded">
                            <p className="text-sm text-gray-600 font-medium">Admin Note:</p>
                            <p className="text-gray-700">{submission.adminNote}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wallet' && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Withdraw Funds</h3>
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <p className="text-sm text-gray-600">Available Balance</p>
                    <p className="text-3xl font-bold text-green-600">₹{user.wallet.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-2">Minimum withdrawal: ₹100</p>
                  </div>

                  <form onSubmit={handleWithdraw}>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">Amount</label>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter amount"
                        min="100"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">Payment Method</label>
                      <select
                        value={withdrawMethod}
                        onChange={(e) => setWithdrawMethod(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="upi">UPI</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="paytm">Paytm</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">
                        {withdrawMethod === 'upi' ? 'UPI ID' : withdrawMethod === 'bank' ? 'Account Details' : 'Paytm Number'}
                      </label>
                      <input
                        type="text"
                        value={withdrawDetails}
                        onChange={(e) => setWithdrawDetails(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder={withdrawMethod === 'upi' ? 'yourname@upi' : withdrawMethod === 'bank' ? 'Account Number' : 'Mobile Number'}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold disabled:bg-gray-400"
                    >
                      {loading ? 'Processing...' : 'Request Withdrawal'}
                    </button>
                  </form>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Transaction History</h3>
                  {transactions.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">No transactions yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map(transaction => (
                        <div key={transaction.id} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900 capitalize">{transaction.type}</p>
                              <p className="text-sm text-gray-600">{new Date(transaction.timestamp).toLocaleString()}</p>
                              {transaction.method && (
                                <p className="text-xs text-gray-500 mt-1">via {transaction.method.toUpperCase()}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${transaction.type === 'earning' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.type === 'earning' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                              </p>
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
