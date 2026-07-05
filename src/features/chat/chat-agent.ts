import type { ChatMessage, ToolResult, ConversionResult } from './chat-types';
import { callNVIDIA } from './llm-service';
import { matchIntent, executeIntent } from './intent-engine';

const CONTEXT_WINDOW = 10;

function formatResultForLLM(result: ToolResult | ConversionResult): string {
  const lines = [
    `\n[نتيجة الأداة: ${result.toolName}]`,
    `الملخص: ${result.summary}`,
  ];
  if (result.details) {
    lines.push(`التفاصيل:\n${result.details}`);
  }
  lines.push('[/نتيجة الأداة]\n');
  return lines.join('\n');
}

export class ChatAgent {
  async processMessage(userMessage: string, history: ChatMessage[]): Promise<ChatMessage> {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };

    const context = [...history, userMsg].slice(-CONTEXT_WINDOW);

    const intent = matchIntent(userMessage);
    let toolResult: ToolResult | ConversionResult | null = null;

    if (intent && (!intent.missing || intent.missing.length === 0)) {
      try {
        toolResult = await executeIntent(intent);
      } catch {
        // fall through to LLM
      }
    }

    const llmMessages = context.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    if (toolResult) {
      const last = llmMessages[llmMessages.length - 1];
      last.content +=
        '\n\n---\n' +
        '**نظام الحسابات:** تم تنفيذ الحساب التالي تلقائياً. اشرح النتيجة للمستخدم بلغة عربية واضحة. لا تذكر أنك "لست متأكداً" من الحساب — النتيجة دقيقة.\n' +
        formatResultForLLM(toolResult);
    }

    try {
      const reply = await callNVIDIA(llmMessages);

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };

      if (toolResult) {
        assistantMsg.results = [toolResult];
      }

      return assistantMsg;
    } catch (err) {
      return {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `<p>عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي.</p><p style="color:#94a3b8;font-size:0.85em">${err instanceof Error ? err.message : 'حاول مرة أخرى'}</p>`,
        timestamp: Date.now(),
      };
    }
  }
}

export const chatAgent = new ChatAgent();
