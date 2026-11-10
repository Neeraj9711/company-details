import { clearSession } from "@/lib/auth/session";

let handler = () => {
  clearSession();
};

export function handleUnauthorized(): void {
  handler();
}

export function setUnauthorizedHandler(next: () => void): () => void {
  handler = next;
  return () => {
    if (handler === next) {
      handler = () => {
        clearSession();
      };
    }
  };
}
