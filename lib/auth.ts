export function getToken() {
  if (typeof window == "undefined") return null;
  return localStorage.getItem("token");
}

export function getRole() {
  if (typeof window == "undefined") {
    return null;
  }
  return localStorage.getItem("user");
}

export function getUser() {
  if (typeof window == "undefined") return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
  if (typeof window == "undefined") return null;
  return !!localStorage.getItem("token");
}

export function removeAuth() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");

  // Hapus cookies
  document.cookie = "token=; path=/; max-age=0";
  document.cookie = "role=; path=/; max-age=0";
}