const KEYS = {
  users: "fcs_users",
  current: "fcs_current_user"
};

const SERVICES = [
  "Script Generator",
  "Voice Generator",
  "Image Generator",
  "Video Generator",
  "Subtitle Generator",
  "Thumbnail Tools",
  "Idea Generator",
  "Hook Generator",
  "Caption Generator",
  "Title Optimizer",
  "Hashtag Builder",
  "Trend Scanner"
];

function getUsers() {
  return JSON.parse(localStorage.getItem(KEYS.users) || "[]");
}

function setUsers(users) {
  localStorage.setItem(KEYS.users, JSON.stringify(users));
}

function getCurrentUsername() {
  return localStorage.getItem(KEYS.current);
}

function setCurrentUsername(username) {
  localStorage.setItem(KEYS.current, username);
}

function currentUser() {
  const username = getCurrentUsername();
  if (!username) return null;
  return getUsers().find((user) => user.username === username) || null;
}

function requireAuth() {
  if (!currentUser()) {
    window.location.href = "index.html";
  }
}

function toast(message) {
  const toastElement = document.getElementById("toast");
  if (!toastElement) return;
  toastElement.textContent = message;
  toastElement.classList.add("show");
  setTimeout(() => toastElement.classList.remove("show"), 2000);
}

function showLoader(state) {
  const loader = document.getElementById("loader");
  if (!loader) return;
  loader.classList.toggle("hidden", !state);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getServiceTools(serviceName) {
  return {
    free: [
      {
        name: `${serviceName} Lite` ,
        description: "Quick output template with basic controls.",
        howTo: "Paste your topic, pick niche, generate first draft.",
        link: "https://example.com/free-tool"
      },
      {
        name: `${serviceName} Assistant`,
        description: "Guided creation flow for fast publishing.",
        howTo: "Follow 3 prompts and copy the final output.",
        link: "https://example.com/free-assistant"
      }
    ],
    paid: [
      {
        name: `${serviceName} Pro Engine`,
        description: "Advanced controls, export packs, quality filters.",
        howTo: "Set style profile, run generation, export multi-format assets.",
        link: "https://example.com/pro-engine"
      },
      {
        name: `${serviceName} Studio+`,
        description: "Team-grade premium workflow with variants.",
        howTo: "Select campaign mode and auto-generate 10 versions.",
        link: "https://example.com/studio-plus"
      }
    ]
  };
}

function renderToolCards(tools, container) {
  container.innerHTML = tools
    .map(
      (tool) => `
      <article class="tool-card">
        <h3>${tool.name}</h3>
        <p>${tool.description}</p>
        <p><strong>How to use:</strong> ${tool.howTo}</p>
        <a href="${tool.link}" target="_blank" rel="noopener" class="btn">Open Tool</a>
      </article>
    `
    )
    .join("");
}

async function initAuthPage() {
  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const userInput = document.getElementById("username");
  const passInput = document.getElementById("password");
  const status = document.getElementById("authStatus");

  if (!signupBtn || !loginBtn) return;

  const readInputs = () => ({
    username: userInput.value.trim(),
    password: passInput.value.trim()
  });

  signupBtn.addEventListener("click", () => {
    const { username, password } = readInputs();
    if (!username || !password) {
      status.textContent = "Please enter username and password.";
      toast("Missing fields");
      return;
    }

    const users = getUsers();
    if (users.some((u) => u.username === username)) {
      status.textContent = "Username already exists.";
      toast("Signup failed");
      return;
    }

    users.push({ username, password, savedItems: [] });
    setUsers(users);
    status.textContent = "Signup successful. Please login.";
    toast("Account created");
  });

  loginBtn.addEventListener("click", async () => {
    const { username, password } = readInputs();
    const user = getUsers().find((u) => u.username === username && u.password === password);

    if (!user) {
      status.textContent = "Wrong credentials.";
      toast("Invalid login");
      return;
    }

    showLoader(true);
    await delay(1200 + Math.floor(Math.random() * 800));
    setCurrentUsername(username);
    window.location.href = "dashboard.html";
  });
}

function initDashboardPage() {
  requireAuth();
  const user = currentUser();
  if (!user) return;

  const welcome = document.getElementById("welcomeText");
  const grid = document.getElementById("serviceGrid");
  const logoutBtn = document.getElementById("logoutBtn");

  if (welcome) welcome.textContent = `Welcome back, ${user.username}.`;

  if (grid) {
    grid.innerHTML = SERVICES.map(
      (service) => `
      <button class="service-card">${service}</button>
    `
    ).join("");

    [...grid.querySelectorAll(".service-card")].forEach((button) => {
      button.addEventListener("click", () => {
        const name = encodeURIComponent(button.textContent.trim());
        window.location.href = `service.html?name=${name}`;
      });
    });
  }

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem(KEYS.current);
    window.location.href = "index.html";
  });
}

