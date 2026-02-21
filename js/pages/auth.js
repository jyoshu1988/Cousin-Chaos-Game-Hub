import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { auth, db, serverTimestamp } from '../firebase-config.js';
import { isUsernameTaken, redirectIfAuthenticated } from '../app.js';

redirectIfAuthenticated();

const loginForm = document.querySelector('#login-form');
const signupForm = document.querySelector('#signup-form');
const errorBox = document.querySelector('#auth-error');
const tabButtons = document.querySelectorAll('.tab-btn');

function showError(message) {
  errorBox.textContent = message;
}

// Switch between login and signup forms.
tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.target;
    tabButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach((panel) => {
      panel.hidden = panel.id !== target;
    });
    showError('');
  });
});

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  showError('');

  const email = loginForm.email.value.trim();
  const password = loginForm.password.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = 'dashboard.html';
  } catch (error) {
    showError(error.message);
  }
});

signupForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  showError('');

  const email = signupForm.email.value.trim();
  const password = signupForm.password.value;
  const username = signupForm.username.value.trim().toLowerCase();
  const displayName = signupForm.displayName.value.trim();
  const emoji = signupForm.emoji.value.trim() || '🙂';

  if (!username || username.includes(' ')) {
    showError('Username is required and must not contain spaces.');
    return;
  }

  if (await isUsernameTaken(username)) {
    showError('Username already exists. Please choose another one.');
    return;
  }

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = credential.user;

    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      username,
      displayName,
      emoji,
      createdAt: serverTimestamp(),
      isOnline: true,
      lastSeen: serverTimestamp(),
    });

    window.location.href = 'dashboard.html';
  } catch (error) {
    showError(error.message);
  }
});
