// =========================
// BASE API URL
// =========================
const API_BASE = "https://backend-leapcell-izathbsl2700-xxf0nws0.leapcell.dev/api";

/* =========================
   REGISTER USER
========================= */
async function registerUser() {
  const name = document.getElementById("name")?.value;
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!name || !email || !password) {
    alert("Nama, email, dan password wajib diisi");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registrasi gagal");
      return;
    }

    alert("Registrasi berhasil, silakan login");
    window.location.href = "login.html";

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    alert("Server tidak bisa diakses");
  }
}

/* =========================
   LOGIN EMAIL
========================= */
async function loginAdmin() {
  const email = document.getElementById("email")?.value;
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    alert("Email dan password wajib diisi");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login gagal");
      return;
    }

    // SIMPAN TOKEN
    localStorage.setItem("access_token", data.access_token);

    // SIMPAN USER & NORMALISASI ROLE
    const user = {
  id: data.user.id,
  name: data.user.name || data.user.email.split("@")[0],
  email: data.user.email,
  role: String(data.user.role).toLowerCase()
};

localStorage.setItem("user", JSON.stringify(user));

    // REDIRECT SESUAI ROLE
    if (user.role === "admin") {
      window.location.href = "dashboard.html";
    } else {
      window.location.href = "index.html";
    }

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    alert("Server tidak bisa diakses");
  }
}

/* =========================
   LOGIN GOOGLE (FIREBASE)
========================= */
async function loginWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await firebase.auth().signInWithPopup(provider);
    const firebaseUser = result.user;

    if (!firebaseUser) {
      alert("Login Google dibatalkan");
      return;
    }

    // AMBIL ID TOKEN DARI FIREBASE
    const idToken = await firebaseUser.getIdToken(true);

    const res = await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: idToken })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("BACKEND ERROR:", data);
      alert(data.message || "Login Google gagal");
      return;
    }

    // SIMPAN TOKEN & USER
 const user = {
  id: data.user.id,
  name:
    data.user.name ||
    firebaseUser.displayName ||
    data.user.email.split("@")[0],
  email: data.user.email,
  role: String(data.user.role).toLowerCase()
};

localStorage.setItem("user", JSON.stringify(user));

    // REDIRECT SESUAI ROLE
    if (user.role === "admin") {
      window.location.href = "dashboard.html";
    } else {
      window.location.href = "index.html";
    }

  } catch (err) {
    console.error("GOOGLE LOGIN ERROR:", err);
    alert("Terjadi kesalahan saat login Google");
  }
}

/* =========================
   LOGOUT
========================= */
function logout() {
  try {
    if (window.firebase?.auth) firebase.auth().signOut();
  } catch (_) {}

  localStorage.removeItem("access_token");
  localStorage.removeItem("user");

  window.location.href = "index.html";
}

/* =========================
   PROTECT ADMIN PAGE
========================= */
function protectAdminPage() {
  const token = localStorage.getItem("access_token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ❌ Tidak login
  if (!token || !user.email) {
    localStorage.clear();
    window.location.href = "login.html";
    return;
  }

  // ❌ Login tapi BUKAN ADMIN
  if (user.role !== "admin") {
    alert("Akses ditolak. Halaman ini hanya untuk ADMIN.");
    localStorage.clear();
    window.location.href = "login.html";
    return;
  }
}


/* =========================
   UPDATE UI (NAVBAR & AKSES)
========================= */
function updateAuthUI() {
  const user = JSON.parse(localStorage.getItem("user"));

  const navGuest = document.getElementById("nav-guest");
  const navUser = document.getElementById("nav-user");
  const navEmail = document.getElementById("nav-user-email");

  const guestActions = document.getElementById("guest-actions");
  const userActions = document.getElementById("user-actions");
  const userEmail = document.getElementById("user-email");

  if (user) {
    // NAVBAR
    navGuest?.classList.add("hidden");
    navUser?.classList.remove("hidden");
    if (navEmail) navEmail.textContent = user.name || user.email;

    // AKSES USER
    guestActions?.classList.add("hidden");
    userActions?.classList.remove("hidden");
    if (userEmail) userEmail.textContent = user.name || user.email;

  } else {
    navGuest?.classList.remove("hidden");
    navUser?.classList.add("hidden");

    guestActions?.classList.remove("hidden");
    userActions?.classList.add("hidden");
  }
}

/* =========================
   AUTO RUN
========================= */
document.addEventListener("DOMContentLoaded", updateAuthUI);
