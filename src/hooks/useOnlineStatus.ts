import { useEffect } from "react";
import { auth, db } from "../firebase";
import { doc as docRef, setDoc, addDoc, collection } from "firebase/firestore";
import { timestamp } from "../firebase";

/**
 * Hook responsável por controlar a presença online/offline
 * e registrar entrada e saída do usuário no chat.
 */
export function useOnlineStatus(entered: boolean) {
  useEffect(() => {
    if (!entered || !auth.currentUser) return;

    const uid = auth.currentUser.uid;
    const username = auth.currentUser.email?.split("@")[0] || "Usuário";

    let windowFocused = document.hasFocus();
    let isVisible = !document.hidden;
    let lastStatus = false;

    const setOnlineStatus = async (status: boolean) => {
      if (status === lastStatus) return;
      lastStatus = status;

      await setDoc(
        docRef(db, "users", uid),
        { online: status },
        { merge: true }
      );
    };

    const updateOnlineState = () => {
      const onlineNow = windowFocused && isVisible;
      setOnlineStatus(onlineNow);
    };

    const handleFocus = () => {
      windowFocused = true;
      updateOnlineState();
    };

    const handleBlur = () => {
      windowFocused = false;
      updateOnlineState();
    };

    const handleVisibility = () => {
      isVisible = !document.hidden;
      updateOnlineState();
    };

    const handleUnload = () => {
      navigator.sendBeacon(
        `${window.location.origin}/offline`,
        JSON.stringify({ uid })
      );
      setDoc(docRef(db, "users", uid), { online: false }, { merge: true });
    };

    // Eventos
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    // Marca como online assim que o hook é iniciado
    updateOnlineState();

    // Marca entrada do usuário no chat
    (async () => {
      await addDoc(collection(db, "messages"), {
        text: `${username} entrou no chat`,
        timestamp: timestamp(),
        system: true,
        readBy: [username],
      });
    })();

    // Cleanup: marca offline e saída ao desmontar
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);

      (async () => {
        await setDoc(docRef(db, "users", uid), { online: false }, { merge: true });
        await addDoc(collection(db, "messages"), {
          text: `${username} saiu do chat`,
          timestamp: timestamp(),
          system: true,
          readBy: [username],
        });
      })();
    };
  }, [entered]);
}
