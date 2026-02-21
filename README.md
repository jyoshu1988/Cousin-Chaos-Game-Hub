# Realtime Messenger (Firebase + Vanilla JS)

A complete WhatsApp-style web messaging starter using **HTML, CSS, JavaScript**, **Firebase Auth**, and **Firestore realtime listeners**.

## Project Structure

```text
.
├── index.html                # Login + signup page
├── dashboard.html            # User catalog
├── profile.html              # User profile detail page
├── chat.html                 # Realtime chat page
├── css/
│   └── styles.css            # Dark responsive UI theme
├── js/
│   ├── firebase-config.js    # Firebase initialization (placeholder config)
│   ├── app.js                # Shared helpers (auth guard, presence, utils)
│   ├── guide.js              # Fixed bottom FAQ guide panel
│   └── pages/
│       ├── auth.js           # Login/signup logic
│       ├── dashboard.js      # Users catalog + logout
│       ├── profile.js        # Profile rendering + chat navigation
│       └── chat.js           # Realtime messaging logic
└── firestore.rules           # Firestore security rules
```

## Firebase Setup Instructions

1. Create a Firebase project in [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication > Email/Password** sign-in.
3. Enable **Cloud Firestore** in production or test mode.
4. Create a web app and copy the Firebase config object.
5. Open `js/firebase-config.js` and replace all placeholder values.
6. Publish security rules:
   - Copy the contents of `firestore.rules` into Firestore Rules panel and publish.
7. Serve the project with a local HTTP server:
   - `python3 -m http.server 5500`
8. Open `http://localhost:5500` in browser.

## Firestore Data Model

### `users` collection
Document ID = `uid`

```json
{
  "uid": "auth uid",
  "email": "person@example.com",
  "username": "unique_name",
  "displayName": "Person Name",
  "emoji": "🙂",
  "createdAt": "timestamp",
  "isOnline": true,
  "lastSeen": "timestamp"
}
```

### `chats` collection
Document ID = sorted uid pair: `uidA_uidB`

```json
{
  "participants": ["uidA", "uidB"],
  "updatedAt": "timestamp"
}
```

### `chats/{chatId}/messages` subcollection

```json
{
  "senderId": "uidA",
  "text": "Hello",
  "timestamp": "timestamp"
}
```

## Feature Checklist

- Email/password signup/login with validation
- Unique username enforcement
- Dashboard listing all other users
- Profile page and chat initiation
- Realtime chat with message bubbles
- Message timestamp display
- Empty-message prevention
- Auto-scroll to latest message
- Online/offline indicator
- Fixed bottom Guide tab with accordion FAQs
- Responsive UI for desktop/mobile

## Notes

- This project is beginner-friendly and heavily commented.
- For production, consider adding Cloud Functions for account deletion and stronger profile update controls.
