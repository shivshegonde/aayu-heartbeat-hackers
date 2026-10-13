import React, { useState, useEffect } from 'react';
import { Calendar, Download, ExternalLink, X, Clock, CheckCircle, Sparkles, Bell } from 'lucide-react';
import axios from 'axios';
import { DischargeCase } from '../types';

interface GoogleCalendarModalProps {
  currentCase: DischargeCase;
  isOpen: boolean;
  onClose: () => void;
}

interface CalendarEventItem {
  title: string;
  description: string;
  timeSlot: string;
  time: string;
  durationDays: number;
  googleCalendarUrl: string;
}

export const GoogleCalendarModal: React.FC<GoogleCalendarModalProps> = ({
  currentCase,
  isOpen,
  onClose,
}) => {
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      axios
        .get<{ events: CalendarEventItem[] }>(`/api/cases/${currentCase.caseId}/calendar`)
        .then((res) => setEvents(res.data.events))
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [isOpen, currentCase.caseId]);

  if (!isOpen) return null;

  const handleDownloadIcs = () => {
    window.location.href = `/api/cases/${currentCase.caseId}/calendar/download`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="glass-card bg-white/95 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 font-heading flex items-center space-x-2">
                <span>Google Calendar & Reminder Sync</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-black">
                  Active Sync
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Automatic mobile alarm reminders for caregiver phone
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 max-h-[440px] overflow-y-auto flex-1">
          <div className="p-4 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-teal-500/10 rounded-2xl border border-teal-200/80 text-xs text-teal-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <Bell className="w-4 h-4 text-teal-700 shrink-0" />
              <span>
                Generated <strong>{events.length} recurring medicine alarm events</strong> with 10-minute sound alerts.
              </span>
            </div>
            <button
              onClick={handleDownloadIcs}
              className="flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-heading font-black text-xs shadow-md shadow-teal-700/20 transition-all shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .ICS</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {events.map((ev, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl border border-slate-200/80 bg-white/80 hover:bg-white hover:border-teal-300 hover:shadow-sm transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-heading font-black text-slate-900">{ev.title}</h4>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-1 font-medium">
                    <Clock className="w-3 h-3 text-teal-600" />
                    <span>Slot: <strong>{ev.timeSlot}</strong></span>
                    <span>•</span>
                    <span>Alert Time: <strong className="text-teal-800">{ev.time}</strong></span>
                  </div>
                </div>

                <a
                  href={ev.googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-teal-900 font-heading font-bold text-[11px] transition-colors"
                >
                  <span>Add to Google Cal</span>
                  <ExternalLink className="w-3 h-3 text-teal-600" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Compatible with Google Calendar, Apple Health, and Samsung Alarm.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-heading font-black text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
