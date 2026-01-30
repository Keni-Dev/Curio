/**
 * Demo AI Responses
 *
 * Pre-scripted responses for OCR and MediBot in demo mode.
 * Provides realistic demo experiences without API calls.
 */

import type { Message } from '@/features/medi-bot/types';

// =============================================================================
// OCR DEMO RESPONSES
// =============================================================================

export interface DemoOCRResult {
  medicines: Array<{
    name: string;
    dosage: string | null;
    instructions: string | null;
    confidence: number;
  }>;
  isPrescription: boolean;
  confidence: number;
  rawText: string;
}

/**
 * Pre-defined OCR demo scenarios.
 * Each scenario simulates different prescription types.
 */
export const DEMO_OCR_SCENARIOS: DemoOCRResult[] = [
  {
    medicines: [
      {
        name: 'Metformin',
        dosage: '500mg',
        instructions: 'Take twice daily after meals',
        confidence: 0.95,
      },
      {
        name: 'Losartan',
        dosage: '50mg',
        instructions: 'Take once daily in the morning',
        confidence: 0.92,
      },
      {
        name: 'Amlodipine',
        dosage: '5mg',
        instructions: 'Take once daily',
        confidence: 0.89,
      },
    ],
    isPrescription: true,
    confidence: 0.92,
    rawText: 'Rx\nMetformin 500mg - 1 tab BID pc\nLosartan 50mg - 1 tab OD AM\nAmlodipine 5mg - 1 tab OD',
  },
  {
    medicines: [
      {
        name: 'Amoxicillin',
        dosage: '500mg',
        instructions: 'Take three times daily for 7 days',
        confidence: 0.94,
      },
      {
        name: 'Paracetamol',
        dosage: '500mg',
        instructions: 'Take every 4-6 hours as needed for fever',
        confidence: 0.96,
      },
    ],
    isPrescription: true,
    confidence: 0.95,
    rawText: 'Rx\nAmoxicillin 500mg - 1 cap TID x 7 days\nParacetamol 500mg - 1 tab q4-6h PRN for fever',
  },
  {
    medicines: [
      {
        name: 'Omeprazole',
        dosage: '20mg',
        instructions: 'Take once daily before breakfast',
        confidence: 0.91,
      },
      {
        name: 'Domperidone',
        dosage: '10mg',
        instructions: 'Take three times daily before meals',
        confidence: 0.88,
      },
    ],
    isPrescription: true,
    confidence: 0.89,
    rawText: 'Rx\nOmeprazole 20mg - 1 cap OD ac breakfast\nDomperidone 10mg - 1 tab TID ac',
  },
];

let currentScenarioIndex = 0;

/**
 * Demo OCR extraction.
 * Rotates through pre-defined scenarios for variety.
 * @param imageBase64 - Image data (ignored in demo mode)
 */
export async function demoExtractPrescription(
  imageBase64: string
): Promise<DemoOCRResult> {
  void imageBase64; // Ignored in demo mode
  // Simulate longer processing time for OCR
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

  const scenario = DEMO_OCR_SCENARIOS[currentScenarioIndex]!;
  currentScenarioIndex = (currentScenarioIndex + 1) % DEMO_OCR_SCENARIOS.length;

  console.log('[Demo Mode] OCR extraction completed');

  return scenario;
}

// =============================================================================
// MEDI-BOT DEMO RESPONSES
// =============================================================================

/**
 * Pre-defined MediBot responses for common queries.
 * Maps keywords to appropriate responses.
 */
