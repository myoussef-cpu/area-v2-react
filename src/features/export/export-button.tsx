import { Camera } from 'lucide-react';
import { Button } from '../../shared/ui/button';

interface ExportButtonProps {
  targetId: string;
  filename?: string;
  label?: string;
}

export function ExportButton({ targetId, filename = 'result.png', label = 'تصدير كصورة' }: ExportButtonProps) {
  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        backgroundColor: document.documentElement.classList.contains('dark') ? '#000000' : '#ffffff',
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleExport}>
      <Camera className="ml-2 h-4 w-4" />
      {label}
    </Button>
  );
}
