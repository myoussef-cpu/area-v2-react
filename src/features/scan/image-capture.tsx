import { useRef, useCallback, useState } from 'react';
import { Camera, Upload, X, ImageIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface ImageCaptureProps {
  onImageCapture: (dataUrl: string) => void;
  disabled?: boolean;
}

export function ImageCapture({ onImageCapture, disabled }: ImageCaptureProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        setPreview(url);
        onImageCapture(url);
      };
      reader.readAsDataURL(file);
    },
    [onImageCapture]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(video, 0, 0);
      stream.getTracks().forEach((t) => t.stop());

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreview(dataUrl);
      onImageCapture(dataUrl);
    } catch {
      // fallback to file picker
      fileRef.current?.click();
    }
  }, [onImageCapture]);

  const clearPreview = useCallback(() => {
    setPreview(null);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={handleCamera}
          disabled={disabled}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium',
            'bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-800',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
        >
          <Camera className="h-4 w-4" />
          تصوير
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium',
            'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100',
            'dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
        >
          <Upload className="h-4 w-4" />
          رفع صورة
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {preview && (
        <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-700">
          <img
            src={preview}
            alt="المعاينة"
            className="max-h-[400px] w-full object-contain bg-gray-100 dark:bg-zinc-900"
          />
          <button
            onClick={clearPreview}
            className="absolute left-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors"
            aria-label="إزالة الصورة"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 right-2 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
            <ImageIcon className="inline h-3 w-3 ml-1" />
            جاهزة للتحليل
          </div>
        </div>
      )}
    </div>
  );
}
