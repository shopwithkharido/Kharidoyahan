const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');

function readJSON(file, defaultValue = []) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
  }
  return defaultValue;
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function initializeData() {
  if (!fs.existsSync(USERS_FILE)) {
    const demoUsers = [
      {
        id: '1',
        name: 'Demo User',
        email: 'user@demo.com',
        password: bcrypt.hashSync('password123', 10),
        role: 'user',
        wallet: 250.50,
        tasksCompleted: 5,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Admin User',
        email: 'admin@demo.com',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        wallet: 0,
        tasksCompleted: 0,
        createdAt: new Date().toISOString(),
      },
    ];
    writeJSON(USERS_FILE, demoUsers);
  }

  if (!fs.existsSync(TASKS_FILE)) {
    const demoTasks = [
      {
        id: '1',
        title: 'Follow us on Instagram',
        description: 'Follow our Instagram page and like our latest 3 posts',
        category: 'Social Media',
        reward: 25,
        requirements: '1. Follow @earnhub_official\n2. Like the latest 3 posts\n3. Take a screenshot showing you followed and liked',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Complete Customer Survey',
        description: 'Fill out a short survey about your shopping preferences',
        category: 'Survey',
        reward: 50,
        requirements: '1. Click the survey link\n2. Answer all questions honestly\n3. Submit the survey\n4. Provide the confirmation code',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Test Mobile App',
        description: 'Download and test our new mobile app for 10 minutes',
        category: 'App Testing',
        reward: 75,
        requirements: '1. Download the app from the link\n2. Use it for at least 10 minutes\n3. Report any bugs or issues\n4. Provide screenshots of your usage',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        title: 'Watch Product Video',
        description: 'Watch a 5-minute product demonstration video',
        category: 'Video',
        reward: 15,
        requirements: '1. Watch the entire video\n2. Answer 3 simple questions about the video\n3. Provide the completion code shown at the end',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: '5',
        title: 'Data Entry Task',
        description: 'Enter 50 product details from images into a spreadsheet',
        category: 'Data Entry',
        reward: 100,
        requirements: '1. Download the images\n2. Create a spreadsheet with product name, price, and description\n3. Enter data for all 50 products\n4. Upload the completed spreadsheet',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: '6',
        title: 'Refer a Friend',
        description: 'Invite friends to join EarnHub and earn when they complete their first task',
        category: 'Referral',
        reward: 50,
        requirements: '1. Share your referral link\n2. Your friend must sign up using your link\n3. They must complete at least one task\n4. You both get rewarded!',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];
    writeJSON(TASKS_FILE, demoTasks);
  }

  if (!fs.existsSync(SUBMISSIONS_FILE)) {
    writeJSON(SUBMISSIONS_FILE, []);
  }

  if (!fs.existsSync(TRANSACTIONS_FILE)) {
    writeJSON(TRANSACTIONS_FILE, []);
  }
}

initializeData();

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function adminMiddleware(req, res, next) {
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.id === req.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const users = readJSON(USERS_FILE);

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role: 'user',
      wallet: 0,
      tasksCompleted: 0,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeJSON(USERS_FILE, users);

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);
    const { password: _, ...userWithoutPassword } = newUser;

    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = readJSON(USERS_FILE);
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/users/me', authMiddleware, (req, res) => {
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

app.get('/api/tasks', authMiddleware, (req, res) => {
  const tasks = readJSON(TASKS_FILE);
  res.json(tasks.filter(t => t.status === 'active'));
});

app.post('/api/submissions', authMiddleware, (req, res) => {
  try {
    const { taskId, proof } = req.body;
    const users = readJSON(USERS_FILE);
    const tasks = readJSON(TASKS_FILE);
    const submissions = readJSON(SUBMISSIONS_FILE);

    const user = users.find(u => u.id === req.userId);
    const task = tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const existingSubmission = submissions.find(
      s => s.userId === req.userId && s.taskId === taskId && s.status === 'pending'
    );

    if (existingSubmission) {
      return res.status(400).json({ message: 'You already have a pending submission for this task' });
    }

    const newSubmission = {
      id: Date.now().toString(),
      userId: req.userId,
      userName: user.name,
      userEmail: user.email,
      taskId,
      taskTitle: task.title,
      reward: task.reward,
      proof,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    submissions.push(newSubmission);
    writeJSON(SUBMISSIONS_FILE, submissions);

    res.json(newSubmission);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/submissions/my', authMiddleware, (req, res) => {
  const submissions = readJSON(SUBMISSIONS_FILE);
  res.json(submissions.filter(s => s.userId === req.userId));
});

app.get('/api/transactions/my', authMiddleware, (req, res) => {
  const transactions = readJSON(TRANSACTIONS_FILE);
  res.json(transactions.filter(t => t.userId === req.userId));
});

app.post('/api/transactions/withdraw', authMiddleware, (req, res) => {
  try {
    const { amount, method, details } = req.body;
    const users = readJSON(USERS_FILE);
    const transactions = readJSON(TRANSACTIONS_FILE);

    const user = users.find(u => u.id === req.userId);

    if (amount < 100) {
      return res.status(400).json({ message: 'Minimum withdrawal amount is ₹100' });
    }

    if (amount > user.wallet) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    user.wallet -= amount;
    writeJSON(USERS_FILE, users);

    const newTransaction = {
      id: Date.now().toString(),
      userId: req.userId,
      userName: user.name,
      userEmail: user.email,
      type: 'withdrawal',
      amount,
      method,
      details,
      status: 'pending',
      timestamp: new Date().toISOString(),
    };

    transactions.push(newTransaction);
    writeJSON(TRANSACTIONS_FILE, transactions);

    res.json(newTransaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/tasks', authMiddleware, adminMiddleware, (req, res) => {
  const tasks = readJSON(TASKS_FILE);
  res.json(tasks);
});

app.post('/api/admin/tasks', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const tasks = readJSON(TASKS_FILE);
    const newTask = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    writeJSON(TASKS_FILE, tasks);
    res.json(newTask);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/admin/tasks/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const tasks = readJSON(TASKS_FILE);
    const index = tasks.findIndex(t => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }
    tasks[index] = { ...tasks[index], ...req.body };
    writeJSON(TASKS_FILE, tasks);
    res.json(tasks[index]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/admin/tasks/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const tasks = readJSON(TASKS_FILE);
    const filtered = tasks.filter(t => t.id !== req.params.id);
    writeJSON(TASKS_FILE, filtered);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/submissions', authMiddleware, adminMiddleware, (req, res) => {
  const submissions = readJSON(SUBMISSIONS_FILE);
  res.json(submissions);
});

app.put('/api/admin/submissions/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const submissions = readJSON(SUBMISSIONS_FILE);
    const users = readJSON(USERS_FILE);
    const transactions = readJSON(TRANSACTIONS_FILE);

    const submission = submissions.find(s => s.id === req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    submission.status = status;
    submission.adminNote = adminNote;

    if (status === 'approved') {
      const user = users.find(u => u.id === submission.userId);
      if (user) {
        user.wallet += submission.reward;
        user.tasksCompleted = (user.tasksCompleted || 0) + 1;

        const transaction = {
          id: Date.now().toString(),
          userId: user.id,
          type: 'earning',
          amount: submission.reward,
          status: 'completed',
          taskTitle: submission.taskTitle,
          timestamp: new Date().toISOString(),
        };
        transactions.push(transaction);
        writeJSON(TRANSACTIONS_FILE, transactions);
      }
      writeJSON(USERS_FILE, users);
    }

    writeJSON(SUBMISSIONS_FILE, submissions);
    res.json(submission);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  const users = readJSON(USERS_FILE);
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

app.get('/api/admin/withdrawals', authMiddleware, adminMiddleware, (req, res) => {
  const transactions = readJSON(TRANSACTIONS_FILE);
  res.json(transactions.filter(t => t.type === 'withdrawal'));
});

app.put('/api/admin/withdrawals/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    const transactions = readJSON(TRANSACTIONS_FILE);
    const users = readJSON(USERS_FILE);

    const transaction = transactions.find(t => t.id === req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (status === 'rejected' && transaction.status === 'pending') {
      const user = users.find(u => u.id === transaction.userId);
      if (user) {
        user.wallet += transaction.amount;
        writeJSON(USERS_FILE, users);
      }
    }

    transaction.status = status;
    writeJSON(TRANSACTIONS_FILE, transactions);
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
