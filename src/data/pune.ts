import type { MetroLine, Station } from '../domain/models';
export type { MetroLine, Station } from '../domain/models';

// Official project profile checked 2026-10-24. Range Hill is not marked Open.
// Depots and proposed extensions are excluded from selectable stations.
export const NETWORK_SOURCE = 'https://punemetrorail.org/project-profile';
export const STATIONS: Station[] = [
  { id: 'pcmc', name: 'PCMC', line: 'purple', operational: true },
  { id: 'sant-tukaram-nagar', name: 'Sant Tukaram Nagar', line: 'purple', operational: true },
  { id: 'nashik-phata', name: 'Bhosari (Nashik Phata)', line: 'purple', operational: true },
  { id: 'kasarwadi', name: 'Kasarwadi', line: 'purple', operational: true },
  { id: 'phugewadi', name: 'Phugewadi', line: 'purple', operational: true },
  { id: 'dapodi', name: 'Dapodi', line: 'purple', operational: true },
  { id: 'bopodi', name: 'Bopodi', line: 'purple', operational: true },
  { id: 'khadki', name: 'Khadki', line: 'purple', operational: true },
  { id: 'range-hill', name: 'Range Hill', line: 'purple', operational: false },
  { id: 'shivajinagar', name: 'Shivaji Nagar', line: 'purple', operational: true },
  { id: 'civil-court', name: 'Civil Court (District Court)', line: 'interchange', operational: true },
  { id: 'kasba-peth', name: 'Kasba Peth (Budhwar Peth)', line: 'purple', operational: true },
  { id: 'mandai', name: 'Mahatma Phule Mandai', line: 'purple', operational: true },
  { id: 'swargate', name: 'Swargate', line: 'purple', operational: true },
  { id: 'vanaz', name: 'Vanaz', line: 'aqua', operational: true },
  { id: 'anand-nagar', name: 'Anand Nagar', line: 'aqua', operational: true },
  { id: 'ideal-colony', name: 'Ideal Colony', line: 'aqua', operational: true },
  { id: 'nal-stop', name: 'Nal Stop', line: 'aqua', operational: true },
  { id: 'garware-college', name: 'Garware College', line: 'aqua', operational: true },
  { id: 'deccan-gymkhana', name: 'Deccan Gymkhana', line: 'aqua', operational: true },
  { id: 'sambhaji-udyan', name: 'Chhatrapati Sambhaji Udyan', line: 'aqua', operational: true },
  { id: 'pmc', name: 'PMC', line: 'aqua', operational: true },
  { id: 'mangalwar-peth', name: 'Mangalwar Peth', line: 'aqua', operational: true },
  { id: 'pune-railway-station', name: 'Pune Railway Station', line: 'aqua', operational: true },
  { id: 'ruby-hall-clinic', name: 'Ruby Hall Clinic', line: 'aqua', operational: true },
  { id: 'bund-garden', name: 'Bund Garden', line: 'aqua', operational: true },
  { id: 'yerawada', name: 'Yerawada', line: 'aqua', operational: true },
  { id: 'kalyani-nagar', name: 'Kalyani Nagar', line: 'aqua', operational: true },
  { id: 'ramwadi', name: 'Ramwadi', line: 'aqua', operational: true },
];
export const LINES: MetroLine[] = [
  { id: 'purple', name: 'Purple Line', color: '#7955D9', stationIds: STATIONS.filter(s => s.line !== 'aqua').map(s => s.id) },
  { id: 'aqua', name: 'Aqua Line', color: '#159CAC', stationIds: ['vanaz','anand-nagar','ideal-colony','nal-stop','garware-college','deccan-gymkhana','sambhaji-udyan','pmc','civil-court','mangalwar-peth','pune-railway-station','ruby-hall-clinic','bund-garden','yerawada','kalyani-nagar','ramwadi'] },
];
export const OPEN_STATIONS = STATIONS.filter(s => s.operational);
export const getStationName = (id: string) => STATIONS.find(s => s.id === id)?.name ?? id;
export const LINE_NAMES = { purple: 'Purple Line', aqua: 'Aqua Line', interchange: 'Interchange' } as const;
