import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { DischargeCase } from '../types';

let ttsClient: TextToSpeechClient | null = null;
try {
  ttsClient = new TextToSpeechClient();
} catch (e) {
  console.log('[GharCare TTS] Initialized in fallback mode (Browser Indian Speech Engine enabled).');
}

export interface AudioSection {
  title: string;
  text: string;
  timingEstimateSeconds: number;
}

export interface AudioScriptPayload {
  ssml: string;
  plainHindiScript: string;
  sections: AudioSection[];
  audioBase64?: string;
}

/**
 * Normalizes medicine names and Latin abbreviations for natural Indian speech synthesis
 */
function cleanMedForSpeech(name: string, dose?: string | null, food?: string | null): string {
  let cleanName = (name || 'दवा')
    .replace(/\bTab\.?\b/gi, 'गोली ')
    .replace(/\bCap\.?\b/gi, 'कैप्सूल ')
    .replace(/\bSyp\.?\b/gi, 'सिरप ')
    .replace(/\bInj\.?\b/gi, 'इंजेक्शन ')
    .replace(/\bXR\b/gi, 'एक्स आर ')
    .replace(/\bSR\b/gi, 'एस आर ')
    .replace(/\bmg\b/gi, 'मिलीग्राम ')
    .trim();

  let doseText = dose ? dose.replace(/\b1\s*Tab\b/gi, 'एक गोली').replace(/\b1\s*Cap\b/gi, 'एक कैप्सूल') : 'एक खुराक';
  let foodText = food === 'BEFORE_FOOD' ? 'नाश्ते से पहले खाली पेट' : 'भोजन के बाद';

  return `${cleanName}, ${doseText}, ${foodText}`;
}

