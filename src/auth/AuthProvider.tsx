import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Ctx = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const applySession = async (sess: Session | null) => {
      if (!active) return;
      setLoading(true);
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        const { data } = await supabase.rpc("has_role", { _user_id: sess.user.id, _role: "admin" });
        if (!active) return;
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setTimeout(() => { void applySession(sess); }, 0);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      void applySession(session);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, loading, signOut: async () => { await supabase.auth.signOut(); } }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
