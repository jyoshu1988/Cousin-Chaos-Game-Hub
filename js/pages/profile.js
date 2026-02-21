import { requireAuth, getUserById, getSearchParam, setText } from '../app.js';
import { mountGuide } from '../guide.js';

const emojiEl = document.querySelector('#profile-emoji');
const backBtn = document.querySelector('#back-btn');
const chatBtn = document.querySelector('#chat-btn');

backBtn?.addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

mountGuide();

requireAuth(async (currentUser) => {
  const targetUid = getSearchParam('uid');
  if (!targetUid || targetUid === currentUser.uid) {
    window.location.href = 'dashboard.html';
    return;
  }

  const profile = await getUserById(targetUid);
  if (!profile) {
    setText('#profile-error', 'User not found.');
    return;
  }

  emojiEl.textContent = profile.emoji || '🙂';
  setText('#profile-username', `@${profile.username}`);
  setText('#profile-display-name', profile.displayName);

  chatBtn?.addEventListener('click', () => {
    window.location.href = `chat.html?uid=${targetUid}`;
  });
});
