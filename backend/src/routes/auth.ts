import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const registerSchema = {
  email: String,
  password: String,
  name: String,
};

router.post('/register', async (req: Request, res: Response) => {
  console.log('📝 Register request:', req.body);
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const subscription = await prisma.subscription.create({
      data: { plan: 'FREE', status: 'ACTIVE' },
    });

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        subscriptionId: subscription.id,
      },
    });

    await prisma.business.create({
      data: { name: `${name}'s Business`, userId: user.id },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true },
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/google', async (req: Request, res: Response) => {
  console.log('📧 Google auth request:', req.body);
  try {
    const { email, name, image } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    let isNew = false;

    // Create new user if not exists
    if (!user) {
      isNew = true;

      // Create subscription first
      const subscription = await prisma.subscription.create({
        data: {
          plan: 'FREE',
          status: 'ACTIVE',
          messageLimit: 100,
        },
      });

      // Create user
      user = await prisma.user.create({
        data: {
          email,
          name: name || 'Google User',
          image: image || undefined,
          provider: 'GOOGLE',
          subscriptionId: subscription.id,
        },
      });

      // Create business
      await prisma.business.create({
        data: { name: `${name || 'User'}'s Business`, userId: user.id },
      });

      console.log(`✅ New Google user: ${email}`);
    } else {
      console.log(`🔄 Existing Google login: ${email}`);
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      isNew,
    });
  } catch (error: any) {
    console.error('❌ Google auth error:', error.message || error);
    res.status(500).json({ error: 'Google auth failed: ' + (error.message || 'Unknown') });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { subscription: true, business: { include: { settings: true } } },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;