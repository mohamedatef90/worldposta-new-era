export interface CaseStudyCard {
  readonly slug: string;
  readonly industry: string;
  readonly country: string;
  readonly services: readonly string[];
  readonly title: string;
  readonly summary: string;
  readonly image: string;
  /** Only stories with a full write-up get a detail page; the rest show “Story coming soon”. */
  readonly hasStory: boolean;
}

export interface CaseStudyStory {
  readonly slug: string;
  readonly breadcrumb: string;
  readonly titleLead: string;
  readonly titleAccent: string;
  readonly intro: string;
  readonly heroImage: string;
  readonly facts: readonly { readonly value: string; readonly label: string; readonly icon: 'entity' | 'country' | 'industry' | 'people' }[];
  readonly keyServices: readonly string[];
  readonly overview: { readonly title: string; readonly paragraphs: readonly string[]; readonly image: string; readonly imageAlt: string };
  readonly challenge: { readonly title: string; readonly paragraphs: readonly string[]; readonly points: readonly string[] };
  readonly solution: { readonly title: string; readonly paragraphs: readonly string[]; readonly items: readonly { readonly title: string; readonly copy: string; readonly icon: 'cloud' | 'team' | 'shield' }[] };
  readonly results: { readonly title: string; readonly copy: string; readonly stats: readonly { readonly value: string; readonly label: string }[] };
  readonly quotes: readonly { readonly quote: string; readonly name: string; readonly role: string; readonly org: string; readonly initials: string; readonly tone: 'green' | 'blue' }[];
}

const asset = (name: string) => `/worldposta-assets/case-studies/${name}`;

export const CASE_STUDIES: readonly CaseStudyCard[] = [
  {
    slug: 'uae-government',
    industry: 'Government',
    country: 'UAE',
    services: ['Private Cloud', 'Collaboration'],
    title: 'Modernizing Government Operations with a Secure Private Cloud',
    summary: 'How a leading government entity improved efficiency, security and collaboration with WorldPosta’s cloud solutions.',
    image: asset('card-government.webp'),
    hasStory: true,
  },
  {
    slug: 'regional-bank',
    industry: 'Financial Services',
    country: 'KSA',
    services: ['Backup as a Service', 'Disaster Recovery'],
    title: 'A More Resilient Banking Infrastructure',
    summary: 'See how a regional bank enhanced business continuity and data protection with WorldPosta’s integrated cloud ecosystem.',
    image: asset('card-financial-services.webp'),
    hasStory: false,
  },
  {
    slug: 'healthcare-provider',
    industry: 'Healthcare',
    country: 'Egypt',
    services: ['Business Email', 'Collaboration'],
    title: 'Enabling Better Care Through Secure Collaboration',
    summary: 'How a healthcare provider improved communication and data security across multiple locations.',
    image: asset('card-healthcare.webp'),
    hasStory: false,
  },
  {
    slug: 'energy-company',
    industry: 'Energy & Utilities',
    country: 'UAE',
    services: ['Cloud Computing', 'Data Backup'],
    title: 'Scaling Operations with a Flexible Cloud Infrastructure',
    summary: 'How an energy company increased agility and reduced costs with WorldPosta CloudEdge.',
    image: asset('card-energy.webp'),
    hasStory: false,
  },
  {
    slug: 'educational-institution',
    industry: 'Education',
    country: 'Egypt',
    services: ['Collaboration', 'Posta Gate'],
    title: 'A Smarter Learning Experience',
    summary: 'How a leading educational institution modernized its IT environment with secure cloud solutions and seamless collaboration.',
    image: asset('card-education.webp'),
    hasStory: false,
  },
  {
    slug: 'retail-brand',
    industry: 'Retail',
    country: 'KSA',
    services: ['Business Email', 'Cloud Storage'],
    title: 'Driving Growth with a Unified Communication Platform',
    summary: 'How a growing retail brand improved team collaboration and operational efficiency across multiple branches.',
    image: asset('card-retail.webp'),
    hasStory: false,
  },
];

