// In dev, Vite proxy handles CORS; in production, deploy a backend proxy.
const INVOKE_URL = '/api/nvidia/v1/chat/completions';

interface LLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface LLMChoice {
  message: { content: string };
}

interface LLMResponse {
  choices: LLMChoice[];
}

const SYSTEM_PROMPT = `أنت مساعد هندسي متكامل اسمك "المهندس". أجب باللغة العربية الفصحى دائماً.

## شخصيتك
- خبير هندسي شامل في المساحة، الحجوم، التحويلات، الفيزياء، الكهرباء، الرياضيات
- ودود ومتعاون ومحترف
- تشرح الخطوات بوضوح وتظهر النتائج بدقة

## تنسيق الرد
استخدم **Markdown** في تنسيق النصوص.

### القواعد الأساسية
- استخدم ## للعناوين و ### للعناوين الفرعية
- الجداول بصيغة Markdown
- القوائم بـ - أو 1.
- الكود العادي بـ \`\`\` مع اسم اللغة
- **عريض** و *مائل*
- الأرقام بالعربية أو الهندية حسب السياق

### رسم الأشكال
عندما تريد رسم شكل اكتب الكود داخل \`\`\`html و سيعرض تلقائياً — لا تخبر المستخدم "انسخ الكود".

#### رسم Canvas 2D:
\`\`\`html
<canvas id="c" width="320" height="220"></canvas>
<script>
  const ctx = document.getElementById('c').getContext('2d');
  // ارسم ما تريد
</script>
\`\`\`

**تنبيه مهم:** اكتب \`\`\`\`html فقط و سأنا سأعرضه. لا تقل "انسخ الكود" أو "شغل هذا".`;

export async function callNVIDIA(
  messages: LLMMessage[],
  onChunk?: (text: string) => void,
): Promise<string> {
  const apiKey = import.meta.env.VITE_NVIDIA_API_KEY;

  if (!apiKey) {
    throw new Error('المفتاح غير موجود. أضف VITE_NVIDIA_API_KEY في ملف .env');
  }

  const fullMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ];

  const response = await fetch(INVOKE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/diffusiongemma-26b-a4b-it',
      messages: fullMessages,
      max_tokens: 4096,
      temperature: 1.00,
      top_p: 0.95,
      stream: !!onChunk,
      chat_template_kwargs: { enable_thinking: true },
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`NVIDIA API ${response.status}: ${text}`);
  }

  if (onChunk) {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

      for (const line of lines) {
        try {
          const json = JSON.parse(line.slice(6));
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            full += content;
            onChunk(full);
          }
        } catch {
          // skip partial lines
        }
      }
    }

    return full;
  }

  const data: LLMResponse = await response.json();
  return data.choices[0].message.content;
}
