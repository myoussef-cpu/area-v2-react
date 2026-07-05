import { useMemo } from 'react';
import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface HtmlMessageProps {
  html: string;
  dark?: boolean;
}

function preprocessMarkdown(md: string): string {
  let result = md;
  result = result.replace(/<environment_details[\s\S]*?<\/environment_details>/gi, '');
  result = result.replace(/<\/?(?:head|title|body|html)(?:\s[^>]*)?>/gi, '');
  result = result.replace(/<!DOCTYPE[^>]*>/gi, '');
  result = result.replace(/```(?:html|js|javascript)\s*\n([\s\S]*?)```/g, (_, content) => {
    const trimmed = content.trim();
    if (/<canvas[\s>]|<script[\s>]|<div[\s>]/.test(trimmed)) {
      return `\n\n${trimmed}\n\n`;
    }
    return `\`\`\`\n${trimmed}\n\`\`\``;
  });
  return result;
}

export function HtmlMessage({ html, dark = false }: HtmlMessageProps) {
  const rendered = useMemo(() => {
    const processed = preprocessMarkdown(html);
    const placeholders: { placeholder: string; html: string }[] = [];
    const katexized = processed.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false });
        const idx = placeholders.length;
        const placeholder = `\n\n<!--KATEX_${idx}-->\n\n`;
        placeholders.push({ placeholder, html: rendered });
        return placeholder;
      } catch { return match; }
    }).replace(/\$([^\n]+?)\$/g, (match, formula) => {
      try {
        const rendered = katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false });
        const idx = placeholders.length;
        const placeholder = `<!--KATEX_${idx}-->`;
        placeholders.push({ placeholder, html: rendered });
        return placeholder;
      } catch { return match; }
    });
    const parsed = marked.parse(katexized, { async: false }) as string;
    let restored = parsed;
    placeholders.forEach(({ placeholder, html: katexHtml }) => {
      restored = restored.replace(placeholder, katexHtml);
    });
    return restored;
  }, [html]);

  const bgColor = dark ? '#000000' : '#f2f2f7';
  const fgColor = dark ? '#e2e8f0' : '#1e293b';

  return (
    <div
      style={{
        background: bgColor,
        color: fgColor,
        borderRadius: '0px',
        padding: '8px 0',
        lineHeight: 1.8,
        fontSize: '0.9375rem',
        fontFamily: "'Tajawal', system-ui, sans-serif",
        overflowX: 'auto',
        overflowY: 'visible',
      }}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}
