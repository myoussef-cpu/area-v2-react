import { LogOut, Cloud, CloudOff } from 'lucide-react';
import { useAuthStore } from '../../shared/store/auth-store';
import { Card } from '../../shared/ui/card';
import { Button } from '../../shared/ui/button';
import { cn } from '../../shared/lib/cn';

interface ProfileCardProps {
  onSignOut: () => Promise<void>;
  synced?: boolean;
}

export function ProfileCard({ onSignOut, synced = false }: ProfileCardProps) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return (
      <Card className="flex flex-col items-center gap-3 py-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/5 dark:bg-white/10">
          <CloudOff className="h-7 w-7 text-[#8e8e93]" />
        </div>
        <p className="text-sm text-[#8e8e93]">غير مسجل الدخول</p>
      </Card>
    );
  }

  return (
    <Card className="flex items-center gap-4">
      {user.photoURL ? (
        <img src={user.photoURL} alt="" className="h-14 w-14 rounded-2xl object-cover" />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary">
          {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
        </div>
      )}
      <div className="flex-1">
        <p className="text-base font-bold">{user.displayName || 'مستخدم'}</p>
        <p className="text-xs text-[#8e8e93]">{user.email}</p>
        <div className={cn('mt-1 flex items-center gap-1 text-xs', synced ? 'text-green-500' : 'text-[#8e8e93]')}>
          {synced ? <Cloud className="h-3 w-3" /> : <CloudOff className="h-3 w-3" />}
          {synced ? 'متزامن' : 'غير متزامن'}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onSignOut} title="تسجيل الخروج">
        <LogOut className="h-4 w-4" />
      </Button>
    </Card>
  );
}
