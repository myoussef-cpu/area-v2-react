// Typing Indicator Component
// Shows animated typing dots when AI is responding

import { useEffect } from 'react';

export function TypingIndicator() {
  useEffect(() => {
    const show = setTimeout(() => {}, 300);
    return () => clearTimeout(show);
  }, []);

  return (
    <div className="flex items-center space-x-1 pt-1">
      <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse"></div>
      <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse delay-100"></div>
      <div className="h-2 w-2 rounded-full bg-primary/50 animate-pulse delay-200"></div>
      <span className="text-xs text-muted-foreground">يجيب...</span>
    </div>
  );
}