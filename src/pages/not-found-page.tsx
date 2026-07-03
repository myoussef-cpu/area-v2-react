import { useNavigate } from 'react-router-dom';
import { Home, Frown } from 'lucide-react';
import { Button } from '../shared/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-8">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Frown className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mb-1 text-xl font-bold">الصفحة غير موجودة</h2>
      <p className="mb-6 text-sm text-[#8e8e93]">عذراً، الصفحة التي تبحث عنها غير متاحة</p>
      <Button onClick={() => navigate('/')}>
        <Home className="ml-2 h-4 w-4" />
        العودة للرئيسية
      </Button>
    </div>
  );
}
