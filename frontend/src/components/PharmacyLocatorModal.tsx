import React, { useState, useEffect } from 'react';
import { MapPin, Phone, ExternalLink, X, Clock, Navigation, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { PharmacyLocation } from '../types';

interface PharmacyLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PharmacyLocatorModal: React.FC<PharmacyLocatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [pharmacies, setPharmacies] = useState<PharmacyLocation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      axios
        .get<PharmacyLocation[]>('/api/pharmacies')
        .then((res) => setPharmacies(res.data))
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="glass-card bg-white/95 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-600/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 font-heading flex items-center space-x-2">
                <span>Nearby 24/7 Emergency Pharmacies</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-black">
                  Verified 24x7
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Verified open dispensaries within 5 km of hospital
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-3 max-h-[440px] overflow-y-auto flex-1">
          {pharmacies.map((pharm) => (
            <div
              key={pharm.id}
              className="p-4 rounded-2xl border border-slate-200/80 bg-white/80 hover:bg-white hover:border-teal-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-heading font-black text-slate-900 text-sm">{pharm.name}</h4>
                    {pharm.isOpen24x7 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-black text-[10px] flex items-center space-x-1 font-heading">
                        <CheckCircle className="w-3 h-3 text-teal-600" />
                        <span>Open 24 Hours</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{pharm.address}</p>
                </div>
                <span className="text-xs font-black font-heading text-teal-900 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200 shrink-0">
                  {pharm.distanceKm} km
                </span>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
                <a
                  href={`tel:${pharm.phoneNumber.replace(/\s+/g, '')}`}
                  className="flex items-center space-x-2 text-slate-700 hover:text-teal-700 font-bold"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span>{pharm.phoneNumber}</span>
                </a>

                <a
                  href={pharm.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-heading font-black text-xs shadow-md shadow-teal-700/20 transition-all"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Directions on Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Always call to confirm stock of high-alert cardiac/surgical medicines.</span>
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