async function initServicePage() {
  requireAuth();

  const params = new URLSearchParams(window.location.search);
  const serviceName = params.get("name") || "Unknown Service";

  const title = document.getElementById("serviceTitle");
  const toolContainer = document.getElementById("toolContainer");
  const freeBtn = document.getElementById("freeBtn");
  const paidBtn = document.getElementById("paidBtn");
  const saveBtn = document.getElementById("saveBtn");
  const copyLinkBtn = document.getElementById("copyLinkBtn");

  if (title) title.textContent = decodeURIComponent(serviceName);

  showLoader(true);
  await delay(1100 + Math.floor(Math.random() * 700));
  showLoader(false);

  const tools = getServiceTools(decodeURIComponent(serviceName));
  let activePlan = "free";

  const renderPlan = () => {
    freeBtn?.classList.toggle("active", activePlan === "free");
    paidBtn?.classList.toggle("active", activePlan === "paid");
    renderToolCards(tools[activePlan], toolContainer);
  };

  renderPlan();

  freeBtn?.addEventListener("click", () => {
    activePlan = "free";
    renderPlan();
  });

  paidBtn?.addEventListener("click", () => {
    activePlan = "paid";
    renderPlan();
  });

  saveBtn?.addEventListener("click", () => {
    const username = getCurrentUsername();
    const users = getUsers();
    const target = users.find((u) => u.username === username);
    if (!target) return;

    const snapshot = {
      service: decodeURIComponent(serviceName),
      plan: activePlan,
      savedAt: new Date().toLocaleString()
    };

    target.savedItems = target.savedItems || [];
    target.savedItems.push(snapshot);
    setUsers(users);
    toast("Element Saved!");
  });

  copyLinkBtn?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Link copied!");
    } catch (_error) {
      toast("Copy not supported on this browser");
    }
  });
}

function initProfilePage() {
  requireAuth();
  const user = currentUser();
  if (!user) return;

  const usernameInput = document.getElementById("profileUsername");
  const passwordInput = document.getElementById("profilePassword");
  const saveProfileBtn = document.getElementById("saveProfileBtn");
  const savedList = document.getElementById("savedList");

  usernameInput.value = user.username;
  passwordInput.value = user.password;

  const renderSaved = () => {
    const refreshed = currentUser();
    const items = refreshed?.savedItems || [];

    if (!items.length) {
      savedList.innerHTML = "<li>No saved elements yet.</li>";
      return;
    }

    savedList.innerHTML = items
      .map((item) => `<li>${item.service} (${item.plan.toUpperCase()}) — ${item.savedAt}</li>`)
      .join("");
  };

  renderSaved();

  saveProfileBtn?.addEventListener("click", () => {
    const newUsername = usernameInput.value.trim();
    const newPassword = passwordInput.value.trim();

    if (!newUsername || !newPassword) {
      toast("Username and password are required");
      return;
    }

    const users = getUsers();
    const current = getCurrentUsername();

    if (users.some((u) => u.username === newUsername && u.username !== current)) {
      toast("Username already in use");
      return;
    }

    const updatedUsers = users.map((u) =>
      u.username === current ? { ...u, username: newUsername, password: newPassword } : u
    );

    setUsers(updatedUsers);
    setCurrentUsername(newUsername);
    toast("Profile updated");
    renderSaved();
  });
}

function init() {
  const page = document.body.dataset.page;

  if (page === "auth") initAuthPage();
  if (page === "dashboard") initDashboardPage();
  if (page === "service") initServicePage();
  if (page === "profile") initProfilePage();
}

init();
