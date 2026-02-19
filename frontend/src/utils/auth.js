// Simple in-memory user storage (replace with backend API later)
const USERS_KEY = 'orthovita_users';

// Get all users from localStorage
function getUsers() {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
}

// Save users to localStorage
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Validate email format
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Sign up new user
export function signUp(name, email, password) {
  if (!name.trim()) return { success: false, error: 'Name is required' };
  if (!isValidEmail(email)) return { success: false, error: 'Invalid email format' };
  if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters' };

  const users = getUsers();
  
  // Check if email already exists
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'Email already registered' };
  }

  // Create new user
  const newUser = { name, email, password };
  users.push(newUser);
  saveUsers(users);

  return { success: true, user: { name, email } };
}

// Login existing user
export function login(email, password) {
  if (!isValidEmail(email)) return { success: false, error: 'Invalid email format' };
  if (!password) return { success: false, error: 'Password is required' };

  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return { success: false, error: 'Wrong credentials. Please check your email and password.' };
  }

  if (user.password !== password) {
    return { success: false, error: 'Wrong credentials. Please check your email and password.' };
  }

  return { success: true, user: { name: user.name, email: user.email } };
}
