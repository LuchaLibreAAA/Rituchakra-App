export interface ChatMessage {
  id: string;
  role: 'user' | 'advisor';
  content: string;
  timestamp: string;
}

export const mockChatResponses: Record<string, string> = {
  'WB FLOOD RANKING': 'Currently, Haldia and nearby coastal districts in West Bengal have the highest flood risk due to an active cyclone threat and extreme rainfall warnings (IMD-CAP). Low-lying areas in Purba Medinipur are at highest immediate risk.',
  'SHOULD I IRRIGATE?': 'No, you should not irrigate in the next 24 hours. There is a 99% probability of heavy rainfall (42.5mm expected on Aug 30) and the soil moisture is currently high.',
  '7-DAY OUTLOOK': 'The 7-day outlook shows continuous rainfall with the heaviest pulse expected on Friday, Aug 30 (42.5mm). Temperatures will range between 30°C and 33.5°C. A flood watch is active.',
  'default': 'Based on the current meteorological data for Haldia, we recommend holding off on any irrigation and securing livestock. How else can I assist you?',
};
