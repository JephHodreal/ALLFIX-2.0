export interface ServiceOption {
  name: string;
  description: string;
  sub: Array<{
    name: string;
    description: string;
  }>;
}

export const VENDOR_SERVICES: ServiceOption[] = [
  {
    name: 'Coolfix',
    description: 'Join CoolFix and offer your expertise in air-conditioning cleaning, maintenance, and repair. Connect with customers who need reliable professionals to keep their units running efficiently and safely.',
    sub: [
      { name: 'Aircon Cleaning', description: 'Provide professional cleaning services that improve air quality and system performance. Help customers maintain their units and extend their lifespan.' },
      { name: 'Aircon Repair', description: 'Offer diagnostic and repair services for all types of air-conditioning issues—from minor fixes to major system repairs. Deliver dependable solutions customers can trust.' },
    ],
  },
  {
    name: 'Sanifix',
    description: 'Become part of SaniFix and deliver essential cleaning and sanitation services for homes, offices, and vehicles. Help customers maintain safe and hygienic environments.',
    sub: [
      { name: 'Cleaning / Sanitation', description: 'Provide thorough cleaning services, from routine housekeeping to deep cleaning. Showcase your skills in maintaining cleanliness across various spaces and surfaces.' },
    ],
  },
  {
    name: 'Homefix',
    description: 'Join HomeFix and offer your skills in general home and office repairs. Connect with clients who need trusted professionals for a wide range of maintenance and improvement services.',
    sub: [
      { name: 'Plumbing', description: 'Deliver plumbing services including repairs, installations, and maintenance. Help customers resolve issues like leaks, clogs, and fixture replacements efficiently.' },
      { name: 'Electrical / Thermal Scanning', description: 'Provide electrical troubleshooting, repair, and installation services. Ensure safety and functionality through expert diagnostics and rewiring solutions.' },
      { name: 'Carpentry / Civil Works', description: 'Offer carpentry and basic construction services. From small repairs to structural fixes, bring craftsmanship and reliability to every project.' },
      { name: 'Painting', description: 'Provide interior and exterior painting services. Help customers improve and refresh their spaces with quality finishes and timely execution.' },
    ],
  },
  {
    name: 'Techfix',
    description: 'Join TechFix and provide technical support and repair services for computers and electronic devices. Help customers stay connected and productive.',
    sub: [
      { name: 'Desktop / Laptop Repair', description: 'Offer diagnostics, troubleshooting, and repair services for computers and laptops. Ensure devices are restored to optimal performance.' },
      { name: 'Printer / Scanner Repair', description: 'Provide maintenance and repair services for office equipment. Help customers keep their printers and scanners running smoothly.' },
      { name: 'Software Installation', description: 'Deliver software setup and installation services, both remotely and on-site. Support various platforms and ensure seamless system functionality.' },
    ],
  },
  {
    name: 'Movefix',
    description: 'Join MoveFix and help customers with their moving and relocation needs. Provide reliable, efficient services that make transitions smoother and stress-free.',
    sub: [
      { name: 'Moving and Packing', description: 'Provide reliable moving and packing services to help customers relocate safely, efficiently, and stress-free.' },
    ],
  },
  {
    name: 'Healthfix',
    description: 'Partner with HealthFix to deliver accessible healthcare services at home. Provide convenient testing and health solutions to customers in need.',
    sub: [
      { name: 'Medical', description: 'Offer professional medical services including testing and health monitoring. Help improve accessibility to essential healthcare services through technology and home-based care.' },
    ],
  },
  {
    name: 'Greenfix',
    description: 'Join GreenFix and be part of a sustainable solution for waste management. Help customers turn food waste into valuable compost through efficient collection and support services.',
    sub: [
      { name: 'Soilmate', description: 'Provide composting solutions and materials. Support eco-friendly practices by delivering tools and services that promote sustainable living.' },
    ],
  },
  {
    name: 'Spacefix',
    description: 'Join SpaceFix and offer space-related services such as organization, improvement, or optimization. Help customers transform and maximize their living or working environments.',
    sub: [
      { name: 'Parking', description: 'Find and manage available parking spaces for vehicles in your area. Convenient, secure, and affordable parking solutions.' },
    ],
  },
];

export const getServiceDisplayName = (serviceType: string): string => {
  const service = VENDOR_SERVICES.find(s => s.name === serviceType);
  return service?.name || serviceType;
};

export const getServiceDescription = (serviceType: string): string => {
  const service = VENDOR_SERVICES.find(s => s.name === serviceType);
  return service?.description || '';
};
