import { useState } from 'react';
import { LogIn, Mail, User, Lock, Globe, AtSign, UserPlus } from 'lucide-react';
import { Button } from '../../shared/ui/button';
import { Input } from '../../shared/ui/input';
import { cn } from '../../shared/lib/cn';

type AuthTab = 'google' | 'login' | 'register';

interface LoginFormProps {
  onGoogleLogin: () => Promise<void>;
  onEmailLogin: (email: string, password: string) => Promise<void>;
  onEmailRegister: (email: string, password: string, displayName: string) => Promise<void>;
  error?: string | null;
}

export function LoginForm({ onGoogleLogin, onEmailLogin, onEmailRegister, error }: LoginFormProps) {
  const [tab, setTab] = useState<AuthTab>('google');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const handleGoogle = async () => {
    setLoading(true);
    try { await onGoogleLogin(); } finally { setLoading(false); }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try { await onEmailLogin(email, password); } finally { setLoading(false); }
  };

  const handleEmailRegister = async () => {
    if (!email || !password || !username) return;
    setLoading(true);
    try { await onEmailRegister(email, password, username); } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
          <LogIn className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">تسجيل الدخول</h2>
          <p className="mt-1 text-sm text-[#8e8e93]">سجل لحفظ ومزامنة نتائجك</p>
        </div>
      </div>

      <div className="flex rounded-2xl bg-black/5 p-1 dark:bg-white/10">
        {[
          { key: 'google' as AuthTab, label: 'جوجل', icon: Globe },
          { key: 'login' as AuthTab, label: 'دخول', icon: Mail },
          { key: 'register' as AuthTab, label: 'تسجيل', icon: UserPlus },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all',
              tab === t.key ? 'bg-white text-black shadow-sm dark:bg-black dark:text-white' : 'text-[#8e8e93]'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="w-full rounded-2xl bg-red-500/10 px-4 py-3 text-center text-sm text-red-500">
          {error}
        </div>
      )}

      {tab === 'google' && (
        <Button
          onClick={handleGoogle}
          disabled={loading}
          className={cn('w-full gap-3', loading && 'opacity-70')}
          size="lg"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Globe className="h-5 w-5" />
          )}
          {loading ? 'جاري التسجيل...' : 'تسجيل الدخول بحساب جوجل'}
        </Button>
      )}

      {tab === 'login' && (
        <div className="flex flex-col gap-4">
          <Input
            label="البريد الإلكتروني"
            placeholder="example@email.com"
            icon={<AtSign className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="كلمة المرور"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleEmailLogin} disabled={loading || !email || !password} className={cn('w-full', loading && 'opacity-70')} size="lg">
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Mail className="h-5 w-5" />
            )}
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>
        </div>
      )}

      {tab === 'register' && (
        <div className="flex flex-col gap-4">
          <Input
            label="اسم المستخدم"
            placeholder="أحمد"
            icon={<User className="h-4 w-4" />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            label="البريد الإلكتروني"
            placeholder="example@email.com"
            icon={<AtSign className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="كلمة المرور"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleEmailRegister} disabled={loading || !email || !password || !username} className={cn('w-full', loading && 'opacity-70')} size="lg">
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <UserPlus className="h-5 w-5" />
            )}
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
          </Button>
        </div>
      )}
    </div>
  );
}
