import AirIcon from '@mui/icons-material/Air';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BuildIcon from '@mui/icons-material/Build';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SpaIcon from '@mui/icons-material/Spa';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MemoryIcon from '@mui/icons-material/Memory';

// Subservice Safe Icons
import SettingsIcon from '@mui/icons-material/Settings';
import HandymanIcon from '@mui/icons-material/Handyman';
import BrushIcon from '@mui/icons-material/Brush';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import LaptopIcon from '@mui/icons-material/Laptop';
import PrintIcon from '@mui/icons-material/Print';
import LocalParkingIcon from '@mui/icons-material/LocalParking';

export interface SubService {
  name: string;
  description: string;
  icon: any;
  image: string;
}

export interface ServiceBrand {
  id: string;
  icon: any;
  brand: string;
  tagline: string;
  description: string;
  image: string;
  accent: string;
  accentDark: string;
  headerBg: string;
  headerBgLight: string;
  pillText: string;
  services: string[];
  subServices: SubService[];
}

export interface SubServiceData extends SubService {
  redirectUrl?: string;
}

export const servicesData: ServiceBrand[] = [
  {
    id: 'coolfix',
    icon: AirIcon,
    brand: 'CoolFix',
    tagline: 'Air-con Specialists',
    description: 'Keep your air-conditioning units clean, efficient, and reliable with trusted aircon services for homes and businesses.',
    image: '/images/coolfix.jpg',
    accent: '#2E5BA8',
    accentDark: '#10355f',
    headerBg: '#10355f',
    headerBgLight: '#2E5BA8',
    pillText: '#2E5BA8',
    services: ['Aircon Cleaning', 'Aircon Repair'],
    subServices: [
      {
        name: 'Aircon Cleaning',
        description: 'Professional cleaning services to improve air quality and keep air-conditioning units running efficiently.',
        icon: SettingsIcon,
        image: '/images/aircon-cleaning.jpg'
      },
      {
        name: 'Aircon Repair',
        description: 'Reliable repair solutions for air-conditioning issues, from minor fixes to major system repairs.',
        icon: HandymanIcon,
        image: '/images/aircon-repair.jpg'
      }
    ]
  },
  {
    id: 'sanifix',
    icon: WaterDropIcon,
    brand: 'SaniFix',
    tagline: 'Deep Cleaning & Sanitization',
    description: 'Maintain a clean, safe, and hygienic environment with professional sanitation and cleaning services.',
    image: '/images/sanifix.jpg',
    accent: '#2E5BA8',
    accentDark: '#10355f',
    headerBg: '#10355f',
    headerBgLight: '#2E5BA8',
    pillText: '#2E5BA8',
    services: ['Cleaning / Sanitation'],
    subServices: [
      {
        name: 'Cleaning / Sanitation',
        description: 'Thorough cleaning and sanitation services for homes, offices, and other spaces.',
        icon: SettingsIcon,
        image: '/images/cleaning-sanitation.jpg'
      }
    ]
  },
  {
    id: 'homefix',
    icon: BuildIcon,
    brand: 'HomeFix',
    tagline: 'Home Repairs & Renovation',
    description: 'Get dependable home and office repair services from skilled professionals for your maintenance and improvement needs.',
    image: '/images/homefix.jpg',
    accent: '#2E5BA8',
    accentDark: '#10355f',
    headerBg: '#10355f',
    headerBgLight: '#2E5BA8',
    pillText: '#2E5BA8',
    services: ['Plumbing', 'Electrical / Thermal Scanning', 'Carpentry / Civil Works', 'Painting'],
    subServices: [
      {
        name: 'Plumbing',
        description: 'Plumbing repairs, installations, and maintenance for leaks, clogs, and fixtures.',
        icon: HandymanIcon,
        image: '/images/plumbing.jpeg'
      },
      {
        name: 'Electrical / Thermal Scanning',
        description: 'Electrical troubleshooting, installation, and diagnostics to ensure safety and functionality.',
        icon: SettingsIcon,
        image: '/images/thermal-scan.jpg'
      },
      {
        name: 'Carpentry / Civil Works',
        description: 'Carpentry and construction services for repairs, renovations, and structural improvements.',
        icon: HandymanIcon,
        image: '/images/carpentry.jpg'
      },
      {
        name: 'Painting',
        description: 'Interior and exterior painting services with quality finishes and professional execution.',
        icon: BrushIcon,
        image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80'
      }
    ]
  },
  {
    id: 'movefix',
    icon: Inventory2Icon,
    brand: 'MoveFix',
    tagline: 'Professional Moving Solutions',
    description: 'Make moving easier with reliable relocation and transport services designed for safe and stress-free transfers.',
    image: '/images/movefix.jpg',
    accent: '#2E5BA8',
    accentDark: '#10355f',
    headerBg: '#10355f',
    headerBgLight: '#2E5BA8',
    pillText: '#2E5BA8',
    services: ['Moving and Packing'],
    subServices: [
      {
        name: 'Moving and Packing',
        description: 'Reliable moving and packing services to help customers relocate safely, efficiently, and stress-free.',
        icon: LocalShippingIcon,
        image: '/images/moving.jpg'
      }
    ]
  },
  {
    id: 'greenfix',
    icon: SpaIcon,
    brand: 'GreenFix',
    tagline: 'Eco & Sustainability',
    description: 'Support a cleaner and greener environment through sustainable waste management and eco-friendly solutions.',
    image: '/images/greenfix.jpg',
    accent: '#2E5BA8',
    accentDark: '#10355f',
    headerBg: '#10355f',
    headerBgLight: '#2E5BA8',
    pillText: '#2E5BA8',
    services: ['Soilmate'],
    subServices: [
      {
        name: 'Soilmate',
        description: 'Eco-friendly composting solutions and sustainable waste management services.',
        icon: SpaIcon,
        image: '/images/soilmate.jpg'
      }
    ]
  },
  {
    id: 'healthfix',
    icon: FavoriteBorderIcon,
    brand: 'HealthFix',
    tagline: 'Health & Wellness Services',
    description: 'Access convenient healthcare and wellness services from trusted professionals in the comfort of your home.',
    image: '/images/healthfix.jpg',
    accent: '#2E5BA8',
    accentDark: '#10355f',
    headerBg: '#10355f',
    headerBgLight: '#2E5BA8',
    pillText: '#2E5BA8',
    services: ['Medical'],
    subServices: [
      {
        name: 'Medical',
        description: 'Accessible home-based medical services, testing, and health monitoring solutions.',
        icon: HealthAndSafetyIcon,
        image: '/images/medical.jpg'
      }
    ]
  },
  {
    id: 'spacefix',
    icon: HomeOutlinedIcon,
    brand: 'SpaceFix',
    tagline: 'Space Planning & Interiors',
    description: 'Transform and optimize your living or working spaces with professional organization and improvement services.',
    image: '/images/spacefix.jpg',
    accent: '#2E5BA8',
    accentDark: '#10355f',
    headerBg: '#10355f',
    headerBgLight: '#2E5BA8',
    pillText: '#2E5BA8',
    services: ['Space Planning', 'Parking'],
    subServices: [
      {
        name: 'Parking',
        description: 'Find and manage available parking spaces for vehicles. Convenient, secure, and affordable parking solutions powered by LeeveitPH.',
        icon: LocalParkingIcon,
        image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=80',
        redirectUrl: 'https://leeveit.com/parking/listings/makati/3-large-empty-lot/63157fc65f25653ac1f48fc8'
      } as SubServiceData
    ]
  },
  {
    id: 'techfix',
    icon: MemoryIcon,
    brand: 'TechFix',
    tagline: 'IT & Gadget Support',
    description: 'Stay connected and productive with expert technical support and repair services for computers and devices.',
    image: '/images/techfix.jpg',
    accent: '#2E5BA8',
    accentDark: '#10355f',
    headerBg: '#10355f',
    headerBgLight: '#2E5BA8',
    pillText: '#2E5BA8',
    services: ['Desktop / Laptop Repair', 'Printer / Scanner Repair', 'Software Installation'],
    subServices: [
      {
        name: 'Desktop / Laptop Repair',
        description: 'Diagnostics and repair services for desktops and laptops to restore optimal performance.',
        icon: LaptopIcon,
        image: '/images/laptop.jpg'
      },
      {
        name: 'Printer / Scanner Repair',
        description: 'Maintenance and repair services for printers, scanners, and office equipment.',
        icon: PrintIcon,
        image: '/images/scan.jpg'
      },
      {
        name: 'Software Installation',
        description: 'Software setup and installation services for smooth and reliable system functionality.',
        icon: LaptopIcon,
        image: '/images/software-installation.jpg'
      }
    ]
  }
];