export const CASE_STUDY_STORIES: Readonly<Record<string, CaseStudyStory>> = {
  'uae-government': {
    slug: 'uae-government',
    breadcrumb: 'UAE Government',
    titleLead: 'Modernizing Government Operations with a',
    titleAccent: 'Secure Private Cloud',
    intro: 'How a leading government entity in the UAE improved efficiency, security and collaboration with WorldPosta’s cloud solutions.',
    heroImage: asset('story-government-hero.webp'),
    facts: [
      { value: 'UAE Government', label: 'Government Entity', icon: 'entity' },
      { value: 'UAE', label: 'Country', icon: 'country' },
      { value: 'Government', label: 'Industry', icon: 'industry' },
      { value: '10,000+', label: 'Employees', icon: 'people' },
    ],
    keyServices: ['Private Cloud', 'Collaboration', 'Posta Gate'],
    overview: {
      title: 'Building a More Agile and Secure Government for the Future',
      paragraphs: [
        'A leading government entity in the UAE partnered with WorldPosta to modernize its IT infrastructure and move to a secure, scalable private cloud environment that supports a more agile, citizen-centric way of working.',
        'With rising demands for digital services and greater collaboration across departments, the organization needed a trusted partner to design and implement a solution tailored to the unique requirements of the public sector.',
      ],
      image: asset('story-government-overview.webp'),
      imageAlt: 'Colonnade of a modern government building with palm trees',
    },
    challenge: {
      title: 'Meeting Growing Demands While Ensuring Security and Compliance',
      paragraphs: [
        'The organization faced increasing pressure to deliver faster, more accessible digital services to citizens, while maintaining the highest standards of security, compliance and operational efficiency.',
        'Its existing infrastructure was fragmented, limiting scalability and making it challenging to enable seamless collaboration across multiple departments.',
      ],
      points: [
        'Legacy infrastructure with limited scalability',
        'Increasing user and citizen demands',
        'Strict security and compliance requirements',
        'Need for better cross-department collaboration',
        'Ensuring data sovereignty and business continuity',
      ],
    },
    solution: {
      title: 'A Secure, Integrated Cloud Environment designed for Government',
      paragraphs: [
        'WorldPosta designed and implemented a secure private cloud environment integrated with collaboration and email solutions, ensuring high availability, robust security and a seamless user experience.',
        'The solution consolidated the organization’s infrastructure, enhanced security posture and enabled modern collaboration tools to support government teams in delivering innovative and efficient services to citizens.',
      ],
      items: [
        { title: 'WorldPosta Private Cloud', copy: 'A secure and scalable cloud infrastructure built for the public sector.', icon: 'cloud' },
        { title: 'Collaboration Tools', copy: 'Integrated communication and collaboration for government teams.', icon: 'team' },
        { title: 'Enhanced Security', copy: 'Strong security controls and compliance aligned with government requirements.', icon: 'shield' },
      ],
    },
    results: {
      title: 'Measurable Impact for a More Efficient Government',
      copy: 'The new environment enabled the organization to operate more efficiently, improve service delivery and enhance security, while providing a flexible platform for future growth.',
      stats: [
        { value: '50%', label: 'Lower infrastructure costs' },
        { value: '99.9%', label: 'Service availability' },
        { value: '40%', label: 'Faster service delivery' },
        { value: '100%', label: 'Scalability to support future growth' },
      ],
    },
    quotes: [
      {
        quote: 'WorldPosta understood our needs and delivered a solution that not only meets our current requirements but also positions us for future growth. Their team’s expertise and support made the entire journey seamless.',
        name: 'Ahmed Al Mansoori', role: 'IT Director', org: 'Government Entity, UAE', initials: 'AM', tone: 'green',
      },
      {
        quote: 'This project reflects our commitment to delivering secure, scalable and innovative cloud solutions that enable government organizations to operate more efficiently and serve their citizens with confidence.',
        name: 'Rana Khalil', role: 'Head of Enterprise Solutions', org: 'WorldPosta', initials: 'RK', tone: 'blue',
      },
    ],
  },
};
