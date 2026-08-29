import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English Translations
const en = {
  translation: {
    home: 'Home',
    analytics: 'Analytics',
    maps: 'Maps',
    data: 'Data',
    chat: 'Chat',
    searchPlaceholder: 'Search city, town or district...',
    actions: 'Actions',
    clearChat: 'Clear chat',
    regenerate: 'Regenerate',
    choosePreset: 'Choose a preset...',
    send: 'Send',
    englishSource: 'English source',
    sources: 'Sources',
    sourcesSub: 'Open for official names and methods.',
  },
};

// Hindi Translations
const hi = {
  translation: {
    home: 'होम',
    analytics: 'विश्लेषण',
    maps: 'नक्शे',
    data: 'डेटा',
    chat: 'चैट',
    searchPlaceholder: 'शहर, कस्बा या जिला खोजें...',
    actions: 'कार्रवाई',
    clearChat: 'चैट साफ़ करें',
    regenerate: 'पुनः उत्पन्न करें',
    choosePreset: 'एक विकल्प चुनें...',
    send: 'भेजें',
    englishSource: 'अंग्रेजी स्रोत',
    sources: 'स्रोत',
    sourcesSub: 'आधिकारिक नाम और तरीके के लिए खोलें।',
  },
};

// Bengali Translations
const bn = {
  translation: {
    home: 'হোম',
    analytics: 'বিশ্লেষণ',
    maps: 'মানচিত্র',
    data: 'ডেটা',
    chat: 'চ্যাট',
    searchPlaceholder: 'শহর, নগর বা জেলা অনুসন্ধান করুন...',
    actions: 'পদক্ষেপ',
    clearChat: 'চ্যাট মুছুন',
    regenerate: 'পুনরায় তৈরি করুন',
    choosePreset: 'একটি প্রিসেট চয়ন করুন...',
    send: 'পাঠান',
    englishSource: 'ইংরেজি উৎস',
    sources: 'উৎস',
    sourcesSub: 'অফিসিয়াল নাম এবং পদ্ধতির জন্য খুলুন।',
  },
};

i18n.use(initReactI18next).init({
  resources: {
    en,
    hi,
    bn,
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

export default i18n;
