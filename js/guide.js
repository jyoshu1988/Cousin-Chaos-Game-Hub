/**
 * Renders and controls the fixed bottom FAQ guide panel.
 */
export function mountGuide() {
  const guideRoot = document.querySelector('#guide-root');
  if (!guideRoot) return;

  guideRoot.innerHTML = `
    <div class="guide-tab">
      <button class="btn secondary" id="guide-toggle">Guide</button>
      <div class="guide-panel" id="guide-panel">
        ${faqTemplate('How to change display name?', 'Open Firebase Console or add an edit profile screen and update the `displayName` field in the users document.')}
        ${faqTemplate('How to change emoji?', 'Update your `emoji` value in your users document. This app reads the emoji from Firestore in real time.')}
        ${faqTemplate('How to start a chat?', 'Open Dashboard, click a user card, then tap the Chat button on their profile page.')}
        ${faqTemplate('How to delete account?', 'Delete the auth user from Firebase Authentication and remove their Firestore user/chats data with a secure backend function.')}
      </div>
    </div>
  `;

  const panel = document.querySelector('#guide-panel');
  document.querySelector('#guide-toggle')?.addEventListener('click', () => {
    panel?.classList.toggle('open');
  });

  document.querySelectorAll('.faq-question').forEach((button) => {
    button.addEventListener('click', () => {
      const answer = button.nextElementSibling;
      answer?.classList.toggle('open');
    });
  });
}

function faqTemplate(question, answer) {
  return `
    <div class="faq-item">
      <button class="faq-question">${question}</button>
      <div class="faq-answer">${answer}</div>
    </div>
  `;
}
