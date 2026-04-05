const USER = "admin";
const PASS = "1234";

function login() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;

  if (u === USER && p === PASS) {
    localStorage.setItem("logged", "true");
    showApp();
  } else {
    document.getElementById("error").innerText = "Falsche Daten";
  }
}

function logout() {
  localStorage.removeItem("logged");
  location.reload();
}

function showApp() {
  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("welcome").innerText = "Willkommen Admin 👑";
}

if (localStorage.getItem("logged") === "true") {
  showApp();
}
