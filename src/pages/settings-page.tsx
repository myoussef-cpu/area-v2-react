import { Info, LogIn, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../shared/lib/firebase';
import { useAppStore } from '../shared/store/app-store';
import { useAuthStore } from '../shared/store/auth-store';
import { Card } from '../shared/ui/card';
import { Button } from '../shared/ui/button';
import { Select } from '../shared/ui/select';
import { Switch } from '@/components/animate-ui/components/radix/switch';

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

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <div className="animate-ios-slide-up py-2">
      <h2 className="mb-4 text-xl font-bold">الإعدادات</h2>

      {user ? (
        <>
          <Card className="mb-3 flex items-center gap-4">
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
          <Button onClick={handleSignOut} variant="secondary" className="mb-4 w-full gap-2">
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </>
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
            <span className="text-sm font-semibold">الوضع الداكن</span>
          </div>
          <Switch
            checked={darkMode}
            onCheckedChange={toggleDarkMode}
          />
        </div>
      </Card>

      <Card className="mb-4">
        <label className="mb-2 block text-xs font-bold text-[#8e8e93]">وحدة المساحة الافتراضية</label>
        <Select
          options={AREA_UNITS}
          value={areaUnit}
          onChange={setAreaUnit}
        />
      </Card>

      <Card className="mb-4">
        <label className="mb-2 block text-xs font-bold text-[#8e8e93]">وحدة الحجم الافتراضية</label>
        <Select
          options={VOLUME_UNITS}
          value={volumeUnit}
          onChange={setVolumeUnit}
        />
      </Card>

      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold">المهندس</p>
            <p className="text-xs text-[#8e8e93]">الإصدار 1.1.0</p>
          </div>
        </div>
      </Card>

      <p className="py-4 text-center text-xs text-[#8e8e93]">
        جميع الحقوق محفوظة © {new Date().getFullYear()}
      </p>
    </div>
  );
}
