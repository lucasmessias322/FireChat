import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, db, timestamp } from "../firebase";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { toast } from "react-toastify";

export interface AuthUser {
  uid: string;
  username: string;
  avatar: string;
  online: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [entered, setEntered] = useState(false);
  const [loginMode, setLoginMode] = useState<"login" | "signup">("login");
  const [inputName, setInputName] = useState("");
  const [inputPass, setInputPass] = useState("");

  const fakeEmail = (name: string) => `${name}@chat.app`;

  // --- LOGIN / SIGNUP ---
  const handleAuth = async () => {
    const name = inputName.trim().toLowerCase();
    if (!name || !inputPass) {
      toast.error("Preencha todos os campos");
      return;
    }
    const email = fakeEmail(name);
    try {
      if (loginMode === "login") {
        await signInWithEmailAndPassword(auth, email, inputPass);
      } else {
        await createUserWithEmailAndPassword(auth, email, inputPass);
      }
      setInputPass("");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // --- GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // --- LOGOUT ---
  const handleLogout = async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    await setDoc(doc(db, "users", uid), { online: false }, { merge: true });
    await addDoc(collection(db, "messages"), {
      text: `${user?.username} saiu do chat`,
      timestamp: timestamp(),
      system: true,
      readBy: [user?.username],
    });
    await fbSignOut(auth);
    toast.info("Você saiu do chat");
  };

  // --- MONITORA O ESTADO DE LOGIN ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u: FirebaseUser | null) => {
      if (u) {
        setEntered(true);
        const name = u.email!.split("@")[0];
        const avatarUrl =
          u.photoURL && u.photoURL !== ""
            ? u.photoURL
            : `https://api.dicebear.com/6.x/pixel-art/svg?seed=${u.uid}`;

        const newUser: AuthUser = {
          uid: u.uid,
          username: name,
          avatar: avatarUrl,
          online: true,
        };

        setUser(newUser);

        await setDoc(
          doc(db, "users", u.uid),
          { username: name, avatar: avatarUrl, online: true },
          { merge: true }
        );

        await addDoc(collection(db, "messages"), {
          text: `${name} entrou no chat`,
          timestamp: timestamp(),
          system: true,
          readBy: [name],
        });
      } else {
        setEntered(false);
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    entered,
    loginMode,
    inputName,
    inputPass,
    setLoginMode,
    setInputName,
    setInputPass,
    handleAuth,
    handleGoogleLogin,
    handleLogout,
  };
}
