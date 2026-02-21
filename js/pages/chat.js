import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import {
  buildChatId,
  formatTimestamp,
  getSearchParam,
  getUserById,
  requireAuth,
} from '../app.js';
import { db, serverTimestamp } from '../firebase-config.js';
import { mountGuide } from '../guide.js';

const backBtn = document.querySelector('#chat-back-btn');
const titleEl = document.querySelector('#chat-title');
const messagesEl = document.querySelector('#messages');
const form = document.querySelector('#message-form');
const input = document.querySelector('#message-input');
const errorEl = document.querySelector('#chat-error');

backBtn?.addEventListener('click', () => {
  history.back();
});

mountGuide();

requireAuth(async (currentUser) => {
  const otherUid = getSearchParam('uid');
  if (!otherUid || otherUid === currentUser.uid) {
    window.location.href = 'dashboard.html';
    return;
  }

  const otherUser = await getUserById(otherUid);
  if (!otherUser) {
    errorEl.textContent = 'Unable to open chat. User not found.';
    return;
  }

  titleEl.textContent = `Chat with ${otherUser.displayName} ${otherUser.emoji || ''}`;

  const chatId = buildChatId(currentUser.uid, otherUid);
  const chatRef = doc(db, 'chats', chatId);

  // Ensure chat document exists before using messages subcollection.
  await setDoc(
    chatRef,
    {
      participants: [currentUser.uid, otherUid],
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  const messagesQuery = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'asc'),
  );

  onSnapshot(messagesQuery, (snapshot) => {
    messagesEl.innerHTML = snapshot.docs
      .map((snap) => {
        const message = snap.data();
        const ownClass = message.senderId === currentUser.uid ? 'own' : '';
        return `
          <div class="message ${ownClass}">
            <div>${message.text}</div>
            <div class="message-meta">${formatTimestamp(message.timestamp)}</div>
          </div>
        `;
      })
      .join('');

    messagesEl.scrollTop = messagesEl.scrollHeight;
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      errorEl.textContent = 'Message cannot be empty.';
      return;
    }

    errorEl.textContent = '';

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: currentUser.uid,
      text,
      timestamp: serverTimestamp(),
    });

    await setDoc(chatRef, { updatedAt: serverTimestamp() }, { merge: true });
    form.reset();
    input.focus();
  });
});
