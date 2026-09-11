const translateCache = new Map<string, string>();

export async function fetchTranslation(text: string, targetLang: string): Promise<string> {
  // Always skip English since it's the base language
  if (!text || targetLang === 'en') return text;

  const cacheKey = `${targetLang}:${text}`;
  if (translateCache.has(cacheKey)) {
    return translateCache.get(cacheKey)!;
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.warn('MyMemory API error:', res.status, res.statusText);
      return text;
    }

    const rawText = await res.text();
    try {
      const data = JSON.parse(rawText);
      if (data.responseData && data.responseData.translatedText) {
        translateCache.set(cacheKey, data.responseData.translatedText);
        return data.responseData.translatedText;
      }
    } catch (parseErr) {
      console.warn('MyMemory JSON parse error. Raw response preview:', rawText.slice(0, 150));
    }
  } catch (err) {
    console.warn('MyMemory fetch failed:', err);
  }

  return text;
}
