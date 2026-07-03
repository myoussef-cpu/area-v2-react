import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut, type UserCredential } from 'firebase/auth';
import {
  auth, googleProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile,
} from '../shared/lib/firebase';
import { useAuthStore } from '../shared/store/auth-store';
import { LoginForm } from '../features/auth/login-form';
import { ProfileCard } from '../features/auth/profile-card';

export default function LoginPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [error, setError] = useState<string | null>(null);

  const syncUser = (cred: UserCredential) => {
    const u = cred.user;
    useAuthStore.getState().setUser({
      uid: u.uid,
      displayName: u.displayName,
      email: u.email,
      photoURL: u.photoURL,
    });
  };

  const handleGoogleLogin = async () => {
    if (!auth || !googleProvider) {
      setError('Firebase غير مُهيّأ. الرجاء إعداد بيانات Firebase الخاصة بك.');
      return;
    }
    setError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      syncUser(cred);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') return;
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    }
  };

  const handleEmailLogin = async (email: string, password: string) => {
    if (!auth) { setError('Firebase غير مُهيّأ.'); return; }
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      syncUser(cred);
      navigate('/');
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code));
    }
  };

  const handleEmailRegister = async (email: string, password: string, displayName: string) => {
    if (!auth) { setError('Firebase غير مُهيّأ.'); return; }
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      syncUser(cred);
      navigate('/');
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code));
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
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
          <LoginForm
            onGoogleLogin={handleGoogleLogin}
            onEmailLogin={handleEmailLogin}
            onEmailRegister={handleEmailRegister}
            error={error}
          />
        </div>
      )}
    </div>
  );
}

function getFirebaseErrorMessage(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found': 'لا يوجد حساب بهذا البريد الإلكتروني',
    'auth/wrong-password': 'كلمة المرور غير صحيحة',
    'auth/invalid-credential': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    'auth/email-already-in-use': 'هذا البريد الإلكتروني مستخدم بالفعل',
    'auth/weak-password': 'كلمة المرور ضعيفة جداً (6 أحرف على الأقل)',
    'auth/invalid-email': 'البريد الإلكتروني غير صالح',
    'auth/too-many-requests': 'تم حظر الحساب مؤقتاً - حاول لاحقاً',
    'auth/network-request-failed': 'فشل الاتصال بالإنترنت',
  };
  return map[code] || code || 'حدث خطأ غير متوقع';
}
