export const LABELS = [
  "Bad Painting",
  "Cracks",
  "Liquid",
  "Manhole",
  "Pothole",
  "Sand",
] as const;

export const COLORS = [
  "#FFA500", // orange - Bad Painting
  "#00FF00", // green  - Cracks
  "#00BFFF", // blue   - Liquid
  "#FF0000", // red    - Manhole
  "#FFFF00", // yellow - Pothole
  "#8B4513", // brown  - Sand
] as const;

export const DEPARTMENTS = [
  "pwd",
  "electricity",
  "water",
  "sanitation",
  "traffic",
  "parks",
] as const;

export const CATEGORIES = [
  "road",
  "lighting",
  "water",
  "sanitation",
  "traffic",
  "other",
] as const;

export const STATUSES = [
  "pending",
  "in-progress",
  "resolved",
  "rejected",
] as const;

export const PRIORITIES = ["low", "medium", "high", "critical"] as const;

export const FIREBASE_ERROR_MAP: Record<string, string> = {
  "auth/invalid-credential": "Invalid email or password.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/popup-closed-by-user": "Sign-in cancelled.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
};

export function firebaseErrorToMessage(code: string): string {
  return FIREBASE_ERROR_MAP[code] || "Something went wrong. Please try again.";
}
