import { Moon, Sun, Info, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../shared/store/app-store';
import { useAuthStore } from '../shared/store/auth-store';
import { Card } from '../shared/ui/card';
import { cn } from '../shared/lib/cn';

const AREA_UNITS = [
  { value: 'm2', label: 'متر مربع (م²)' },
  { value: 'ft2', label: 'قدم مربع' },
  { value: 'feddan', label: 'فدان' },
  { value: 'acre', label: 'Acre' },
];

const VOLUME_UNITS = [
  { value: 'm3', label: 'متر مكعب (م³)' },
  { value: 'ft3', label: 'قدم مكعب' },
  { value: 'liter', label: 'لتر' },
  { value: 'gallon', label: 'جالون' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, areaUnit, volumeUnit, setAreaUnit, setVolumeUnit } = useAppStore();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="animate-ios-slide-up py-2">
      <h2 className="mb-4 text-xl font-bold">الإعدادات</h2>

      {user ? (
        <Card className="mb-4 flex items-center gap-4">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="h-12 w-12 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
              {user.displayName?.charAt(0) || '?'}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-bold">{user.displayName || 'مستخدم'}</p>
            <p className="text-xs text-[#8e8e93]">{user.email}</p>
          </div>
        </Card>
      ) : (
        <Card
          onClick={() => navigate('/login')}
          className="mb-4 flex cursor-pointer items-center gap-4 transition-all hover:bg-primary/5"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold">تسجيل الدخول</p>
            <p className="text-xs text-[#8e8e93]">سجل لحفظ نتائجك في السحابة</p>
          </div>
        </Card>
      )}

      <Card className="mb-4">
        <label className="mb-2 block text-xs font-bold text-[#8e8e93]">المظهر</label>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            <span className="text-sm font-semibold">الوضع الداكن</span>
          </div>
          <button
            onClick={toggleDarkMode}
            className={cn(
              'relative h-7 w-12 rounded-full transition-colors',
              darkMode ? 'bg-primary' : 'bg-black/20'
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform',
                darkMode ? 'translate-x-5.5' : 'translate-x-0.5'
              )}
            />
          </button>
        </div>
      </Card>

      <Card className="mb-4">
        <label className="mb-2 block text-xs font-bold text-[#8e8e93]">وحدة المساحة الافتراضية</label>
        <select
          value={areaUnit}
          onChange={(e) => setAreaUnit(e.target.value)}
          className="w-full rounded-2xl border border-black/5 bg-white/70 px-4 py-3 text-right text-sm backdrop-blur-md transition-all focus:border-primary focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          {AREA_UNITS.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </Card>

      <Card className="mb-4">
        <label className="mb-2 block text-xs font-bold text-[#8e8e93]">وحدة الحجم الافتراضية</label>
        <select
          value={volumeUnit}
          onChange={(e) => setVolumeUnit(e.target.value)}
          className="w-full rounded-2xl border border-black/5 bg-white/70 px-4 py-3 text-right text-sm backdrop-blur-md transition-all focus:border-primary focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          {VOLUME_UNITS.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </Card>

      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold">المهندس</p>
            <p className="text-xs text-[#8e8e93]">الإصدار 1.0.0</p>
            <p className="text-xs text-[#8e8e93]">آلة حاسبة هندسية متكاملة</p>
          </div>
        </div>
      </Card>

      <p className="py-4 text-center text-xs text-[#8e8e93]">
        جميع الحقوق محفوظة © {new Date().getFullYear()}
      </p>
    </div>
  );
}
