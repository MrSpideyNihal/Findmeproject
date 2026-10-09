/**
 * Password Reset Utility for Raisoni Projects / Findmeproject
 * 
 * Usage:
 *   node scripts/reset-password.mjs
 *   node scripts/reset-password.mjs <teacher-email> <new-password>
 *   node scripts/reset-password.mjs <teacher-email> <new-password> <mongodb-uri>
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

// Helper to read .env or .env.local manually without extra dependencies
function loadEnvFile(filename) {
  const filePath = path.resolve(process.cwd(), filename);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

// User schema definition
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

function validatePassword(password) {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one digit (0-9).';
  }
  return null;
}

async function main() {
  console.log('\n========================================');
  console.log('  TEACHER PASSWORD RESET TOOL');
  console.log('========================================\n');

  const args = process.argv.slice(2);
  let email = args[0];
  let newPassword = args[1];
  let mongoUri = args[2] || process.env.MONGODB_URI;

  if (!mongoUri) {
    mongoUri = (await askQuestion('Enter your MongoDB connection URL: ')).trim();
  }

  if (!mongoUri) {
    console.error('\n❌ Error: MongoDB URL is required.');
    rl.close();
    process.exit(1);
  }

  console.log('\nConnecting to MongoDB...');
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    console.log(' Connected to MongoDB database successfully.');
  } catch (err) {
    console.error('\n❌ Could not connect to MongoDB:', err.message);
    rl.close();
    process.exit(1);
  }

  try {
    // If email wasn't provided in CLI args, prompt for it
    if (!email) {
      email = (await askQuestion('\nEnter the teacher email: ')).trim();
    }

    email = email.toLowerCase().trim();

    // Check if the user exists
    let user = await User.findOne({ email });

    if (!user) {
      console.log(`\n❌ No teacher account found with email "${email}".`);
      
      // Fetch and list registered teachers to help identify the account
      const allUsers = await User.find({}, 'name email').lean();
      if (allUsers.length > 0) {
        console.log('\nRegistered accounts currently in this database:');
        allUsers.forEach((u, i) => {
          console.log(`  ${i + 1}. ${u.name} — ${u.email}`);
        });

        const choice = (await askQuestion('\nEnter the number (e.g. 1) to select an account, or re-enter the email: ')).trim();
        const num = parseInt(choice, 10);
        if (!isNaN(num) && num >= 1 && num <= allUsers.length) {
          user = await User.findById(allUsers[num - 1]._id);
          email = user.email;
        } else if (choice.includes('@')) {
          email = choice.toLowerCase().trim();
          user = await User.findOne({ email });
        }
      }

      if (!user) {
        console.error('\n❌ Account not found. Exiting.');
        rl.close();
        await mongoose.disconnect();
        process.exit(1);
      }
    }

    console.log(`\n Selected teacher account: ${user.name} (${user.email})`);

    // If password not provided in CLI args or doesn't meet rules, prompt for it
    while (!newPassword || validatePassword(newPassword)) {
      if (newPassword) {
        console.log(`⚠️  ${validatePassword(newPassword)}`);
      }
      newPassword = (await askQuestion('Enter new password (min 8 chars, 1 uppercase, 1 number): ')).trim();
    }

    console.log('\nHashing new password with bcrypt (salt rounds: 12)...');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    await user.save();

    console.log('\n========================================');
    console.log('✅ PASSWORD RESET SUCCESSFUL!');
    console.log('========================================');
    console.log(`Teacher:  ${user.name}`);
    console.log(`Email:    ${user.email}`);
    console.log(`New Pass: ${newPassword}`);
    console.log('\nThe teacher can now sign in at /auth/login with these credentials.\n');
  } catch (error) {
    console.error('\n❌ An error occurred during password reset:', error);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

main();
