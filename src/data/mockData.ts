import { Event, DropdownConfig } from '@/types';

export const mockEvents: Event[] = [
  {
    id: '1',
    date: '2025-08-20',
    time: '19:00',
    event: 'Al Hilal x Al Nassr',
    eventType: 'RSL',
    city: 'Riyadh',
    venue: 'King Fahd Stadium',
    ob: 'OB01',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '2',
    date: '2025-08-21',
    time: '20:00',
    event: 'Al Ittihad x Al Ahli',
    eventType: 'RSL',
    city: 'Jeddah',
    venue: 'King Abdullah Sports City',
    ob: 'OB02',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '3',
    date: '2025-08-22',
    time: '18:30',
    event: 'Al Shabab x Al Fayha',
    eventType: 'FDL',
    city: 'Riyadh',
    venue: 'Al-Shabab Club Stadium',
    ob: 'OB03',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '4',
    date: '2025-08-23',
    time: '17:45',
    event: 'Al Qadisiya x Al Ettifaq',
    eventType: 'FDL',
    city: 'Dammam',
    venue: 'Prince Mohammed Bin Fahd Stadium',
    ob: 'OB04',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '5',
    date: '2025-08-24',
    time: '16:00',
    event: 'Al Nassr Women x Eastern Flames',
    eventType: 'WOMEN',
    city: 'Riyadh',
    venue: 'Prince Faisal Bin Fahd Stadium',
    ob: 'OB05',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '6',
    date: '2025-08-25',
    time: '19:30',
    event: 'Al Batin x Al Khaleej',
    eventType: 'FDL',
    city: 'Hafar Al Batin',
    venue: 'Al Batin Club Stadium',
    ob: 'OB06',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '7',
    date: '2025-08-26',
    time: '21:00',
    event: 'Damac x Al Riyadh',
    eventType: 'RSL',
    city: 'Khamis Mushait',
    venue: 'Prince Sultan Bin Abdul Aziz Stadium',
    ob: 'OB07',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '8',
    date: '2025-08-27',
    time: '18:00',
    event: 'Al Wehda x Al Fateh',
    eventType: 'FDL',
    city: 'Makkah',
    venue: 'King Abdul Aziz Stadium',
    ob: 'OB08',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '9',
    date: '2025-08-28',
    time: '15:30',
    event: 'Al Hilal Women x Al Ahli Women',
    eventType: 'WOMEN',
    city: 'Riyadh',
    venue: 'Prince Faisal Bin Fahd Stadium',
    ob: 'OB09',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '10',
    date: '2025-08-29',
    time: '20:30',
    event: 'NEOM FC x Al Orobah',
    eventType: 'NEOM',
    city: 'NEOM',
    venue: 'NEOM Stadium',
    ob: 'OB10',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '11',
    date: '2025-08-30',
    time: '19:15',
    event: 'Al Taawoun x Al Hazem',
    eventType: 'FDL',
    city: 'Buraidah',
    venue: 'King Abdullah Sport City Stadium',
    ob: 'OB11',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '12',
    date: '2025-08-31',
    time: '22:00',
    event: 'Al Raed x Al Akhdoud',
    eventType: 'RSL',
    city: 'Buraidah',
    venue: 'King Abdullah Sport City Stadium',
    ob: 'OB12',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '13',
    date: '2025-09-01',
    time: '17:30',
    event: 'Al Tai x Al Jubail',
    eventType: 'FDL',
    city: 'Hail',
    venue: 'Prince Abdul Aziz Bin Musa\'ed Stadium',
    ob: 'OB13',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '14',
    date: '2025-09-02',
    time: '14:00',
    event: 'Al Ittihad Women x Al Nassr Women',
    eventType: 'WOMEN',
    city: 'Jeddah',
    venue: 'Prince Abdullah Al-Faisal Stadium',
    ob: 'OB14',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '15',
    date: '2025-09-03',
    time: '18:45',
    event: 'Al Khaleej x Al Adalah',
    eventType: 'FDL',
    city: 'Saihat',
    venue: 'Prince Saud Bin Jalawi Stadium',
    ob: 'OB15',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '16',
    date: '2025-09-04',
    time: '20:45',
    event: 'Al Hilal x Al Fateh',
    eventType: 'RSL',
    city: 'Riyadh',
    venue: 'Kingdom Arena',
    ob: 'OB16',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '17',
    date: '2025-09-05',
    time: '16:30',
    event: 'NEOM Women x Al Shabab Women',
    eventType: 'WOMEN',
    city: 'NEOM',
    venue: 'NEOM Women\'s Stadium',
    ob: 'OB17',
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z'
  }
];

export const mockDropdownConfig: DropdownConfig = {
  eventTypes: [
    { id: '1', value: 'FDL', label: 'FDL' },
    { id: '2', value: 'RSL', label: 'RSL' },
    { id: '3', value: 'WOMEN', label: 'WOMEN' },
    { id: '4', value: 'NEOM', label: 'NEOM' }
  ],
  cities: [
    { id: '1', value: 'Riyadh', label: 'Riyadh' },
    { id: '2', value: 'Jeddah', label: 'Jeddah' },
    { id: '3', value: 'Dammam', label: 'Dammam' },
    { id: '4', value: 'Abha', label: 'Abha' },
    { id: '5', value: 'Hafar Al Batin', label: 'Hafar Al Batin' },
    { id: '6', value: 'Makkah', label: 'Makkah' },
    { id: '7', value: 'Al-Ahsa', label: 'Al-Ahsa' }
  ],
  venues: [
    { id: '1', value: 'Al Batin Club Stadium', label: 'Al Batin Club Stadium' },
    { id: '2', value: 'Prince Sultan Bin Abdul Aziz Sport City Stadium', label: 'Prince Sultan Bin Abdul Aziz Sport City Stadium' },
    { id: '3', value: 'Al-Shabab Club Stadium', label: 'Al-Shabab Club Stadium' },
    { id: '4', value: 'EGO Stadium', label: 'EGO Stadium' },
    { id: '5', value: 'Al-Nassr Club Stadium', label: 'Al-Nassr Club Stadium' },
    { id: '6', value: 'Kingdom Arena', label: 'Kingdom Arena' }
  ],
  obs: [
    { id: '1', value: 'OB03', label: 'OB03' },
    { id: '2', value: 'OB04', label: 'OB04' },
    { id: '3', value: 'OB05', label: 'OB05' },
    { id: '4', value: 'OB23', label: 'OB23' },
    { id: '5', value: 'OB89', label: 'OB89' }
  ]
};

export { mockEvents as events };