const DEMO_BOT_RESPONSES: Array<{
  keywords: string[];
  response: string;
}> = [
  {
    keywords: ['hello', 'hi', 'hey', 'kumusta', 'magandang'],
    response: `Kumusta! 👋 Ako ang Medi-Bot, ang iyong AI health assistant.

Makakatulong ako sa mga sumusunod:
• 💊 Impormasyon tungkol sa mga gamot
• 🏥 Mga payo sa kalusugan
• 📍 Paghahanap ng pinakamalapit na botika

Ano ang maitutulong ko sa iyo ngayon?`,
  },
  {
    keywords: ['headache', 'sakit ng ulo', 'migraine', 'head'],
    response: `Para sa sakit ng ulo, narito ang ilang mungkahi:

**Mga Gamot na Maaaring Makatulong:**
• **Paracetamol (Biogesic)** - 500mg, 1 tablet every 4-6 hours
• **Ibuprofen (Advil, Medicol)** - 200-400mg, may pagkain

**Mga Payo:**
• Magpahinga sa madilim at tahimik na lugar
• Uminom ng maraming tubig
• Lagyan ng cold compress ang noo

**Kailan dapat magpatingin sa doktor:**
• Kung ang sakit ng ulo ay bigla at matindi
• May kasamang lagnat, stiff neck, o pagkalito
• Hindi gumagaling pagkatapos ng 2-3 araw

⚠️ *Ito ay pangkalahatang impormasyon lamang. Kumonsulta sa doktor para sa tamang diagnosis.*`,
  },
  {
    keywords: ['fever', 'lagnat', 'init', 'temperature'],
    response: `Para sa lagnat, narito ang gabay:

**Mga Gamot:**
• **Paracetamol (Biogesic, Tempra)** - 500mg every 4-6 hours
• Para sa bata: Tempra syrup ayon sa timbang

**Mga Payo:**
• Magpahinga at uminom ng maraming tubig
• Magsuot ng manipis na damit
• Maglagay ng wet towel sa noo

**Kailan dapat magpatingin:**
• Lagnat na 39°C (102°F) pataas
• Lagnat na tumatagal ng higit 3 araw
• May kasamang rashes o hirap huminga

💊 *Ang Biogesic ay available sa karamihan ng botika. I-search mo sa Curio para malaman kung saan may stock!*`,
  },
  {
    keywords: ['cough', 'ubo', 'sipon', 'cold', 'flu'],
    response: `Para sa ubo at sipon:

**Para sa Dry Cough:**
• **Dextromethorphan (Robitussin DM)** - para sa tusong ubo

**Para sa Productive Cough (may plema):**
• **Carbocisteine (Solmux)** - 500mg, 3x a day
• **Lagundi (Ascof)** - herbal option, safe

**Para sa Sipon:**
• **Phenylephrine (Neozep, Bioflu)** - for decongestion
• **Cetirizine (Zyrtec)** - for runny nose

**Mga Payo:**
• Maraming tubig at mainit na sabaw
• Steam inhalation
• Magpahinga nang sapat

🏥 *Kung ang ubo ay tumatagal ng higit 2 linggo, magpakonsulta sa doktor.*`,
  },
  {
    keywords: ['diabetes', 'blood sugar', 'asukal', 'metformin'],
    response: `Tungkol sa Diabetes:

**Karaniwang Gamot:**
• **Metformin** - Ang pinaka-common na gamot para sa Type 2 Diabetes
• Karaniwang dose: 500mg, 1-2x a day kasama ang pagkain

**Mahalagang Paalala:**
• Ang Metformin ay nangangailangan ng reseta
• Regular na blood sugar monitoring
• Sundin ang diet plan mula sa doktor

**Lifestyle Tips:**
• Iwasan ang matamis na pagkain at inumin
• Regular na exercise (30 mins daily)
• Kumain ng maraming gulay at fiber

⚠️ *Ang diabetes ay seryosong kondisyon. Palaging kumonsulta sa iyong doktor bago baguhin ang gamot.*`,
  },
  {
    keywords: ['blood pressure', 'hypertension', 'high bp', 'losartan', 'amlodipine'],
    response: `Tungkol sa High Blood Pressure:

**Karaniwang Gamot (nangangailangan ng reseta):**
• **Losartan** - 50-100mg, once daily
• **Amlodipine** - 5-10mg, once daily
• Madalas combined ang dalawang ito

**Lifestyle Changes:**
• Bawasan ang asin sa pagkain
• Regular exercise (30 mins, 5x a week)
• Iwasan ang stress
• Bawasan ang alcohol
• Quit smoking

**Monitoring:**
• Check BP regularly (goal: <140/90)
• Monthly check-up sa health center

🩺 *Ang high blood pressure gamot ay lifetime maintenance. Huwag itigil nang walang advice ng doktor.*`,
  },
  {
    keywords: ['stomach', 'tiyan', 'hyperacidity', 'gastric', 'ulcer'],
    response: `Para sa sakit ng tiyan at hyperacidity:

**OTC Options:**
• **Kremil-S** - antacid, fast relief
• **Aluminum/Magnesium Hydroxide (Maalox)** - antacid

**Para sa mas madalas na hyperacidity:**
• **Omeprazole** - 20mg, once daily before breakfast
• **Ranitidine** - 150mg, 2x daily (if available)

**Mga Payo:**
• Kumain ng maliit pero madalas
• Iwasan ang maanghang at maalat na pagkain
• Huwag humiga kaagad pagkatapos kumain
• Bawasan ang kape at soft drinks

🏥 *Kung may blood sa dumi o suka, o malakas na sakit, agad na magpatingin sa doktor.*`,
  },
  {
    keywords: ['allergy', 'allergies', 'kati', 'rashes', 'pantal'],
    response: `Para sa allergy at pantal:

**Antihistamines:**
• **Cetirizine (Zyrtec, Virlix)** - 10mg, once daily
• **Loratadine (Claritin)** - 10mg, once daily
• Non-drowsy options available

**Para sa Skin Rashes:**
• **Hydrocortisone cream** - for itchy rashes
• **Calamine lotion** - soothing relief

**Mga Payo:**
• Alamin at iwasan ang allergy trigger
• Huwag kamutin para hindi lumala
• Malinis at dry dapat ang affected area

⚠️ *Kung may hirap huminga o swelling ng labi/dila, emergency ito - tumawag ng 911 o pumunta sa ER.*`,
  },
  {
    keywords: ['vitamin', 'supplement', 'immune', 'immunity'],
    response: `Tungkol sa Vitamins at Supplements:

**Recommended Daily:**
• **Vitamin C** - 500-1000mg for immunity
• **Vitamin D** - especially kung madalang sa araw
• **Zinc** - 10-15mg for immune support

**Popular Options:**
• **Enervon** - B-complex + C
• **Berocca** - B vitamins + minerals
• **Centrum** - complete multivitamin

**Natural Sources:**
• Vitamin C: Calamansi, orange, guava
• Vitamin D: Sunlight (15-20 mins morning)
• Zinc: Meat, shellfish, legumes

💡 *Balanced diet pa rin ang best source ng vitamins. Supplements ay pandagdag lang.*`,
  },
  {
    keywords: ['pharmacy', 'botika', 'drugstore', 'gamot', 'medicine', 'where', 'saan'],
    response: `Para mahanap ang gamot na kailangan mo:

**Sa Curio App:**
1. 🔍 I-search ang pangalan ng gamot
2. 📍 Makikita mo ang mga botika na may stock
3. 🗺️ May mapa para makita ang pinakamalapit

**Tips:**
• I-check ang "Stock Status" - green means available
• Makikita mo rin ang estimated price range
• Pwede ka mag-contribute ng stock report para makatulong sa iba!

🏥 *Kung may reseta ka, dalhin ito sa botika. Ang mga controlled medicines ay hindi ibebenta ng walang prescription.*`,
  },
  {
    keywords: ['thank', 'salamat', 'thanks', 'maraming salamat'],
    response: `Walang anuman! 🙏

Natutuwa akong nakatulong sa iyo. Kung may iba ka pang katanungan tungkol sa kalusugan o mga gamot, nandito lang ako.

**Reminders:**
• Palaging kumonsulta sa doktor para sa diagnosis
• Basahin ang label bago uminom ng gamot
• Huwag mag-self-medicate ng matagal

Ingat ka palagi! 💚`,
  },
];

