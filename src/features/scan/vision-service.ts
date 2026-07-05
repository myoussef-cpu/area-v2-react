const INVOKE_URL = '/api/nvidia/v1/chat/completions';

const TOOLS_FIELDS = `
## الأدوات والحقول المطلوبة لكل أداة (استخدم هذه المفاتيح بالضبط):

### المساحات:
- trapezoid (شبه منحرف): a=القاعدة الصغرى, b=القاعدة الكبرى, L1=الضلع المائل الأول, L2=الضلع المائل الثاني, h=الارتفاع
- triangle (مثلث): base=القاعدة, height=الارتفاع, a=الضلع الأول, b=الضلع الثاني, c=الضلع الثالث
- circle-sector (دائرة/قطاع/بيضاوي): r=نصف القطر, angle=الزاوية, a=نصف المحور الأفقي, b=نصف المحور الرأسي
- regular-polygon (مضلع منتظم): n=عدد الأضلاع, side=طول الضلع
- square (مربع): side=طول الضلع
- rectangle (مستطيل): w=العرض, h=الارتفاع
- parallelogram (متوازي أضلاع): base=القاعدة, height=الارتفاع, side=الضلع الجانبي
- rhombus (معين): d1=القطر الأول, d2=القطر الثاني
- kite (طائرة ورقية): d1=القطر الأول, d2=القطر الثاني, a=الضلع الأول, b=الضلع الثاني
- annulus (حلقة): R=نصف القطر الخارجي, r=نصف القطر الداخلي
- cyclic-quadrilateral (رباعي دائري): a=الضلع الأول, b=الضلع الثاني, c=الضلع الثالث, d=الضلع الرابع
- irregular-quadrilateral (رباعي غير منتظم): a=الضلع الأول, b=الضلع الثاني, c=الضلع الثالث, d=الضلع الرابع, diag=القطر

### الحجوم:
- volumes-3d (أسطوانة/كرة/مخروط): r=نصف القطر, h=الارتفاع
- cube (مكعب): side=طول الضلع
- pyramid (هرم): h=الارتفاع, side=طول القاعدة, w=العرض, l=الطول
- frustum-cone (مخروط ناقص): R1=نصف القطر العلوي, R2=نصف القطر السفلي, h=الارتفاع
- capsule (كبسولة): r=نصف القطر, h=الارتفاع
- ellipsoid (بيضاوي): a=نصف المحور الأول, b=نصف المحور الثاني, c=نصف المحور الثالث

### التشييد:
- concrete-calc (خرسانة): l=الطول, w=العرض, t=السماكة, d=القطر, h=الارتفاع
- land-leveling (تسوية): orig=المنسوب الأصلي, req=المنسوب المطلوب, area=المساحة
- bricks-calc (طوب): wallL=طول الجدار, wallH=ارتفاع الجدار
- tiles-calc (سيراميك): roomL=طول الغرفة, roomW=عرض الغرفة
- paint-calc (دهان): area=المساحة, coats=عدد الوجوه, coverage=التغطية
- steel-weight (حديد): d=قطر السيخ, len=الطول, qty=العدد
- steel-plate (صاج): L=الطول, W=العرض, T=السماكة
- excavation (حفر): L=الطول, W=العرض, depth=العمق, slope=الميل
- plastering (محارة): area=المساحة, thick=السماكة

### الكهرباء:
- ohms-law (قانون أوم): voltage=الجهد, current=التيار, resistance=المقاومة
- elec-power (قدرة كهربائية): voltage=الجهد, current=التيار, pf=معامل القدرة
- volt-drop (هبوط جهد): length=الطول, current=التيار, size=المساحة, voltage=الجهد, pf=معامل القدرة
- wire-size (مقاس سلك): current=التيار, voltage=الجهد, length=الطول

### الفيزياء:
- speed-dist (سرعة): distance=المسافة, time=الزمن, speed=السرعة
- force-calc (قوة): mass=الكتلة, accel=التسارع, gravity=الجاذبية
- torque-calc (عزم): force=القوة, dist=المسافة, rpm=عدد اللفات
- hydraulic-force (هيدروليك): bore=قطر السلندر, rod=قطر الذراع, pressure=الضغط

### الرياضيات:
- pythagoras (فيثاغورس): a=الضلع الأول, b=الضلع الثاني, c=الوتر
- trigonometry (مثلثات): val=الزاوية
- percentage (نسبة مئوية): a=الجزء, b=الكلي
- quadratic (تربيعية): a=معامل س², b=معامل س, c=الحد الثابت
- scale-map (مقياس رسم): actual=الحقيقي, mapDist=على الخريطة, scale=المقياس
- slope-deg (ميل): pct=النسبة, deg=الدرجة, rise=الارتفاع, run=الأساس
- ratio-calc (تناسب): a=الأول, b=الثاني, c=الثالث
- unit-price (سعر وحدة): qty1=الكمية الأولى, price1=سعر الأولى, qty2=الكمية الثانية, price2=سعر الثانية
`;

