#!/usr/bin/env node

/**
 * CMS Initialization Script
 * 
 * This script initializes the CMS with:
 * - Default templates
 * - Sample blog posts
 * - Sample pages
 * 
 * Usage: node scripts/init-cms.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where,
  Timestamp 
} = require('firebase/firestore');

// Firebase configuration (you'll need to set these environment variables)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample blog posts
const sampleBlogPosts = [
  {
    id: 'blog_1',
    title: 'The Future of E-commerce in Africa',
    slug: 'future-ecommerce-africa',
    content: `Africa is experiencing a digital revolution that's transforming how people shop, sell, and do business. With mobile penetration reaching unprecedented levels and internet connectivity improving across the continent, e-commerce is poised for explosive growth.

The key drivers of this transformation include:

1. **Mobile-First Approach**: With over 80% of internet access coming from mobile devices, African e-commerce platforms must prioritize mobile experiences.

2. **Digital Payments**: Mobile money solutions like M-Pesa, Airtel Money, and others are making online transactions accessible to millions who don't have traditional bank accounts.

3. **Local Content**: African consumers want to see products and content that reflect their local culture, languages, and preferences.

4. **Trust Building**: Building trust through secure payment systems, reliable delivery, and excellent customer service is crucial for success.

At NubiaGo, we're committed to being at the forefront of this transformation, providing a platform that connects African businesses with customers worldwide while maintaining the highest standards of quality and service.`,
    excerpt: 'How digital transformation is reshaping retail across the continent and what it means for businesses and consumers.',
    template: 'Blog Post',
    status: 'published',
    contentType: 'post',
    metaTitle: 'The Future of E-commerce in Africa - NubiaGo Blog',
    metaDescription: 'Discover how digital transformation is reshaping retail across Africa and what it means for businesses and consumers.',
    keywords: ['e-commerce', 'Africa', 'digital transformation', 'retail', 'technology'],
    featuredImage: '/api/placeholder/800/400',
    gallery: [],
    tags: ['featured', 'e-commerce', 'Africa', 'technology'],
    categories: ['Industry Insights'],
    authorId: 'admin_1',
    authorName: 'Sarah Johnson',
    approvalStatus: 'approved',
    approverId: 'admin_1',
    version: 1,
    isScheduled: false,
    customFields: {},
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-20'),
    publishedAt: new Date('2024-03-20')
  },
  {
    id: 'blog_2',
    title: 'Building Trust in Online Marketplaces',
    slug: 'building-trust-marketplaces',
    content: `Trust is the foundation of any successful e-commerce platform. In Africa, where many consumers are still new to online shopping, building and maintaining trust is even more critical.

Here are the key strategies we use at NubiaGo to build trust:

**Verification Systems**
- Supplier verification and background checks
- Product quality assurance
- Secure payment processing
- Transparent pricing and fees

**Customer Protection**
- Money-back guarantees
- Secure payment gateways
- Dispute resolution systems
- Clear return and refund policies

**Social Proof**
- Customer reviews and ratings
- Success stories and testimonials
- Social media presence
- Community engagement

**Transparency**
- Clear product descriptions
- Honest pricing
- Real-time order tracking
- Open communication channels

By implementing these strategies, we've built a platform that customers can trust with their hard-earned money and that suppliers can rely on to grow their businesses.`,
    excerpt: 'Essential strategies for creating secure and trustworthy e-commerce platforms that customers love.',
    template: 'Blog Post',
    status: 'published',
    contentType: 'post',
    metaTitle: 'Building Trust in Online Marketplaces - NubiaGo Blog',
    metaDescription: 'Learn essential strategies for creating secure and trustworthy e-commerce platforms that customers love.',
    keywords: ['trust', 'marketplace', 'e-commerce', 'security', 'customer protection'],
    featuredImage: '/api/placeholder/800/400',
    gallery: [],
    tags: ['trust', 'marketplace', 'security'],
    categories: ['Business Strategy'],
    authorId: 'admin_1',
    authorName: 'Michael Chen',
    approvalStatus: 'approved',
    approverId: 'admin_1',
    version: 1,
    isScheduled: false,
    customFields: {},
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
    publishedAt: new Date('2024-03-15')
  },
  {
    id: 'blog_3',
    title: 'Supporting Local Artisans Through Technology',
    slug: 'supporting-local-artisans',
    content: `Africa is home to some of the world's most talented artisans and craftspeople. From traditional beadwork to modern fashion design, African artisans create unique, high-quality products that deserve global recognition.

At NubiaGo, we're passionate about helping these talented individuals reach wider markets through our platform. Here's how we support local artisans:

**Digital Skills Training**
- E-commerce platform training
- Photography and product presentation
- Digital marketing basics
- Customer service skills

**Market Access**
- Global customer reach
- Secure payment processing
- International shipping support
- Marketing and promotion

**Community Building**
- Artisan networks and forums
- Skill sharing opportunities
- Collaborative projects
- Mentorship programs

**Quality Standards**
- Product quality guidelines
- Sustainable practices
- Fair pricing strategies
- Customer feedback integration

By supporting local artisans, we're not just helping individual businesses grow – we're preserving cultural heritage and creating economic opportunities that benefit entire communities.`,
    excerpt: 'How NubiaGo is helping traditional craftspeople reach global markets through our platform.',
    template: 'Blog Post',
    status: 'published',
    contentType: 'post',
    metaTitle: 'Supporting Local Artisans Through Technology - NubiaGo Blog',
    metaDescription: 'Discover how NubiaGo is helping traditional African craftspeople reach global markets through our platform.',
    keywords: ['artisans', 'local business', 'crafts', 'Africa', 'technology'],
    featuredImage: '/api/placeholder/800/400',
    gallery: [],
    tags: ['artisans', 'local business', 'crafts'],
    categories: ['Community'],
    authorId: 'admin_1',
    authorName: 'Aisha Oke',
    approvalStatus: 'approved',
    approverId: 'admin_1',
    version: 1,
    isScheduled: false,
    customFields: {},
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10'),
    publishedAt: new Date('2024-03-10')
  }
];

// Sample pages
const samplePages = [
  {
    id: 'page_1',
    title: 'About NubiaGo',
    slug: 'about',
    content: `NubiaGo is Africa's premier e-commerce marketplace, connecting trusted sellers with millions of customers across 34+ African countries.

Our mission is to democratize commerce across Africa by providing:
- Secure payment solutions
- Reliable delivery services
- Quality assurance systems
- Mobile-first experiences

Founded in 2020, we've grown from a small startup to a platform serving millions of customers and thousands of suppliers across the continent.

**Our Values**
- Trust and transparency
- Innovation and excellence
- Community and collaboration
- Sustainability and growth

**Our Impact**
- 1M+ customers served
- 10K+ active suppliers
- 34+ countries covered
- 99.9% customer satisfaction

Join us in building the future of commerce in Africa.`,
    excerpt: 'Learn about NubiaGo, Africa\'s premier e-commerce marketplace connecting trusted sellers with millions of customers.',
    template: 'Standard Page',
    status: 'published',
    contentType: 'page',
    metaTitle: 'About NubiaGo - Africa\'s Premier E-commerce Marketplace',
    metaDescription: 'Learn about NubiaGo, Africa\'s premier e-commerce marketplace connecting trusted sellers with millions of customers.',
    keywords: ['NubiaGo', 'Africa', 'e-commerce', 'marketplace', 'about'],
    featuredImage: '/api/placeholder/800/400',
    gallery: [],
    tags: ['about', 'company'],
    categories: ['Company'],
    authorId: 'admin_1',
    authorName: 'NubiaGo Team',
    approvalStatus: 'approved',
    approverId: 'admin_1',
    version: 1,
    isScheduled: false,
    customFields: {},
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    publishedAt: new Date('2024-01-01')
  }
];

// Initialize CMS content
async function initializeCMS() {
  try {
    console.log('🚀 Initializing CMS...');

    // Initialize blog posts
    console.log('📝 Creating sample blog posts...');
    for (const post of sampleBlogPosts) {
      const postRef = doc(db, 'cms_content', post.id);
      await setDoc(postRef, {
        ...post,
        createdAt: Timestamp.fromDate(post.createdAt),
        updatedAt: Timestamp.fromDate(post.updatedAt),
        publishedAt: Timestamp.fromDate(post.publishedAt)
      });
      console.log(`✅ Created blog post: ${post.title}`);
    }

    // Initialize pages
    console.log('📄 Creating sample pages...');
    for (const page of samplePages) {
      const pageRef = doc(db, 'cms_content', page.id);
      await setDoc(pageRef, {
        ...page,
        createdAt: Timestamp.fromDate(page.createdAt),
        updatedAt: Timestamp.fromDate(page.updatedAt),
        publishedAt: Timestamp.fromDate(page.publishedAt)
      });
      console.log(`✅ Created page: ${page.title}`);
    }

    console.log('🎉 CMS initialization completed successfully!');
    console.log(`📊 Created ${sampleBlogPosts.length} blog posts and ${samplePages.length} pages`);

  } catch (error) {
    console.error('❌ Error initializing CMS:', error);
    process.exit(1);
  }
}

// Check if Firebase is properly configured
function checkFirebaseConfig() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nPlease set these variables in your .env.local file');
    process.exit(1);
  }

  console.log('✅ Firebase configuration verified');
}

// Main execution
async function main() {
  try {
    checkFirebaseConfig();
    await initializeCMS();
    process.exit(0);
  } catch (error) {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { initializeCMS, sampleBlogPosts, samplePages };
