const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const Rating = require('../models/Rating');

// Connect to database
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Bid.deleteMany({});
    await Rating.deleteMany({});
    
    console.log('Cleared existing data');

    // Create sample users
    const users = await User.insertMany([
      {
        name: 'John Client',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'client',
        profile: {
          bio: 'Startup founder looking for talented freelancers',
          skills: []
        }
      },
      {
        name: 'Sarah Designer',
        email: 'sarah@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'freelancer',
        profile: {
          bio: 'Professional UI/UX designer with 5 years experience',
          skills: ['UI Design', 'UX Research', 'Figma', 'Adobe XD']
        },
        rating: {
          average: 4.8,
          count: 12
        }
      },
      {
        name: 'Mike Developer',
        email: 'mike@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'freelancer',
        profile: {
          bio: 'Full-stack developer specializing in React and Node.js',
          skills: ['React', 'Node.js', 'JavaScript', 'MongoDB']
        },
        rating: {
          average: 4.9,
          count: 15
        }
      },
      {
        name: 'Lisa Writer',
        email: 'lisa@example.com',
        password: await bcrypt.hash('password123', 12),
        role: 'freelancer',
        profile: {
          bio: 'Content writer and copywriter with expertise in tech',
          skills: ['Content Writing', 'Copywriting', 'SEO', 'Technical Writing']
        },
        rating: {
          average: 4.7,
          count: 8
        }
      }
    ]);

    console.log('Created sample users');

    // Get user IDs
    const [john, sarah, mike, lisa] = users;

    // Create sample jobs
    const jobs = await Job.insertMany([
      {
        title: 'Modern Logo Design for Tech Startup',
        description: 'We need a modern, professional logo for our tech startup. Looking for something clean, memorable, and scalable. The logo should work well in both digital and print formats. We prefer a minimalist approach with our brand colors (blue and white).',
        category: 'design',
        budget: { min: 200, max: 500 },
        duration: '1-2 weeks',
        client: john._id,
        status: 'open',
        skillsRequired: ['Logo Design', 'Illustration', 'Brand Identity']
      },
      {
        title: 'E-commerce Website Development',
        description: 'Build a responsive e-commerce website using React and Node.js. Need product listings, shopping cart, user authentication, and payment integration. Looking for someone with experience in building similar platforms.',
        category: 'development',
        budget: { min: 1500, max: 3000 },
        duration: '2-4 weeks',
        client: john._id,
        status: 'open',
        skillsRequired: ['React', 'Node.js', 'MongoDB', 'E-commerce']
      },
      {
        title: 'Blog Content Writing - Technology Articles',
        description: 'Need 10 technology blog posts (800-1200 words each) about latest trends in AI and machine learning. Looking for engaging, well-researched content with proper SEO optimization.',
        category: 'writing',
        budget: { min: 300, max: 600 },
        duration: '2-4 weeks',
        client: john._id,
        status: 'open',
        skillsRequired: ['Content Writing', 'SEO', 'Technology', 'Research']
      },
      {
        title: 'Social Media Marketing Campaign',
        description: 'Create and manage a 3-month social media marketing campaign for our SaaS product. Need strategy development, content creation, and analytics reporting.',
        category: 'marketing',
        budget: { min: 800, max: 1500 },
        duration: '1-3 months',
        client: john._id,
        status: 'in_progress',
        freelancer: sarah._id,
        skillsRequired: ['Social Media', 'Marketing Strategy', 'Content Creation']
      }
    ]);

    console.log('Created sample jobs');

    // Create sample bids
    const [logoJob, ecommerceJob, blogJob] = jobs;
    
    await Bid.insertMany([
      {
        job: logoJob._id,
        freelancer: sarah._id,
        amount: 350,
        duration: '1-2 weeks',
        message: 'I can create a stunning logo that perfectly represents your brand. I have 5 years of experience in logo design and brand identity.'
      },
      {
        job: logoJob._id,
        freelancer: mike._id,
        amount: 280,
        duration: '2-4 weeks',
        message: 'As a full-stack developer with design skills, I can create a modern logo that works perfectly with your tech brand.'
      },
      {
        job: ecommerceJob._id,
        freelancer: mike._id,
        amount: 2200,
        duration: '2-4 weeks',
        message: 'I specialize in building e-commerce platforms with React and Node.js. I can deliver a high-quality, scalable solution.'
      },
      {
        job: blogJob._id,
        freelancer: lisa._id,
        amount: 450,
        duration: '2-4 weeks',
        message: 'I write engaging tech content with a focus on AI and machine learning. I can deliver well-researched, SEO-optimized articles.'
      }
    ]);

    console.log('Created sample bids');

    // Add bids to jobs
    await Job.findByIdAndUpdate(logoJob._id, {
      $push: { bids: [sarah._id, mike._id] }
    });
    
    await Job.findByIdAndUpdate(ecommerceJob._id, {
      $push: { bids: [mike._id] }
    });
    
    await Job.findByIdAndUpdate(blogJob._id, {
      $push: { bids: [lisa._id] }
    });

    console.log('Updated job bid references');

    // Create sample ratings
    await Rating.insertMany([
      {
        job: jobs[3]._id, // Social media job
        client: john._id,
        freelancer: sarah._id,
        rating: 5,
        feedback: 'Excellent work! Sarah delivered beyond expectations and the campaign results were amazing.',
        quality: 5,
        communication: 5,
        professionalism: 5
      }
    ]);

    console.log('Created sample ratings');
    console.log('✅ Database seeding completed successfully!');
    console.log('\nSample login credentials:');
    console.log('Client: john@example.com / password123');
    console.log('Designer: sarah@example.com / password123');
    console.log('Developer: mike@example.com / password123');
    console.log('Writer: lisa@example.com / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
});