export async function generateAwaazParchiScript(dischargeCase: DischargeCase): Promise<AudioScriptPayload> {
  const patientName = dischargeCase.patientDisplayName || 'मरीज़';
  
  // Day-part groupings
  const morningMeds = dischargeCase.medications.filter((m) =>
    m.timeSlots.some((s) => s.slot === 'MORNING')
  );
  const afternoonMeds = dischargeCase.medications.filter((m) =>
    m.timeSlots.some((s) => s.slot === 'AFTERNOON')
  );
  const eveningMeds = dischargeCase.medications.filter((m) =>
    m.timeSlots.some((s) => s.slot === 'EVENING')
  );
  const nightMeds = dischargeCase.medications.filter((m) =>
    m.timeSlots.some((s) => s.slot === 'NIGHT')
  );
  const sosMeds = dischargeCase.medications.filter((m) =>
    m.frequency.value === 'SOS'
  );

  const sections: AudioSection[] = [
    {
      title: 'प्रस्तावना (Introduction)',
      text: `नमस्ते जी। मैं अस्पताल से बोल रही हूँ। यह ${patientName} जी के लिए घर पर देखभाल और दवाइयों की अधिकृत आवाज़ पर्ची है। कृपया ध्यान से सुनें और चिंता न करें।`,
      timingEstimateSeconds: 7,
    },
  ];

  // Condition understanding
  if (dischargeCase.healthEducation?.pathology) {
    sections.push({
      title: 'बीमारी को समझें (About Recovery)',
      text: `${dischargeCase.healthEducation.pathology.howItArisesHindi || 'अस्पताल से जाने के बाद सही समय पर दवाइयां लेना और पर्याप्त आराम करना बहुत ज़रूरी है।'} नियमित देखभाल से आप बहुत जल्दी स्वस्थ हो जाएंगे।`,
      timingEstimateSeconds: 9,
    });
  }

  // Morning Medications
  if (morningMeds.length > 0) {
    const medList = morningMeds.map((m) => cleanMedForSpeech(m.brandName.value || '', m.prescribedDose.value, m.foodRelation.value)).join('। ');
    sections.push({
      title: 'सुबह की दवाइयाँ (Morning Medicines)',
      text: `सुबह के समय: ${medList}। दवा गुनगुने पानी के साथ ही लें।`,
      timingEstimateSeconds: 9,
    });
  }

  // Afternoon Medications
  if (afternoonMeds.length > 0) {
    const medList = afternoonMeds.map((m) => cleanMedForSpeech(m.brandName.value || '', m.prescribedDose.value, m.foodRelation.value)).join('। ');
    sections.push({
      title: 'दोपहर की दवाइयाँ (Afternoon Medicines)',
      text: `दोपहर के समय: ${medList}।`,
      timingEstimateSeconds: 7,
    });
  }

  // Evening & Night Medications
  const lateMeds = eveningMeds.concat(nightMeds);
  if (lateMeds.length > 0) {
    const medList = lateMeds.map((m) => cleanMedForSpeech(m.brandName.value || '', m.prescribedDose.value, m.foodRelation.value)).join('। ');
    sections.push({
      title: 'रात की दवाइयाँ (Night Medicines)',
      text: `रात को सोने से पहले: ${medList}।`,
      timingEstimateSeconds: 8,
    });
  }

  // SOS Emergency Medications
  if (sosMeds.length > 0) {
    const medList = sosMeds.map((m) => `${m.brandName.value || 'दवा'}, केवल ${m.sosCondition.value || 'तेज़ तकलीफ़ होने पर'}`).join('। ');
    sections.push({
      title: 'आपातकालीन दवा (SOS As Needed)',
      text: `ज़रूरत पड़ने पर: यह दवा हर रोज़ नहीं लेनी है। ${medList} ही इस्तेमाल करें।`,
      timingEstimateSeconds: 8,
    });
  }

  // Vitals & Doctor Follow-up Review
  const reviewDate = dischargeCase.followUp?.reviewDate?.value;
  sections.push({
    title: 'जांच व डॉक्टर से दोबारा मिलना (Vitals & OPD Visit)',
    text: `दैनिक जांच का नियम: ब्लड प्रेशर व बुखार नापकर अपनी 7-दिन की डायरी में ज़रूर दर्ज करें। ${reviewDate ? `तारीख ${reviewDate} को` : 'अगले सात दिनों में'} डॉक्टर के पास आते समय यह जांच चार्ट साथ लाना अनिवार्य है।`,
    timingEstimateSeconds: 10,
  });

  // Emergency Signs
  if (dischargeCase.warningSigns.length > 0) {
    const signs = dischargeCase.warningSigns.map((w) => w.symptomHindi).join(', या ');
    sections.push({
      title: 'खतरे के लक्षण (Emergency Red Flags)',
      text: `विशेष सावधानी: यदि अचानक ${signs} महसूस हो, तो बिल्कुल देर न करें और तुरंत अस्पताल की इमरजेंसी में फोन करें या नज़दीकी अस्पताल पहुंचें।`,
      timingEstimateSeconds: 10,
    });
  }

  const plainHindiScript = sections.map((s) => `${s.title}:\n${s.text}`).join('\n\n');

  const ssml = `
<speak>
  <p>
    <s>नमस्ते जी। यह ${patientName} जी के लिए घर पर देखभाल की अधिकृत आवाज़ पर्ची है।</s>
    <break time="600ms"/>
  </p>
  ${sections.slice(1).map((s) => `<p><s>${s.text}</s><break time="500ms"/></p>`).join('\n')}
</speak>
  `.trim();

  let audioBase64: string | undefined = undefined;

  if (ttsClient && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const [response] = await ttsClient.synthesizeSpeech({
        input: { ssml },
        voice: {
          languageCode: 'hi-IN',
          name: 'hi-IN-Neural2-A',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.88,
          pitch: 1.0,
        },
      });

      if (response.audioContent) {
        audioBase64 = Buffer.from(response.audioContent).toString('base64');
      }
    } catch (e: any) {
      console.warn('[GharCare TTS] Cloud synthesis note:', e.message);
    }
  }

  return {
    ssml,
    plainHindiScript,
    sections,
    audioBase64,
  };
}
