import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dbConnect from './lib/mongoose/mongoose';
import User from './models/User';
import Project from './models/Project';
import dotenv from 'dotenv';

dotenv.config();

const sampleProjects = [
  {
    title: 'Autonomous Plant Watering System with IoT Integration',
    groupName: 'IoT Pioneers',
    batchName: 'CS-2024',
    abstract: 'An automated watering system that utilizes soil moisture sensors, weather API integrations, and low-energy ESP32 microcontrollers to optimize irrigation schedules for domestic gardens. Users can monitor soil metrics, water reserves, and system status via a web dashboard built with Next.js and WebSockets.',
    githubUrl: 'https://github.com/example/iot-watering',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    mentorName: 'Dr. Sarah Connor',
    tags: ['IoT', 'ESP32', 'Next.js', 'WebSockets', 'C++'],
    members: [
      { name: 'Alice Johnson', email: 'alice.johnson@student.edu', role: 'Hardware Architect & ESP32 Dev', isLead: true },
      { name: 'Bob Smith', email: 'bob.smith@student.edu', role: 'Full Stack Web Developer', isLead: false }
    ]
  },
  {
    title: 'DeFi Lending Protocol Simulator',
    groupName: 'CryptoBuilders',
    batchName: 'FIN-2025',
    abstract: 'A simulation engine that tracks real-time liquidity pools, automated market makers (AMMs), and flash loan mechanisms. It includes stress-testing graphs showcasing slippage, gas fee estimations, and market crash scenarios to help finance students study decentralized lending risks.',
    githubUrl: 'https://github.com/example/defi-lending-sim',
    tags: ['Solidity', 'React', 'Ethers.js', 'Chart.js'],
    members: [
      { name: 'Charlie Lee', email: 'charlie@student.edu', role: 'Smart Contract Developer', isLead: true },
      { name: 'David Miller', email: 'david@student.edu', role: 'Frontend & Charts Developer', isLead: false },
      { name: 'Emma Wilson', email: 'emma@student.edu', role: 'QA & Financial Modeling', isLead: false }
    ]
  },
  {
    title: 'Local Spoken Dialect Translator',
    groupName: 'NLP Labs',
    batchName: 'AI-2024',
    abstract: 'A machine learning system trained on limited speech datasets of local dialects to translate colloquial spoken phrases into standard grammatical text. The project demonstrates state-of-the-art results on acoustic modeling using a fine-tuned Whisper model combined with standard transformer models.',
    githubUrl: 'https://github.com/example/nlp-dialect',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    mentorName: 'Prof. Raymond Holt',
    tags: ['Python', 'PyTorch', 'Whisper API', 'Next.js'],
    members: [
      { name: 'Frank Castillo', email: 'frank@student.edu', role: 'ML Engineer', isLead: true }
    ]
  }
];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('Error: MONGODB_URI is not defined in the environment variables.');
      process.exit(1);
    }
    
    await dbConnect();
    console.log('Connected to MongoDB database...');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    console.log('Cleared existing User and Project collections.');

    // Create a seed user (Teacher)
    const hashedPassword = await bcrypt.hash('Password123!', 12);
    const teacher = await User.create({
      name: 'Dr. Thomas Anderson',
      email: 'teacher@school.edu',
      password: hashedPassword
    });
    console.log('Seed Teacher created:', teacher.email);

    // Create projects
    const projectsToInsert = sampleProjects.map((proj) => ({
      ...proj,
      createdBy: teacher._id
    }));

    await Project.insertMany(projectsToInsert);
    console.log('Seed projects successfully inserted.');

    console.log('Database seeding process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
