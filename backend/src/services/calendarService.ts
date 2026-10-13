import { DischargeCase } from '../types';

export interface CalendarEventPayload {
  title: string;
  description: string;
  timeSlot: string;
  time: string;
  durationDays: number;
  googleCalendarUrl: string;
}

export function generateCalendarEvents(dischargeCase: DischargeCase): {
  events: CalendarEventPayload[];
  icsContent: string;
} {
  const events: CalendarEventPayload[] = [];
  const patientName = dischargeCase.patientDisplayName;

  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  dischargeCase.medications.forEach((med) => {
    const medName = med.brandName.value || 'दवा (Medicine)';
    const dose = med.prescribedDose.value || '1 dose';
    const food = med.foodRelation.value === 'AFTER_FOOD' ? 'खाने के बाद (After food)' : 'खाने से पहले (Before food)';
    const duration = med.durationDays.value || 14;

    med.timeSlots.forEach((slot) => {
      const timeFormatted = slot.standardTime.replace(':', '') + '00';
      const title = `💊 GharCare: ${medName} - ${dose}`;
      const description = `रोगी (Patient): ${patientName}\nदवा (Medicine): ${medName} (${med.strength.value || ''})\nखुराक (Dose): ${dose}\nसमय (Timing): ${slot.slot} (${slot.standardTime})\nभोजन (Food): ${food}\nनिर्देश: ${med.instructionsPlainHindi || ''}`;

      // Google Calendar 1-Click web link
      const startIso = `${todayStr}T${timeFormatted}`;
      const endIso = `${todayStr}T${slot.standardTime.replace(':', '')}30`;
      const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(description)}&dates=${startIso}/${endIso}&recur=RRULE:FREQ=DAILY;COUNT=${duration}`;

      events.push({
        title,
        description,
        timeSlot: slot.slot,
        time: slot.standardTime,
        durationDays: duration,
        googleCalendarUrl: gcalUrl,
      });
    });
  });

  // Follow-up appointment event
  if (dischargeCase.followUp.reviewDate.value) {
    const fDate = dischargeCase.followUp.reviewDate.value.replace(/-/g, '');
    const title = `🏥 GharCare: Follow-up Appointment - ${dischargeCase.followUp.departmentOrDoctor.value || 'Hospital'}`;
    const description = `रोगी: ${patientName}\nस्थान: ${dischargeCase.hospitalName}\nडॉक्टर: ${dischargeCase.followUp.departmentOrDoctor.value || ''}\nहेल्पलाइन: ${dischargeCase.followUp.hospitalContact}\nकृपया अपनी पुरानी डिस्चार्ज फ़ाइल व ईसीजी साथ लाएं।`;
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(description)}&dates=${fDate}T100000/${fDate}T110000`;

    events.push({
      title,
      description,
      timeSlot: 'FOLLOW_UP',
      time: '10:00 AM',
      durationDays: 1,
      googleCalendarUrl: gcalUrl,
    });
  }

  // Generate standard RFC 5545 .ics file content
  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GharCare//Google AI Discharge Handover//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:GharCare Medicine Schedule',
    'X-WR-TIMEZONE:Asia/Kolkata',
  ];

  events.forEach((ev, i) => {
    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:gharcare-${Date.now()}-${i}@gharcare.ai`);
    icsLines.push(`SUMMARY:${ev.title}`);
    icsLines.push(`DESCRIPTION:${ev.description.replace(/\n/g, '\\n')}`);
    icsLines.push(`DTSTART;TZID=Asia/Kolkata:${todayStr}T080000`);
    icsLines.push(`DTEND;TZID=Asia/Kolkata:${todayStr}T083000`);
    icsLines.push(`RRULE:FREQ=DAILY;COUNT=${ev.durationDays}`);
    icsLines.push('BEGIN:VALARM');
    icsLines.push('TRIGGER:-PT10M');
    icsLines.push('ACTION:DISPLAY');
    icsLines.push(`DESCRIPTION:Reminder: ${ev.title}`);
    icsLines.push('END:VALARM');
    icsLines.push('END:VEVENT');
  });

  icsLines.push('END:VCALENDAR');

  return {
    events,
    icsContent: icsLines.join('\r\n'),
  };
}
