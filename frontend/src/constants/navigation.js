import { Activity, Bell, BriefcaseBusiness, Building2, ChartNoAxesCombined, CircleHelp, ClipboardList, FileCheck2, FileSearch, Files, Flag, FolderKanban, HandCoins, LayoutDashboard, Map, MapPinned, Search, ShieldAlert, UserRound, Wallet } from 'lucide-react';

export const citizenLinks = [
  { label: 'Overview', to: '/citizen/dashboard', icon: LayoutDashboard },
  { label: 'My land', to: '/citizen/land', icon: MapPinned },
  { label: 'Applications', to: '/citizen/applications', icon: ClipboardList },
  { label: 'My documents', to: '/citizen/documents', icon: Files },
];

export const officerLinks = [
  { label: 'Command centre', to: '/officer/dashboard', icon: LayoutDashboard },
  { label: 'Applications', to: '/officer/applications', icon: ClipboardList, count: '24' },
  { label: 'Document review', to: '/officer/documents', icon: FileCheck2 },
  { label: 'Data conflicts', to: '/officer/conflicts', icon: FolderKanban },
  { label: 'Analytics', to: '/officer/analytics', icon: ChartNoAxesCombined },
];

export const commonLinks = [
  { label: 'Search ULPIN', to: '/search', icon: Search },
  { label: 'Parcel map', to: '/map', icon: Map },
  { label: 'Notifications', to: '/notifications', icon: Bell },
];

export const roleIcons = { Citizen: UserRound, 'Revenue Officer': Building2, 'Registration Officer': FileSearch, 'GIS / Survey Officer': Map, Administrator: Activity };
