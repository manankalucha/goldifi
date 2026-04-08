'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signInWithGoogle } from '@/lib/firebase/auth';
import { getDocument, setDocument } from '@/lib/firebase/firestore';
import { GoldifyUser } from '@/types';
import { Gem, Lock } from 'lucide-react';
import Link from 'next/link';
import styles from './login.module.css';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParams = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCred = await signIn(email, password);
      // Fetch user role
      const userData = await getDocument<GoldifyUser>('users', userCred.user.uid);
      
      const role = userData?.role || 'operator';
      
      // Determine redirect path
      let nextPath = '/dashboard';
      if (role === 'admin') nextPath = '/admin';
      if (redirectParams) nextPath = redirectParams;
      
      // Force a hard navigation to refresh the middleware view
      window.location.href = nextPath;
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const user = await signInWithGoogle();
      
      // Check if user document exists in Firestore
      let userData = await getDocument<GoldifyUser>('users', user.uid);
      
      if (!userData) {
        // First-time signup logic - default to operator role
        const newUser: GoldifyUser = {
          uid: user.uid,
          email: user.email || '',
          name: user.displayName || undefined,
          role: 'operator',
          createdAt: new Date().toISOString(),
        };
        await setDocument('users', user.uid, newUser);
        userData = newUser;
      }

      const role = userData.role || 'operator';
      
      // Determine redirect path
      let nextPath = '/dashboard';
      if (role === 'admin') nextPath = '/admin';
      if (redirectParams) nextPath = redirectParams;
      
      // Force a hard navigation
      window.location.href = nextPath;
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}
      
      <div className="form-group">
        <label className="form-label">Staff Email</label>
        <input
          type="email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </div>
      
      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-lg"
        style={{ width: '100%', marginTop: 24 }}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner" style={{ width: 16, height: 16 }} />
            Authenticating...
          </>
        ) : (
          'Secure Login'
        )}
      </button>

      <div className={styles.divider}>or continue with</div>

      <button
        type="button"
        className={styles.googleBtn}
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        <div className={styles.googleIconWrapper}>
          <GoogleIcon />
        </div>
        Sign in with Google
      </button>

      <div className={styles.footer}>
        <p>Restricted access. Authorized kiosk operators and administrators only.</p>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Link href="/" className={styles.backLink}>← Back to Portal</Link>
        
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.iconWrap}>
              <Lock size={24} className={styles.icon} />
            </div>
            <div className={styles.logo}>
              <Gem size={20} className={styles.logoIcon} />
              <span className={styles.logoText}><span className="gold-text">Gold</span>ify</span>
            </div>
            <h1 className={styles.title}>Staff Portal</h1>
          </div>

          <Suspense fallback={<div style={{ textAlign: 'center', padding: 20 }}>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
