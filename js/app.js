/**
 * Shared application helpers used across pages.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import {
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { auth, db, serverTimestamp } from './firebase-config.js';

/**
 * Guard pages that require a logged-in user.
 * Redirects to index page when user is not authenticated.
 */
export function requireAuth(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    await setOnlineStatus(user.uid, true);
    callback(user);
  });
}

/**
 * Monitor auth state for public pages.
 */
export function redirectIfAuthenticated(target = 'dashboard.html') {
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = target;
  });
}

/**
 * Updates online state in Firestore.
 */
export async function setOnlineStatus(uid, isOnline) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    isOnline,
    lastSeen: serverTimestamp(),
  }).catch(async () => {
    // Create the record if it does not yet exist.
    await setDoc(
      userRef,
      {
        isOnline,
        lastSeen: serverTimestamp(),
      },
      { merge: true },
    );
  });
}

/**
 * Attach listeners that set user offline when tab closes or signs out.
 */
export function setupPresence(uid) {
  window.addEventListener('beforeunload', () => {
    navigator.sendBeacon?.('/'); // harmless keepalive in some browsers
    setOnlineStatus(uid, false);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') setOnlineStatus(uid, false);
    if (document.visibilityState === 'visible') setOnlineStatus(uid, true);
  });
}

/**
 * Sign out helper.
 */
export async function logout() {
  if (auth.currentUser) await setOnlineStatus(auth.currentUser.uid, false);
  await signOut(auth);
  window.location.href = 'index.html';
}

/**
 * Returns user profile data by uid.
 */
export async function getUserById(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? snapshot.data() : null;
}

/**
 * Returns a deterministic chat id for two users.
 */
export function buildChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

/**
 * Observe all users except the current user.
 */
export function watchUsers(currentUid, handler) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('uid', '!=', currentUid), limit(100));
  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs
      .map((docItem) => docItem.data())
      .sort((a, b) => a.username.localeCompare(b.username));
    handler(users);
  });
}

/**
 * Check if username already exists in Firestore.
 */
export async function isUsernameTaken(username) {
  const q = query(collection(db, 'users'), where('username', '==', username));
  const result = await getDocs(q);
  return !result.empty;
}

/**
 * Read params from URL.
 */
export function getSearchParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Utility to safely set text in a DOM element.
 */
export function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

/**
 * Format Firestore timestamp object into readable time.
 */
export function formatTimestamp(timestamp) {
  if (!timestamp?.toDate) return '';
  return new Intl.DateTimeFormat([], {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp.toDate());
}
