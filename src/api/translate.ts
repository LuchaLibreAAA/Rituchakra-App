const translateCache = new Map<string, string>();

export async function fetchTranslation(text: string, targetLang: string): Promise<string> {
  // Always skip English since it's the base language
  if (!text || targetLang === 'en') return text;

  const cacheKey = `${targetLang}:${text}`;
  if (translateCache.has(cacheKey)) {
    return translateCache.get(cacheKey)!;
  }

  try {
    const res = await fetch("https://libretranslate.de/translate", {
      method: "POST",
      body: JSON.stringify({
        q: text,
        source: "en",
        target: targetLang,
        format: "text"
      }),
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      console.warn('LibreTranslate API error:', res.status, res.statusText);
      return text;
    }

    const data = await res.json();
    if (data.translatedText) {
      translateCache.set(cacheKey, data.translatedText);
      return data.translatedText;
    }
  } catch (err) {
    console.warn('LibreTranslate fetch failed:', err);
  }

  return text;
}
