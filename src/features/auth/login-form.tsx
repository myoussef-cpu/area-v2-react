import { useState } from 'react';
import { LogIn } from 'lucide-react';
import { Button } from '../../shared/ui/button';
import { cn } from '../../shared/lib/cn';

interface LoginFormProps {
  onLogin: () => Promise<void>;
  error?: string | null;
}

export function LoginForm({ onLogin, error }: LoginFormProps) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await onLogin();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
        <LogIn className="h-10 w-10 text-primary" />
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold">تسجيل الدخول</h2>
        <p className="mt-1 text-sm text-[#8e8e93]">سجل بحساب جوجل لمزامنة نتائجك</p>
      </div>

      {error && (
        <div className="w-full rounded-2xl bg-red-500/10 px-4 py-3 text-center text-sm text-red-500">
          {error}
        </div>
      )}

      <Button
        onClick={handleLogin}
        disabled={loading}
        className={cn('w-full max-w-xs gap-3', loading && 'opacity-70')}
        size="lg"
      >
        {loading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <LogIn className="h-5 w-5" />
        )}
        {loading ? 'جاري التسجيل...' : 'تسجيل الدخول بحساب جوجل'}
      </Button>
    </div>
  );
}
