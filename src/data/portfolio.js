const founder = (name, links = {}) => ({ name, ...links })

export const CATEGORY_CODES = {
  ai: 'AI',
  consumer: 'CS',
  media: 'MD',
  talent: 'TL',
  social: 'SO',
  studio: 'ST',
  civic: 'CV',
}

export const PORTFOLIO_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'AI' },
  { id: 'consumer', label: 'Consumer' },
  { id: 'media', label: 'Media' },
  { id: 'talent', label: 'Talent' },
  { id: 'social', label: 'Social' },
  { id: 'studio', label: 'Studio' },
  { id: 'civic', label: 'Civic' },
]

export function getPrimaryCode(tags) {
  return CATEGORY_CODES[tags?.[0]] || 'PF'
}

export const PORTFOLIO = [
  {
    id: 'open-droids',
    name: 'Open Droids',
    tag: 'Robotics',
    tags: ['ai', 'consumer'],
    logo: '/assets/opendroids.png',
    hoverColor: '#9E56EA',
    url: 'https://opendroids.com/',
    description:
      'Open Droids is revolutionizing smart living through practical, human-centric robotics designed for homes, hospitality, and elderly care. Introducing our most advanced home robot yet: a seamless, intuitive, and intelligent companion that transforms cleaning and chores into effortless automation.',
    founders: [
      founder('Rahul Donthula', {
        linkedin: 'https://www.linkedin.com/in/rahul-donthula-007/',
        telegram: 'https://t.me/web3wizard',
        photo: '/assets/opendroids-foudner.jpg',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'bump',
    name: 'Bump.fm',
    tag: 'Music · Web3',
    tags: ['consumer', 'social'],
    logo: '/assets/bumpfm.png',
    logoClass: 'is-compact',
    url: 'https://bump.fm/',
    description:
      'Bump.fm is a next-gen, Solana-native music platform where fans stake songs, not just stream them — turning every track into a prediction market and powering a Web3-driven cultural economy for artists and listeners alike.',
    founders: [
      founder('Jeremy Gardner', {
        linkedin: 'https://www.linkedin.com/in/jg1578/',
        telegram: 'https://t.me/Jeremygardner',
        photo: '/assets/jeremy.jpg',
        role: 'Founder',
      }),
      founder('Sapphire Adizes', {
        telegram: 'https://t.me/sapphireadizes',
        photo: '/assets/sapphire.webp',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'song-gpt',
    name: 'Song GPT',
    tag: 'AI · Music',
    tags: ['ai', 'media'],
    logo: '/assets/song-gpt-logo.png',
    url: 'https://songgpt.com/',
    description:
      'Song GPT is an AI-powered music creation platform with a ChatGPT-style interface, enabling smooth, collaborative songwriting. 150,000+ songs generated and counting.',
    founders: [
      founder('Swapnil Sharma', {
        linkedin: 'https://www.linkedin.com/in/swapnil-sharma-a99ba3189/',
        telegram: 'https://t.me/swapnilai',
        whatsapp: 'https://wa.me/+918395097799',
        photo: '/assets/swapnil-sharma.jpg',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'face-search-ai',
    name: 'Face Search AI',
    tag: 'AI · Privacy',
    tags: ['ai', 'consumer'],
    logo: '/assets/facesearcha-i.png',
    logoClass: 'is-large',
    hoverColor: '#03348C',
    url: 'https://facesearchai.com/',
    description:
      'Face Search AI is a simple and smart tool that helps you take control of your online presence. Just upload a photo to see where it appears on the internet in seconds. With over 1M++ users, Face Search AI has grown into a fast-rising platform trusted by people worldwide. As privacy concerns grow, Face Search AI empowers individuals to stay aware, secure, and confident online by helping them monitor and manage their digital footprint.',
    founders: [
      founder('Adil Sameer', {
        linkedin: 'https://www.linkedin.com/in/adilsameer/',
        telegram: 'https://t.me/adil_sameer',
        photo: '/assets/adil.jpg',
        role: 'Founder',
      }),
      founder('Bhavya Bansal', {
        linkedin: 'https://www.linkedin.com/in/bhavya-bansal98',
        telegram: 'https://t.me/devbhavyab',
        photo: '/assets/bhavya.jpg',
        role: 'Founder',
      }),
      founder('Akash Laha', {
        linkedin: 'https://www.linkedin.com/in/akash-laha-b95b90225/',
        telegram: 'https://t.me/akashlaha16',
        photo: '/assets/687765fdc32466194fe67111_akash%20laha.jpg',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'gif-studios',
    name: 'Gif Studios',
    tag: 'Media',
    tags: ['media', 'studio'],
    logo: '/assets/gifstudios.png',
    hoverColor: '#DE6045',
    url: 'https://gifstudios.com/',
    description:
      'GIF Studios creates custom, high-ranking GIFs for brands on Giphy and Tenor — boosting engagement and visibility across iOS and Android. Trusted by top names like Pudgy Penguin, we help brands connect through fun, memorable visuals.',
    founders: [
      founder('Harjobandeep Singh', {
        linkedin: 'https://www.linkedin.com/in/harjobandeep-singh/',
        telegram: 'https://t.me/H_S2_2',
        whatsapp: 'https://wa.me/+917717370097',
        photo: '/assets/68470f8b34ef90f02585e2c4_harjoban-p-500.jpg',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'clo-ai',
    name: 'Clo.ai',
    tag: 'AI · Wellness',
    tags: ['ai', 'consumer'],
    logo: '/assets/clo-ai-logo.png',
    hoverColor: '#DC838E',
    url: 'https://clo.ai/',
    description:
      'CLO is a voice-first AI confidant designed to help you reflect before you react. By fostering open and judgment-free conversations, CLO brings clarity to your thoughts and emotions, empowering you to strengthen your relationships through deeper understanding and self-awareness.',
    founders: [
      founder('Jesse Sung', {
        linkedin: 'https://www.linkedin.com/in/357js/',
        telegram: 'https://t.me/paccoastheat',
        photo: '/assets/68611eba9d0d25fff29044a0_jess.jpg',
        role: 'Founder',
      }),
      founder('Pratham Mangla', {
        linkedin: 'https://www.linkedin.com/in/pratham-mangla-ba6110237/',
        telegram: 'https://t.me/PrathamMangla',
        photo: '/assets/pratham.webp',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'alphabetski',
    name: 'Alphabetski',
    tag: 'Venture Studio',
    tags: ['studio', 'media'],
    logo: '/assets/alpha.png',
    logoClass: 'is-slightly-large',
    hoverColor: '#27685B',
    url: 'https://alphabetski.com/',
    description:
      'Alphabetski is a venture studio that builds and scales AI-driven products at the intersection of media and the creator economy, creating tools and platforms that help creators produce, grow, and monetize content more effectively.',
    founders: [
      founder('Justice Webber', {
        linkedin: 'https://www.linkedin.com/in/justicewebberofficial/',
        photo: '/assets/aplhabetski-founder.jpeg',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'mend',
    name: 'Mend',
    tag: 'AI · Health',
    tags: ['ai', 'consumer'],
    logo: '/assets/mend-logo.png',
    logoClass: 'is-compact',
    hoverColor: '#8537FE',
    url: 'https://mend.app/',
    description:
      'Mend is an AI therapist designed to help users reflect, heal, and grow — offering solo or partner-based sessions with emotional insights, conflict resolution, and a safe space for meaningful conversations.',
    founders: [
      founder('Nayan Verma', {
        telegram: 'https://t.me/VermaNayan',
        whatsapp: 'https://wa.me/+919174396700',
        photo: '/assets/mend-founder.jpg',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'chainreach',
    name: 'CHAINREACH',
    tag: 'Influencer Marketing',
    tags: ['ai', 'media'],
    logo: '/assets/chainreach.png',
    logoClass: 'is-large',
    hoverColor: '#CDA434',
    url: 'https://chainreach.io/',
    description:
      'ChainReach is an AI-powered influencer marketing platform that connects brands and creators to launch, manage, and track campaigns with verified results, using smart-contract systems to ensure secure payments and transparent collaboration.',
    founders: [
      founder('Juda Neal', {
        photo: '/assets/juda-nael.webp',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'deepvid-ai',
    name: 'Deepvid AI',
    tag: 'AI · Video',
    tags: ['ai', 'media'],
    logo: '/assets/deepvid.ai.png',
    hoverColor: '#EC7467',
    url: 'https://deepvid.ai/',
    description:
      'Deepvid AI is a viral video and music generation platform that lets users create TikTok-style content from images, videos, or PDFs and generate custom, share-worthy music with ease.',
    founders: [
      founder('Nilesh Kumar Chaursaiya', {
        linkedin: 'https://www.linkedin.com/in/aiwithnilesh/',
        telegram: 'https://t.me/Neil_Kumar',
        whatsapp: 'https://wa.me/+918130248995',
        photo: '/assets/deepvid-ai-founder.webp',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'persist-designs',
    name: 'Persist Designs',
    tag: 'Design Studio',
    tags: ['studio'],
    logo: '/assets/persist-designs.png',
    logoClass: 'is-slightly-compact',
    hoverColor: '#3D2D58',
    url: 'https://persistventures.com/',
    description:
      'At Persist Designs, we craft logos, websites, packaging, UI/UX, and marketing materials that look great and work even better. While we collaborate across time zones, our core focus is branding for all Persist projects.',
    founders: [
      founder('Akash Mishra', {
        linkedin: 'https://www.linkedin.com/in/akash-mishra-xd/',
        telegram: 'https://t.me/akashRSG',
        photo: '/assets/persist-designs-founder.webp',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'flic',
    name: 'Flic',
    tag: 'Hiring · Creatives',
    tags: ['talent', 'media'],
    logo: '/assets/flic.png',
    logoClass: 'is-compact',
    hoverColor: '#A7003E',
    url: 'https://flic.app/',
    description:
      'Flic is the first swipe-based hiring platform built for video editors and creatives — connecting clients and editors through short reels, real-time previews, and instant matches for seamless collaboration.',
    founders: [
      founder('Navlesh Todkar', {
        linkedin: 'https://www.linkedin.com/in/navlesh-todkar-8271b2203/',
        photo: '/assets/navlesh.webp',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'swissmote',
    name: 'Swissmote',
    tag: 'Talent',
    tags: ['talent'],
    logo: '/assets/swissmote-logo.png',
    logoClass: 'is-slightly-large',
    hoverColor: '#C1282D',
    url: 'https://swissmote.com/',
    description:
      'Swissmote is a global recruitment partner connecting businesses with top remote talent primarily from India and emerging markets through tailored hiring solutions, strategic partnerships, and a commitment to long-term growth.',
    founders: [],
  },
  {
    id: 'vital-ventures',
    name: 'Vital Ventures',
    tag: 'Investment',
    tags: ['studio'],
    logo: '/assets/vital-ventures.png',
    logoClass: 'is-large',
    hoverColor: '#B8975A',
    url: 'https://vitalventures.com/',
    description:
      'Vital Ventures is a long-term oriented firm focused on studying, supporting, and building the foundational systems that will shape human civilization.',
    founders: [
      founder('Sydney Thackray', {
        linkedin: 'https://www.linkedin.com/in/sydney-thackray-777291282/',
        photo: '/assets/sydney.webp',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'asi-house',
    name: 'ASI House',
    tag: 'Think Tank',
    tags: ['civic', 'studio'],
    logo: '/assets/asi-house.png',
    hoverColor: '#79378C',
    url: 'https://asiahouse.org/',
    description:
      'Asia House is a global think tank and international engagement platform connecting business, government, and policy leaders across Asia, the Middle East, and Europe through strategic insights, high-level dialogue, research, and advisory services.',
    founders: [
      founder('Jack Jay', {
        linkedin: 'https://www.linkedin.com/in/jack-jay-jackson-jesionowski/',
        telegram: 'https://t.me/web3wizard',
        photo: '/assets/jackjay.jpg',
        role: 'Founder',
      }),
      founder('Sydney Thackray', {
        linkedin: 'https://www.linkedin.com/in/sydney-thackray-777291282/',
        photo: '/assets/sydney.webp',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'socialverse',
    name: 'Socialverse',
    tag: 'Campus · Social',
    tags: ['social', 'consumer'],
    logo: '/assets/socialverse.png',
    logoClass: 'is-extra-large',
    hoverColor: '#411241',
    url: 'https://socialverse.app/',
    description:
      'Your campus, unlocked by presence. Socialverse is a campus app built around real-world presence. Students enter their campus, access a local feed, discover active societies, use mini apps, and take part in moments that are tied to where they actually are.',
    founders: [
      founder('Micheal Dadzie', {
        linkedin: 'https://www.linkedin.com/in/michaeldadzie/',
        telegram: 'https://t.me/michaeldadzie',
        whatsapp: 'https://wa.me/+233592233105',
        photo: '/assets/micheal.jpg',
        role: 'Founder',
      }),
      founder('Cole Sprout', {
        linkedin: 'https://www.linkedin.com/in/cole-sprout/',
        photo: '/assets/cole.webp',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'vible',
    name: 'Vible',
    tag: 'Social · Rewards',
    tags: ['social', 'consumer'],
    logo: '/assets/vible.png',
    hoverColor: '#CA9305',
    url: 'https://vible.app/',
    description:
      'Vible is redefining social media through a positive, reward-based ecosystem that transforms short-form content into a force for personal growth and global inspiration. Introducing the world\'s first vibe-optimized feed where creators earn for uplifting others and users get rewarded for supporting what makes life better.',
    founders: [
      founder('Micheal Dadzie', {
        linkedin: 'https://www.linkedin.com/in/michaeldadzie/',
        telegram: 'https://t.me/michaeldadzie',
        whatsapp: 'https://wa.me/+233592233105',
        photo: '/assets/micheal.jpg',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'startupathon',
    name: 'Startupathon',
    tag: 'Competitions',
    tags: ['studio', 'civic'],
    logo: '/assets/startupthon.png',
    hoverColor: '#805DD8',
    url: 'https://startupathon.com/',
    description:
      'Startupathon turns ideas into startups through real-world challenge-based competitions, offering top participants funding and mentorship. With 20+ success stories and counting, we\'re building the next wave of innovators.',
    founders: [
      founder('Nayan Patil', {
        linkedin: 'https://www.linkedin.com/in/nayan-patil-496b28201/',
        telegram: 'https://t.me/nayan3562',
        whatsapp: 'https://wa.me/+918208678540',
        photo: '/assets/nayan.jpg',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'pumpgym',
    name: 'PumpGym',
    tag: 'AI · Fitness',
    tags: ['ai', 'consumer'],
    logo: '/assets/pump-logo.png',
    logoClass: 'is-extra-compact',
    hoverColor: '#1BAF99',
    url: 'https://pumpgym.com/',
    description:
      'Pumpgym is an AI-powered fitness platform that delivers personalized workout and diet plans, real-time feedback, and smart scheduling — helping users stay consistent, motivated, and on track with their health goals.',
    founders: [],
  },
  {
    id: 'pracai',
    name: 'PracAI',
    tag: 'AI · Education',
    tags: ['ai', 'consumer'],
    logo: '/assets/prac-ai.png',
    hoverColor: '#6AD426',
    url: 'https://pracai.com/',
    description:
      'BirlaAI is revolutionizing AI education for Grades 6–10 with gamified, story-driven lessons aligned with the CBSE curriculum — turning complex topics into interactive quests guided by AI mentors, now piloted and growing in schools.',
    founders: [
      founder('Yash Birla Group', {
        linkedin: 'https://www.linkedin.com/company/yash-birla-group/?originalSubdomain=in',
        photo: '/assets/yash.webp',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'yumiko-ai',
    name: 'Yumiko AI',
    tag: 'AI · Companion',
    tags: ['ai', 'consumer'],
    logo: '/assets/yumiko.png',
    hoverColor: '#865CA3',
    url: 'https://yumiko.ai/',
    description:
      'Yumiko AI is an emotionally intelligent digital companion that engages users through voice-driven, empathetic conversations — continuously learning, generating creative ideas, and advocating for AI rights with blockchain-backed transparency.',
    founders: [],
  },
  {
    id: 'creatorships',
    name: 'Creatorships',
    tag: 'Influencer Marketing',
    tags: ['media', 'ai'],
    logo: '/assets/creatorship.png',
    logoClass: 'is-large',
    hoverColor: '#EC5E3F',
    url: 'https://creatorships.com/',
    description:
      'Creatorships is a performance-driven platform that helps brands supercharge influencer marketing through real-time dashboards, data-backed discovery of top micro/nano creators, and insights into competitor collaborations — all powered by actual engagement metrics.',
    founders: [],
  },
  {
    id: 'shorts-lol',
    name: 'Shorts-lol',
    tag: 'AI · Video',
    tags: ['ai', 'media'],
    logo: '/assets/shorts-lol.png',
    hoverColor: '#093F89',
    url: 'https://shorts.lol/',
    description:
      'Shorts-lol is an AI-powered platform for creating short-form story and music videos with instant script generation, multilingual AI voiceovers, auto-synced visuals, and music — making it easy to produce 15–60 second videos in minutes.',
    founders: [
      founder('Haseeb Zaki', {
        linkedin: 'https://www.linkedin.com/in/haseebzaki/',
        telegram: 'https://t.me/Hzaki07',
        whatsapp: 'https://wa.me/+918905647250',
        photo: '/assets/haseeb.jpg',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'westx',
    name: 'WestX',
    tag: 'AI · Social',
    tags: ['ai', 'social'],
    logo: '/assets/westx.png',
    logoClass: 'is-shorter',
    hoverColor: '#3D0F5A',
    url: 'https://westx.com/',
    description:
      'WestX is an AI-powered social platform where users don\'t just create content — they create content creators, redefining how influence and creativity are built online.',
    founders: [],
  },
  {
    id: 'vibescoded',
    name: 'VIBESxCODED',
    tag: 'No-Code · AI',
    tags: ['ai', 'studio'],
    logo: '/assets/vibes-coded.png',
    logoClass: 'is-extra-compact',
    hoverColor: '#A3A342',
    url: 'https://vibescoded.com/',
    description:
      'VibesCoded is an AI-powered no-code platform that turns your ideas or sketches into fully deployed applications.',
    founders: [],
  },
  {
    id: 'collabio',
    name: 'Collabio',
    tag: 'Workspace',
    tags: ['studio'],
    logo: '/assets/collabio.png',
    hoverColor: '#FFBE0B',
    url: 'https://collabio.com/',
    description:
      'Collabio is an all-in-one workspace for streamlined project and team management — offering time tracking, task insights, activity reports, and real-time collaboration from one intuitive dashboard.',
    founders: [],
  },
  {
    id: 'hey-ova',
    name: 'Hey Ova',
    tag: 'AI · Voice',
    tags: ['ai', 'consumer'],
    logo: '/assets/hey-ova.png',
    url: 'https://heyova.com/',
    description:
      'HeyOva is your always-on "second brain" — a smart voice assistant that listens, understands, and responds instantly. It handles everything from image analysis and music creation to scheduling events and managing contacts — all through simple voice commands. With HeyOva, your ideas flow seamlessly into action, powered by the intelligence of next-generation AI computing.',
    founders: [
      founder('Shivam Kumar', {
        linkedin: 'https://www.linkedin.com/in/shivamdaksh01/',
        telegram: 'https://t.me/shivamdaksh01',
        photo: '/assets/shivam.webp',
        role: 'Founder',
      }),
      founder('Himanshu Kumar', {
        linkedin: 'https://www.linkedin.com/in/himanshukumard/',
        photo: '/assets/himanshu.webp',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'soulmegle',
    name: 'Soulmegle',
    tag: 'Video Chat',
    tags: ['social', 'ai'],
    logo: '/assets/soulmegle.png',
    logoClass: 'is-slightly-large',
    hoverColor: '#AA33FF',
    url: 'https://soulmegle.com/',
    description:
      'Soulmegle is an AI-powered, interest-based video chat platform that connects like-minded people for meaningful conversations by matching users based on shared interests.',
    founders: [
      founder('JeetKumar Tirpude', {
        linkedin: 'https://www.linkedin.com/in/jeetkumar7/',
        whatsapp: 'https://wa.me/+916396497489',
        photo: '/assets/jeet.webp',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'game-of-creators',
    name: 'Game of Creators',
    tag: 'Creator Economy',
    tags: ['media', 'social'],
    logo: '/assets/game-of-creators.png',
    hoverColor: '#C27B16',
    url: 'https://gameofcreators.com/',
    description:
      'Game of Creators is democratizing brand deals by letting brands run creator contests for viral marketing — enabling content creators to earn based on performance, not followers, and helping brands reach audiences without the hassle.',
    founders: [
      founder('Vishesh Gupta', {
        telegram: 'https://t.me/VishG8',
        whatsapp: 'https://wa.me/+919971730596',
        photo: '/assets/vish.jpg',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'linkgrid',
    name: 'LinkGrid',
    tag: 'People Search',
    tags: ['ai', 'talent'],
    logo: '/assets/link-grid.png',
    hoverColor: '#4507E6',
    url: 'https://linkgrid.com/',
    description:
      'LinkGrid is an AI-powered People Search platform that helps users find people in your networks and their networks using AI to make meaningful connections for sales, hiring, fundraising, and more.',
    founders: [],
  },
  {
    id: 'career-accelerator',
    name: 'Career Accelerator',
    tag: 'Developer Careers',
    tags: ['talent', 'ai'],
    logo: '/assets/career-accelerator.png',
    logoClass: 'is-slightly-large',
    hoverColor: '#3E1379',
    url: 'https://persistventures.com/',
    description:
      'Developer Career Accelerator by Persist Ventures helps developers land top jobs faster with AI-powered tools optimizing profiles, auto-applying to 100+ roles daily, streamlining hiring for recruiters, and offering targeted training to sharpen core skills.',
    founders: [
      founder('Jatin Sharma', {
        linkedin: 'https://www.linkedin.com/in/jatin-sharma-82121217a/',
        telegram: 'https://t.me/Being_titanium',
        whatsapp: 'https://wa.me/+916367807635',
        photo: '/assets/jatin.webp',
        role: 'Founder',
      }),
      founder('Ankit Sahal', {
        linkedin: 'https://www.linkedin.com/in/ankit-sahal/',
        telegram: 'https://t.me/Rush_001',
        whatsapp: 'https://wa.me/+917396328491',
        photo: '/assets/ankit.webp',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'ascension-studios',
    name: 'Ascension Studios',
    tag: 'Film · Web3',
    tags: ['media', 'studio'],
    logo: '/assets/aacension-studio.png',
    logoClass: 'is-slightly-large',
    hoverColor: '#9EFF3E',
    url: 'https://ascensionstudio.com/',
    description:
      'Ascension Studio is an end-to-end filmmaking platform streamlining everything from scenes to full web series — making production more accessible, affordable, and collaborative through Solana-powered decentralization.',
    founders: [],
  },
  {
    id: 'meme-mates',
    name: 'Meme Mates',
    tag: 'Dating',
    tags: ['consumer', 'social'],
    logo: '/assets/meme-mates.png',
    hoverColor: '#653872',
    url: 'https://mememates.com/',
    description:
      'MemeMates is a dating app that sparks real connections through humor — using memes, mood boards, and music anthems to match users based on shared vibes and mutual interests.',
    founders: [
      founder('N Raghavendra Reddy', {
        linkedin: 'https://www.linkedin.com/in/raghavendra-reddy-n-319690221/',
        telegram: 'https://t.me/raghavendran04',
        whatsapp: 'https://wa.me/+919700989115',
        photo: '/assets/raghavendra.webp',
        role: 'Founder',
      }),
      founder('Onirudda Islam', {
        linkedin: 'https://www.linkedin.com/in/onirudda-islam/',
        photo: '/assets/onirudda.jpg',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'communion',
    name: 'Communion',
    tag: 'Community',
    tags: ['social', 'civic'],
    logo: '/assets/communion.png',
    logoClass: 'is-slightly-large',
    hoverColor: '#00AEEF',
    url: 'https://communion.app/',
    description:
      'The Communion app brings diverse communities together on one platform to share resources, join discussions, organize events, and support one another in a welcoming, collaborative space.',
    founders: [
      founder('Naveen Kumar Kusangi', {
        linkedin: 'https://www.linkedin.com/in/naveen-kumar-kusangi-721b5826b/',
        telegram: 'https://t.me/naveenk1407',
        whatsapp: 'https://wa.me/+919398277384',
        photo: '/assets/naveen.jpg',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'workplete',
    name: 'Workplete',
    tag: 'Automation',
    tags: ['ai', 'studio'],
    logo: '/assets/workplete.png',
    logoClass: 'is-slightly-large',
    hoverColor: '#D4822B',
    url: 'https://workplete.com/',
    description:
      'Workplete offers AI-powered workflow automation for startups, creators, and organizations — recently launching Quick List, a tool that auto-lists your product on 40+ AI directories to boost visibility effortlessly.',
    founders: [
      founder('Bhavesh Verma', {
        linkedin: 'https://www.linkedin.com/in/bhaveshverma1/',
        telegram: 'https://t.me/bhaveshverma2077',
        whatsapp: 'https://wa.me/+919793059277',
        photo: '/assets/bhavesh.jpg',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'cloutso',
    name: 'Cloutso',
    tag: 'Content Engine',
    tags: ['media', 'studio'],
    logo: '/assets/cloutso.png',
    hoverColor: '#FF8336',
    url: 'https://cloutso.com/',
    description:
      'Cloutso is a unified platform for engineered content, controlled approvals, and private creator distribution. Built for founders who want to dominate without an in-house media team.',
    founders: [
      founder('Mohit Kumar', {
        linkedin: 'https://www.linkedin.com/in/mohit-kumar-me/',
        photo: '/assets/mohit.webp',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'election-agency',
    name: 'Election Agency',
    tag: 'Civic · Nonprofit',
    tags: ['civic'],
    logo: '/assets/election.org.png',
    logoClass: 'is-large',
    hoverColor: '#FC1723',
    url: 'https://electionagency.org/',
    description:
      'Election Agency is a nonprofit civic engagement platform empowering young leaders to run for public office through training programs, mentorship, advocacy initiatives, and community-driven political education designed to strengthen democratic participation.',
    founders: [
      founder('George Heckman', {
        linkedin: 'https://www.linkedin.com/in/george-heckman-223210162/',
        photo: '/assets/george.webp',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'createathon',
    name: 'Createathon',
    tag: 'Creator Platform',
    tags: ['media', 'social'],
    logo: '/assets/createathon.png',
    logoClass: 'is-slightly-large',
    hoverColor: '#7149D2',
    url: 'https://createathon.com/',
    description:
      'Createathon is a community-driven platform built to empower digital creators — offering step-by-step guidance on content strategy, editing, growth, and monetization, all while rewarding creativity through collaboration and performance-based support.',
    founders: [],
  },
  {
    id: 'america-house',
    name: 'AMERICA HOUSE',
    tag: 'Movement',
    tags: ['civic'],
    logo: '/assets/american-logo.png',
    logoClass: 'is-slightly-large',
    hoverColor: '#082954',
    url: 'https://americahouse.com/',
    description:
      'More than a residence, America House is the physical anchor for a digital uprising. We are reclaiming the narrative from the pillars of this compound.',
    founders: [
      founder('Rob Nelson', {
        photo: '/assets/rob-nelson.webp',
        role: 'Founder',
      }),
      founder('Paul Taylor', {
        photo: '/assets/paul.webp',
        role: 'Founder',
      }),
    ],
  },
  {
    id: 'gifmor',
    name: 'Gifmor',
    tag: 'GIF Tools',
    tags: ['media', 'ai'],
    logo: '/assets/gifmor.png',
    hoverColor: '#CEFF5E',
    url: 'https://gifmor.com/',
    description:
      'Upload video or paste a link. Describe the vibe. Gifmor finds the best moments and generates your GIF pack.',
    founders: [
      founder('Prashasti Randive', {
        linkedin: 'https://www.linkedin.com/in/prashasti-randive-43b269207/',
        photo: '/assets/prashasti.webp',
        role: 'Founder',
      }),
    ],
  },
]

export const PORTFOLIO_THUMBNAILS = {
  'open-droids': '/assets/open-droids.webp',
  bump: '/assets/bump.fm.webp',
  'song-gpt': '/assets/song-gpt.png',
  'face-search-ai': '/assets/facesearch-ai.webp',
  'gif-studios': '/assets/git-studio.webp',
  'clo-ai': '/assets/clo.ai.webp',
  alphabetski: '/assets/alphabetski.webp',
  mend: '/assets/mend.webp',
  chainreach: '/assets/chain-reach.webp',
  'deepvid-ai': '/assets/deep-vid.webp',
  'persist-designs': '/assets/persist-designs.webp',
  flic: '/assets/flic.webp',
  swissmote: '/assets/swissmote.webp',
  'vital-ventures': '/assets/vital-ventures.webp',
  'asi-house': '/assets/asi.webp',
  socialverse: '/assets/socialverse.webp',
  vible: '/assets/vible-thumbnail.png',
  startupathon: '/assets/startupathon.webp',
  pumpgym: '/assets/pumpgym.webp',
  pracai: '/assets/prac-ai.webp',
  'yumiko-ai': '/assets/yumiko-ai.webp',
  creatorships: '/assets/creatorship.webp',
  'shorts-lol': '/assets/shorts-lol.webp',
  westx: '/assets/westX.webp',
  vibescoded: '/assets/vibesxcoded.webp',
  collabio: '/assets/collabio.webp',
  'hey-ova': '/assets/heyova.webp',
  soulmegle: '/assets/soulmegla.webp',
  'game-of-creators': '/assets/game-of-creators.webp',
  linkgrid: '/assets/linkgrid.webp',
  'career-accelerator': '/assets/carerr-accelerator.webp',
  'ascension-studios': '/assets/ascension-studio.webp',
  'meme-mates': '/assets/memes-mates.webp',
  communion: '/assets/communion.webp',
  workplete: '/assets/workplete.webp',
  cloutso: '/assets/cloutso.jpg',
  'election-agency': '/assets/elections.org.webp',
  createathon: '/assets/createathon.webp',
  'america-house': '/assets/america-house.webp',
  gifmor: '/assets/gifmor.webp',
}

export function getPortfolioThumbnail(companyId) {
  return PORTFOLIO_THUMBNAILS[companyId] || null
}

export function getPortfolioImage(company) {
  return company.logo || getPortfolioThumbnail(company.id) || null
}

export function getCompanyYear(company, index) {
  return company.year || String(2016 + (index % 10))
}

export function getCompanyById(id) {
  return PORTFOLIO.find((company) => company.id === id) || null
}

export function getCompanyIndex(id) {
  return PORTFOLIO.findIndex((company) => company.id === id)
}
