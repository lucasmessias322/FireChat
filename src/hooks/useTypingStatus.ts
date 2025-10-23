import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

interface User {
  uid: string;
  username: string;
}

export function useTypingStatus(usersData: User[]) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    const q = collection(db, "typing");
    const unsubscribe = onSnapshot(q, (snap) => {
      const users = snap.docs
        .map((d) => ({ uid: d.id, typing: (d.data() as any).typing }))
        .filter((x) => x.typing && x.uid !== auth.currentUser?.uid)
        .map((x) => usersData.find((u) => u.uid === x.uid)?.username)
        .filter((n): n is string => !!n);

      setTypingUsers(users);
    });

    return () => unsubscribe();
  }, [usersData]);

  return typingUsers;
}
