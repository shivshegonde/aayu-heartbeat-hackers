import { PharmacyLocation } from '../types';

export function getNearbyEmergencyPharmacies(): PharmacyLocation[] {
  return [
    {
      id: 'pharm-1',
      name: 'Apollo 24/7 Pharmacy - Saket Main Road',
      address: 'Plot 14, Commercial Complex, Saket, New Delhi 110017',
      distanceKm: 0.8,
      phoneNumber: '+91 11 2685 1122',
      isOpen24x7: true,
      latitude: 28.5245,
      longitude: 77.2185,
      mapsUrl: 'https://maps.google.com/?q=Apollo+Pharmacy+Saket+New+Delhi',
    },
    {
      id: 'pharm-2',
      name: 'MedPlus 24-Hour Chemist - Malviya Nagar',
      address: 'Shop 4B, Main Market, Malviya Nagar, New Delhi 110017',
      distanceKm: 1.4,
      phoneNumber: '+91 11 4182 9900',
      isOpen24x7: true,
      latitude: 28.5321,
      longitude: 77.2091,
      mapsUrl: 'https://maps.google.com/?q=MedPlus+Malviya+Nagar+New+Delhi',
    },
    {
      id: 'pharm-3',
      name: 'Max Healthcare In-House 24x7 Emergency Dispensary',
      address: 'Ground Floor, West Block, 1, 2, Press Enclave Marg, Saket',
      distanceKm: 0.2,
      phoneNumber: '+91 11 2651 5050',
      isOpen24x7: true,
      latitude: 28.5284,
      longitude: 77.2117,
      mapsUrl: 'https://maps.google.com/?q=Max+Hospital+Saket+Pharmacy',
    },
    {
      id: 'pharm-4',
      name: 'Guardian Pharmacy - Hauz Khas',
      address: 'C-12, Green Park Extension, New Delhi 110016',
      distanceKm: 3.2,
      phoneNumber: '+91 11 2619 4433',
      isOpen24x7: true,
      latitude: 28.5582,
      longitude: 77.2023,
      mapsUrl: 'https://maps.google.com/?q=Guardian+Pharmacy+Green+Park',
    },
  ];
}
