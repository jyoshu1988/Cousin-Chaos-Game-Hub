import { requireAuth, watchUsers, logout, setupPresence } from '../app.js';
import { mountGuide } from '../guide.js';

const usersGrid = document.querySelector('#users-grid');
const logoutButton = document.querySelector('#logout-btn');

logoutButton?.addEventListener('click', logout);
mountGuide();

requireAuth((currentUser) => {
  setupPresence(currentUser.uid);

  watchUsers(currentUser.uid, (users) => {
    usersGrid.innerHTML = users
      .map(
        (user) => `
          <article class="card">
            <div class="user-emoji">${user.emoji || '🙂'}</div>
            <h3>@${user.username}</h3>
            <p>${user.displayName}</p>
            <p class="status ${user.isOnline ? 'online' : ''}">
              ${user.isOnline ? 'Online' : 'Offline'}
            </p>
            <a class="btn" href="profile.html?uid=${user.uid}">View Profile</a>
          </article>
        `,
      )
      .join('');
  });
});
