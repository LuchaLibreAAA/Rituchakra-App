export const localizeNumber = (num: number | string | undefined | null, lng: string): string => {
  if (num === null || num === undefined) return '--';
  const str = String(num);
  
  if (lng === 'bn') {
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return str.replace(/[0-9]/g, (w) => bnDigits[parseInt(w)]);
  }
  
  if (lng === 'hi') {
    const hiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return str.replace(/[0-9]/g, (w) => hiDigits[parseInt(w)]);
  }
  
  return str;
};

export const localizeDayName = (dateObj: Date, lng: string): string => {
  if (isNaN(dateObj.getTime())) return '';
  const day = dateObj.getDay();
  
  if (lng === 'bn') {
    const days = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
    return days[day];
  }
  
  if (lng === 'hi') {
    const days = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
    return days[day];
  }
  
  const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return daysEn[day];
};

export const localizeMonthName = (monthIdx: number, lng: string): string => {
  if (lng === 'bn') {
    const months = ['জানু', 'ফেব্রি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
    return months[monthIdx];
  }
  if (lng === 'hi') {
    const months = ['जन', 'फ़र', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नवं', 'दिस'];
    return months[monthIdx];
  }
  const monthsEn = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return monthsEn[monthIdx];
};

export const localizeDynamicText = (text: string, t: any, locName: string): string => {
  if (!text) return '';
  const city = locName.split(',')[0];
  const tLower = text.toLowerCase();
  
  if (tLower.includes('extremely heavy rainfall')) return t('extremeWarning', { loc: city });
  if (tLower.includes('river discharge is rising')) return t('floodAlert', { loc: city });
  if (tLower.includes('move livestock')) return t('action1', { loc: city });
  if (tLower.includes('do not irrigate')) return t('action2', { loc: city });
  
  // Try direct translation, fallback to original text
  const res = t(text);
  return res !== text ? res : text;
};

