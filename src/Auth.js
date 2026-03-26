import { useState, useEffect } from "react";
import { supabase } from './supabase';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600&family=Lato:wght@300;400;700&display=swap');
  
  .auth-bg {
    min-height: 100vh;
    background: linear-gradient(145deg, #fff5f7 0%, #fdeef2 35%, #fff8f0 70%, #fef5f8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Lato', sans-serif;
    padding: 20px;
  }
  .auth-card {
    background: white;
    border: 1px solid rgba(200,140,155,0.25);
    border-radius: 20px;
    padding: 48px 40px;
    max-width: 420px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 70px rgba(200,112,122,0.13);
  }
  .auth-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 42px;
    font-weight: 300;
    color: #3d2028;
    margin-bottom: 6px;
  }
  .auth-subtitle {
    font-family: 'Cinzel', serif;
    font-size: 10px;
    letter-spacing: 0.3em;
    color: #d4848c;
    text-transform: uppercase;
    margin-bottom: 32px;
  }
  .auth-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
    color: #c0a8a8;
    font-size: 12px;
  }
  .auth-divider::before, .auth-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(200,140,155,0.2);
  }
  .google-btn {
    width: 100%;
    padding: 14px 20px;
    border: 1.5px solid rgba(200,140,155,0.3);
    border-radius: 50px;
    background: white;
    color: #3d2028;
    font-family: 'Cinzel', serif;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: all 0.22s ease;
    margin-bottom: 12px;
  }
  .google-btn:hover {
    background: rgba(200,112,122,0.05);
    border-color: #c9707a;
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(200,112,122,0.15);
  }
  .fb-btn {
    width: 100%;
    padding: 14px 20px;
    border: none;
    border-radius: 50px;
    background: #1877F2;
    color: white;
    font-family: 'Cinzel', serif;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: all 0.22s ease;
  }
  .fb-btn:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(24,119,242,0.3);
  }
  .auth-note {
    font-size: 12px;
    color: #b09898;
    margin-top: 24px;
    line-height: 1.6;
  }
  .auth-error {
    background: rgba(200,100,100,0.1);
    border: 1px solid rgba(200,100,100,0.3);
    color: #c06060;
    border-radius: 10px;
    padding: 10px 16px;
    font-size: 13px;
    margin-bottom: 16px;
  }
`;

export default function Auth({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) onLogin(session.user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) onLogin(session.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  const loginWithFacebook = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-bg">
        <div className="auth-card">
          {/* Flower emoji decoration */}
          <div style={{ fontSize: 36, marginBottom: 12 }}>🌸</div>
          
          <div className="auth-title">Eternally</div>
          <div className="auth-subtitle">✦ Digital Wedding Invitations ✦</div>

          <p style={{ color: '#8a6068', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            Sign in to create your beautiful wedding invitation and manage your guest list
          </p>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <button className="google-btn" onClick={loginWithGoogle} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <button className="fb-btn" onClick={loginWithFacebook} disabled={loading}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {loading ? 'Connecting...' : 'Continue with Facebook'}
          </button>

          <p className="auth-note">
            By signing in, you agree to our terms of service.<br/>
            Your guests don't need to sign in to RSVP 💌
          </p>
        </div>
      </div>
    </>
  );
}