/**
 * Default response when no keywords match.
 */
const DEFAULT_BOT_RESPONSE = `Salamat sa tanong mo! 

Bilang AI health assistant, makakatulong ako sa:
• 💊 Impormasyon tungkol sa mga gamot
• 🏥 Pangkalahatang payo sa kalusugan
• 📍 Paghanap ng botika gamit ang Curio

Para mas matulungan kita, puwede mo bang i-describe ang:
• Ano ang nararamdaman mo?
• Anong gamot ang hinahanap mo?
• O may specific na tanong ka ba?

⚠️ *Reminder: Ang mga sagot ko ay para sa impormasyon lamang at hindi pamalit sa consultation sa doktor.*`;

/**
 * Generate demo MediBot response based on user message.
 * @param userMessage - The user's message
 * @param conversationHistory - Previous messages (ignored in demo mode)
 */
export async function demoGenerateBotResponse(
  userMessage: string,
  conversationHistory?: Message[]
): Promise<string> {
  void conversationHistory; // Ignored in demo mode
  // Simulate AI thinking time
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200));

  const lowerMessage = userMessage.toLowerCase();

  // Find matching response based on keywords
  for (const item of DEMO_BOT_RESPONSES) {
    if (item.keywords.some((keyword) => lowerMessage.includes(keyword))) {
      console.log('[Demo Mode] MediBot response matched:', item.keywords[0]);
      return item.response;
    }
  }

  console.log('[Demo Mode] MediBot using default response');
  return DEFAULT_BOT_RESPONSE;
}

/**
 * Generate unique message ID for demo.
 */
export function generateDemoMessageId(): string {
  return `demo-msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
