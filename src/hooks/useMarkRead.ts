import { useEffect } from "react";
import { db } from "../firebase";
import { writeBatch, doc, arrayUnion } from "firebase/firestore";

interface Message {
  id: string;
  system?: boolean;
  readBy?: string[];
  user?: string;
}

export function useMarkRead(messages: Message[], username: string) {
  useEffect(() => {
    if (!username) return;
    let windowFocused = document.hasFocus();

    const markAsRead = () => {
      if (document.hidden || !windowFocused) return;
      const batch = writeBatch(db);
      messages.forEach((m) => {
        if (!m.system && !m.readBy?.includes(username)) {
          batch.update(doc(db, "messages", m.id), {
            readBy: arrayUnion(username),
          });
        }
      });
      batch.commit();
    };

    const handleVisibility = () => {
      if (!document.hidden && windowFocused) markAsRead();
    };
    const handleFocus = () => {
      windowFocused = true;
      markAsRead();
    };
    const handleBlur = () => (windowFocused = false);

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    markAsRead();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [messages, username]);
}
