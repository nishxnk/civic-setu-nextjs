"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { IAuthContextValue, IAuthUser } from "@/types/user";

const AuthContext = createContext<IAuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName:
            firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          photoURL: firebaseUser.photoURL || undefined,
          token,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshToken = async (): Promise<string | null> => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const token = await firebaseUser.getIdToken(true);
      setUser((prev) => (prev ? { ...prev, token } : null));
      return token;
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): IAuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
