// Utility for managing user role in localStorage
export const ROLE_KEY = 'safevoice_user_role';

export function setRole(role: string) {
  localStorage.setItem(ROLE_KEY, role);
}

export function getRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

export function clearRole() {
  localStorage.removeItem(ROLE_KEY);
}