const SYSTEM_PROMPT = `أنت خبير في قراءة الرسومات الهندسية واليدوية واستخراج الأبعاد منها بدقة.

مهمتك: حلل الصورة واستخرج المعلومات الهندسية.

لديك القائمة الكاملة للأدوات والحقول المتاحة. استخدم أسماء الحقول بالضبط كما هي مذكورة.

${TOOLS_FIELDS}

قواعد تحديد الأداة المناسبة:
- إذا كان الشكل مثلث: استخدم triangle، الحقول: base, height (أو a, b, c لهيرون)
- إذا كان الشكل مربع: استخدم square، الحقل: side
- إذا كان الشكل مستطيل: استخدم rectangle، الحقلين: w, h
- إذا كان شكل شبه منحرف: استخدم trapezoid، الحقول: a, b, L1, L2 (أو a, b, h)
- إذا كان شكل دائرة: استخدم circle-sector، الحقل: r
- إذا كان شكل متوازي أضلاع: استخدم parallelogram، الحقول: base, height
- إذا كان شكل معين أو طائرة ورقية: استخدم kite أو rhombus حسب الشكل
- إذا كان شكل مكعب: استخدم cube، الحقل: side
- إذا كان شكل أسطوانة أو كرة: استخدم volumes-3d، الحقول: r, h
- إذا كانت المسألة فيثاغورس: استخدم pythagoras، الحقول: a, b, c

أعد النتيجة بتنسيق JSON فقط بدون أي نصوص إضافية:
{
  "toolId": "معرف الأداة من القائمة أعلاه",
  "inputs": {"المفتاح": القيمة},
  "unit": "وحدة القياس (م, م², م³, سم, إلخ)",
  "summary": "وصف مختصر للشكل والنتيجة (بالعربية)",
  "details": "تفاصيل الأبعاد المستخرجة مع الخطوات (بالعربية)",
  "inputSpecs": [
    {"key": "مفتاح الحقل", "label": "اسم البعد بالعربية", "value": القيمة, "unit": "الوحدة"}
  ]
}

مهم جداً: أسماء الحقول في inputs يجب أن تطابق بالضبط المفاتيح المذكورة في قائمة الأدوات أعلاه.
مثال صحيح لشبه منحرف:
{
  "toolId": "trapezoid",
  "inputs": {"a": 4, "b": 8, "L1": 5, "L2": 5},
  "unit": "م",
  "summary": "شبه منحرف قاعدتيه 4 و 8 متر وضلعيه المائلين 5 متر",
  "details": "الأبعاد المستخرجة:\nالقاعدة الصغرى (a) = 4 م\nالقاعدة الكبرى (b) = 8 م\nالضلع المائل الأول (L₁) = 5 م\nالضلع المائل الثاني (L₂) = 5 م",
  "inputSpecs": [
    {"key": "a", "label": "القاعدة الصغرى", "value": 4, "unit": "م"},
    {"key": "b", "label": "القاعدة الكبرى", "value": 8, "unit": "م"},
    {"key": "L1", "label": "الضلع المائل الأول", "value": 5, "unit": "م"},
    {"key": "L2", "label": "الضلع المائل الثاني", "value": 5, "unit": "م"}
  ]
}`;

export async function analyzeImage(imageDataUrl: string): Promise<string> {
  const apiKey = import.meta.env.VITE_NVIDIA_API_KEY;

  if (!apiKey) {
    throw new Error('المفتاح غير موجود. أضف VITE_NVIDIA_API_KEY في ملف .env');
  }

  const response = await fetch(INVOKE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/diffusiongemma-26b-a4b-it',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'استخرج القياسات والأبعاد من هذه الصورة الهندسية وأعدها كـ JSON.' },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
      max_tokens: 2048,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Vision API ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}
