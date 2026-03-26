import { useState, useEffect } from "react";
import { supabase } from './supabase';
import Auth from './Auth';

// Import your existing App component
import WeddingApp from './WeddingApp';

export default function AppWithAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #fff5f7 0%, #fdeef2 35%, #fff8f0 70%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 36
    }}>
      🌸
    </div>
  );

  if (!user) return <Auth onLogin={setUser} />;

  return <WeddingApp user={user} onLogout={() => supabase.auth.signOut()} />;
}
