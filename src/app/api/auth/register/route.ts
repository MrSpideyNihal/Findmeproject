import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/mongoose/mongoose';
import User from '@/models/User';
import { registerSchema } from '@/lib/validations/validations';

// Rate limiting store (simple in-memory; use Redis in production)
const attemptMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Prevent memory leak by pruning stale items when map grows
  if (attemptMap.size > 1000) {
    for (const [key, val] of attemptMap.entries()) {
      if (now > val.resetAt) {
        attemptMap.delete(key);
      }
    }
  }

  const record = attemptMap.get(ip);

  if (!record || now > record.resetAt) {
    attemptMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT) return false;
  record.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in 15 minutes.' },
      { status: 429 }
    );
  }

  // Check if already authenticated
  const session = await getServerSession(authOptions);
  if (session) {
    return NextResponse.json({ error: 'Already authenticated' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const { name, email, password, accessCode } = parsed.data;

    // Validate registration access code against environment variable
    const requiredCode = process.env.TEACHER_REGISTRATION_CODE;
    if (!requiredCode) {
      return NextResponse.json(
        { error: 'Server registration configuration error. Please contact administrators.' },
        { status: 500 }
      );
    }

    if (accessCode !== requiredCode) {
      return NextResponse.json(
        { error: 'Invalid registration access code' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password with 12 rounds
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: { id: user._id.toString(), name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
