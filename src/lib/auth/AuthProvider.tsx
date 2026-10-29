"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { getDb, getFirebaseAuth } from "@/lib/firebase/client";

/**
 * Admin-panel auth on Firebase Auth (email/password).
 *
 * A signed-in user is an admin when `admins/{uid}` exists. Those documents are
 * created in the Firebase console (or by scripts/migrate/import-firestore.mjs);
 * firestore.rules lets a user read only their own admins doc.
 */
export type UserProfile = {
  id: string;
  email: string;
  username: string | null;
  role: "admin" | "user";
  is_active: boolean;
};

export type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  /** Throws an Error with a user-friendly message on failure. */
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

const FRIENDLY: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/invalid-login-credentials": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/too-many-requests": "Too many attempts. Try again in a few minutes.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
};

async function fetchProfile(user: User): Promise<UserProfile> {
  const base = { id: user.uid, email: user.email ?? "", username: user.displayName ?? null };
  try {
    const snap = await getDoc(doc(getDb(), "admins", user.uid));
    if (snap.exists()) {
      const data = snap.data() as { email?: string; username?: string | null };
      return { ...base, email: data.email ?? base.email, username: data.username ?? base.username, role: "admin", is_active: true };
    }
  } catch {
    // permission-denied or offline: treat as not an admin
  }
  return { ...base, role: "user", is_active: false };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Resolve the admin profile BEFORE publishing the user, and publish both in
    // one batch: otherwise there is a frame where `user && !isAdmin` is true and
    // the protected layout would bounce a real admin to /admin/login.
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (currentUser) => {
      const nextProfile = currentUser ? await fetchProfile(currentUser) : null;
      if (cancelled) return;
      setUser(currentUser);
      setProfile(nextProfile);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      throw new Error(FRIENDLY[code] ?? "Sign-in failed. Please try again.");
    }
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(getFirebaseAuth());
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      profile,
      isLoading,
      isAdmin: profile?.role === "admin" && profile?.is_active === true,
      signIn,
      signOut,
    }),
    [user, profile, isLoading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