export const WORK_TYPES_MAPPING: Record<string, string[]> = {
  'Aircon Cleaning': [
    'Window Type',
    'Split Type Wall Mounted',
    'Split Type Floor Mounted',
    'Cassette',
    'Check Up & Evaluation'
  ],
  'Cleaning / Sanitation': [
    'Home - General Cleaning',
    'Deep Cleaning - Hard Surface',
    'Deep Cleaning - Hard Surface & Upholstery',
    'Post Construction Cleaning',
    'Commercial Space - General Cleaning',
    'Commercial Space - Post Construction Cleaning',
    'Cleaning Add Ons - Balcony Cleaning',
    'Cleaning Add Ons - Floor Strip & Wax',
    'Deep Clean & Shampoo - Bed Mattress',
    'Deep Clean & Shampoo - Ottoman',
    'Deep Clean & Shampoo - 1 Seater Sofa',
    'Deep Clean & Shampoo - 2 Seater Sofa',
    'Deep Clean & Shampoo - 3 Seater Sofa',
    'Deep Clean & Shampoo - 4 Seater Sofa',
    'Deep Clean & Shampoo - Extended Sofa',
    'Deep Clean & Shampoo - Office Chairs',
    'Household Appliances - Curtain Steam & Ironing',
    'Household Appliances - Area Rug/Carpet',
    'Inspection & Quotation'
  ],
  'Plumbing': [
    'Check Up & Evaluation',
    'Declogging Works',
    'Leak Repairs',
    'Major Works'
  ],
  'Electrical / Thermal Scanning': [
    'Thermal Scanning',
    'Lightbulb & Light Fixture Replacement',
    'Electrical Wire Repair',
    'Socket Repair',
    'Generator Repairs & Maintenance',
    'Fire Alarm System Repairs & Maintenance',
    'CCTV Repairs & Maintenance'
  ],
  'Carpentry / Civil Works': [
    'Repainting Service',
    'Roofing Repair & Repainting',
    'Check Up & Evaluation',
    'Wall Repairs',
    'Other Wood Works',
    'Light Fixture Installation',
    'Door Installation or Repair',
    'Window Installation or Repair',
    'Home Checkup & Evaluation'
  ],
  'Painting': [],
  'Desktop / Laptop Repair': [
    'Maintenance',
    'Virus & Spyware Removal',
    'LCD/LED Monitor',
    'Check Up - On Site Visit',
    'Reformat',
    'Upgrade',
    'Computer Assemble'
  ],
  'Printer / Scanner Repair': [
    'Virtual Assessments & Diagnostics'
  ],
  'Software Installation': [
    'Operating System (OS)',
    'MS Office Installation / Recovery',
    'Data & System Recovery [Software not included]',
    'CCTV On-site Deployment / Consultation',
    'Installation of CCTV Power Supply and Mini Cabinet'
  ],
  'Medical': [
    'On Site Anti Gen Swab Testing'
  ],
  'Soilmate': [
    'Soilmate Flex Plan - Annual Subscription - Flex (Mini 16L)',
    'Soilmate Standard or Mini (Extra bucket exchange) per bucket',
    'Soilmate Rookie (3 months) - Mini bucket 16L (Solo)',
    'Soilmate Enthusiast (6 months) - Mini bucket 16L (Solo)',
    'Soilmate Hero (12 months) - Mini bucket (Solo)',
    'Soilmate Rookie (3 months) - Standard bucket 16L (Duo)',
    'Soilmate Rookie (3 months) - Standard bucket 16L (Solo)',
    'Soilmate Enthusiast (6 months) - Standard bucket 16L (Duo)',
    'Soilmate Enthusiast (6 months) - Standard bucket 16L (Solo)',
    'Soilmate Hero (12 months) - Standard bucket 20L (Squad)',
    'Soilmate Hero (12 months) - Standard bucket 20L (Trio)',
    'Soilmate Hero (12 months) - Standard bucket 20L (Duo)',
    'Soilmate Hero (12 months) - Standard bucket 20L (Solo)'
  ],
  'Moving and Packing': [
    'Residential Moving (Local)',
    'Residential Moving (Long Distance)',
    'Office / Commercial Moving',
    'Packing Services Only',
    'Unpacking Services',
    'Furniture Disassembly & Reassembly',
    'Special Items (Piano, Artwork, etc.)'
  ]
};

