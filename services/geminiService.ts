
import { GoogleGenAI } from "@google/genai";
import { Property, Job, Service } from "../types";

export const consultAI = async (
  message: string,
  item: Property | Job | Service,
  type: 'PROPERTY' | 'JOB' | 'SERVICE' = 'PROPERTY'
): Promise<string> => {
  try {
    // Fix: Accessing API_KEY exclusively via process.env as per GenAI SDK guidelines.
    // Assuming process.env.API_KEY is defined in the execution context (mapped in vite.config.ts).
    const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });

    let context = '';
    if (type === 'PROPERTY') {
      const p = item as Property;
      context = `شما یک مشاور املاک با تجربه در افغانستان (کابل، هرات، مزار و ...) هستید. 
      اطلاعات ملک کنونی:
      عنوان: ${p.title}
      شهر: ${p.city}
      قیمت: ${p.price} ${p.currency}
      نوع معامله: ${p.dealType}
      مساحت: ${p.area} متر مربع
      توضیحات: ${p.description}
      شما باید با توجه به نرخ‌های معمول در ${p.city} و نوع معامله (${p.dealType}) کاربر را راهنمایی کنید.`;
    } else if (type === 'JOB') {
      const j = item as Job;
      context = `شما مشاور استخدام در افغانستان هستید. شغل مورد بررسی: ${j.title} در شرکت ${j.company} با معاش ${j.salary} افغانی. کاربر را درباره شرایط بازار کار افغانستان در این رشته راهنمایی کنید.`;
    } else {
      const s = item as Service;
      context = `شما مشاور خدمات فنی هستید. خدمت: ${s.title} توسط ${s.providerName} با سابقه ${s.experience}. کاربر را درباره کیفیت و اعتماد به خدمات در افغانستان راهنمایی کنید.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${context}\n\nسوال کاربر: ${message}`,
      config: {
        systemInstruction: `شما یک دستیار هوشمند در اپلیکیشن "املاک افغان" هستید. 
        قوانین پاسخگویی:
        ۱. پاسخ‌ها را بسیار کوتاه (حداکثر ۲ یا ۳ جمله) بنویسید.
        ۲. از زبان فارسی دری رایج در افغانستان استفاده کنید.
        ۳. اگر قیمت ملک خیلی بالا یا خیلی پایین به نظر می‌رسد، محترمانه هشدار دهید.
        ۴. از کلمات قلمبه‌سلمبه پرهیز کنید. صمیمی و حرفه‌ای باشید.`,
        temperature: 0.8,
      }
    });

    return response.text || "متاسفانه پاسخی دریافت نشد.";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "در حال حاضر ارتباط با مشاور هوشمند برقرار نشد. لطفاً لحظاتی دیگر تلاش کنید.";
  }
};
