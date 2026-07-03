import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../shared/lib/firebase';
import { useAuthStore } from '../shared/store/auth-store';
import { LoginForm } from '../features/auth/login-form';
import { ProfileCard } from '../features/auth/profile-card';

export default function LoginPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') return;
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-8">
      {user ? (
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold">أنت مسجل الدخول</h2>
            <p className="mt-1 text-sm text-[#8e8e93]">يمكنك إدارة حسابك من هنا</p>
          </div>
          <ProfileCard onSignOut={handleSignOut} />
          <button
            onClick={() => navigate('/')}
            className="w-full text-center text-sm font-semibold text-primary"
          >
            العودة للرئيسية
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm">
          <LoginForm onLogin={handleLogin} error={error} />
        </div>
      )}
    </div>
  );
}
