import { createRoot } from "react-dom/client";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

export const ADMIN_TOKEN_KEY = "cc_admin_token";

setAuthTokenGetter(() => {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
});

createRoot(document.getElementById("root")!).render(<App />);
