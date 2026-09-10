import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import prisma from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'smartclass-jwt-super-secret-key-2026';

// Initialize Anthropic client if key is present
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Helper: Haversine distance in meters
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper: Get today's YYYY-MM-DD
function getTodayDateStr() {
  return new Date().toISOString().split('T')[0];
}

// Helper: Get current day of week string
function getCurrentDayOfWeek() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

// Auth Middleware
async function authenticate(req, res, next) {
  const token = req.cookies.token || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true, name: true, email: true, role: true, className: true, rollNo: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
}

// Require Teacher or Admin Role
function requireTeacher(req, res, next) {
  if (req.user.role !== 'TEACHER' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Faculty or Administrator access required' });
  }
  next();
}

// ==========================================
// 1. HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ==========================================
// 2. AUTHENTICATION ROUTES
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      className: user.className,
      rollNo: user.rollNo,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      className: user.className,
      rollNo: user.rollNo,
    },
    token,
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// ==========================================
// 3. SCHOOL SETTINGS
// ==========================================
app.get('/api/settings', async (req, res) => {
  let settings = await prisma.schoolSetting.findUnique({ where: { id: 'default' } });
  if (!settings) {
    settings = await prisma.schoolSetting.create({
      data: {
        id: 'default',
        schoolName: 'Apex International Academy',
        latitude: 28.6139,
        longitude: 77.209,
        attendanceRadiusMeters: 250.0,
      },
    });
  }
  res.json(settings);
});

app.put('/api/settings', authenticate, requireTeacher, async (req, res) => {
  const { schoolName, latitude, longitude, attendanceRadiusMeters } = req.body;

  const data = {};
  if (schoolName !== undefined) data.schoolName = String(schoolName);
  if (latitude !== undefined) data.latitude = parseFloat(latitude);
  if (longitude !== undefined) data.longitude = parseFloat(longitude);
  if (attendanceRadiusMeters !== undefined) data.attendanceRadiusMeters = parseFloat(attendanceRadiusMeters);

  const updated = await prisma.schoolSetting.upsert({
    where: { id: 'default' },
    update: data,
    create: {
      id: 'default',
      schoolName: data.schoolName || 'Apex International Academy',
      latitude: data.latitude || 28.6139,
      longitude: data.longitude || 77.209,
      attendanceRadiusMeters: data.attendanceRadiusMeters || 250.0,
    },
  });

  res.json(updated);
});

// ==========================================
// 4. TIMETABLE
// ==========================================
app.get('/api/timetable/:className', authenticate, async (req, res) => {
  const { className } = req.params;

  // Students can only view their own class
  if (req.user.role === 'STUDENT' && req.user.className !== className) {
    return res.status(403).json({ error: 'You are only authorized to view your enrolled class schedule' });
  }

  const entries = await prisma.timetableEntry.findMany({
    where: { className },
    orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
  });

  res.json(entries);
});

app.put('/api/timetable/entry', authenticate, requireTeacher, async (req, res) => {
  const { className, dayOfWeek, period, startTime, endTime, subject, teacherName, room } = req.body;

  if (!className || !dayOfWeek || !period || !subject) {
    return res.status(400).json({ error: 'Missing required timetable fields (className, dayOfWeek, period, subject)' });
  }

  const updated = await prisma.timetableEntry.upsert({
    where: {
      className_dayOfWeek_period: {
        className,
        dayOfWeek,
        period: parseInt(period, 10),
      },
    },
    update: {
      subject,
      teacherName: teacherName || req.user.name,
      room: room || 'Lecture Hall 101',
      ...(startTime ? { startTime } : {}),
      ...(endTime ? { endTime } : {}),
    },
    create: {
      className,
      dayOfWeek,
      period: parseInt(period, 10),
      startTime: startTime || '09:00',
      endTime: endTime || '09:50',
      subject,
      teacherName: teacherName || req.user.name,
      room: room || 'Lecture Hall 101',
    },
  });

  res.json(updated);
});

// ==========================================
// 5. ATTENDANCE & REAL GEOLOCATION
// ==========================================
app.post('/api/attendance/mark', authenticate, async (req, res) => {
  if (req.user.role !== 'STUDENT') {
    return res.status(403).json({ error: 'Only registered students can self-mark attendance via geolocation' });
  }

  const { latitude, longitude, testBypass } = req.body;
  const todayStr = getTodayDateStr();

  // Check if attendance already marked today
  const existing = await prisma.attendanceRecord.findUnique({
    where: {
      studentId_date: {
        studentId: req.user.id,
        date: todayStr,
      },
    },
  });

  if (existing) {
    return res.status(400).json({
      error: 'Daily attendance has already been recorded for today',
      record: existing,
    });
  }

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'GPS coordinates (latitude, longitude) are required' });
  }

  // School settings
  const settings = await prisma.schoolSetting.findUnique({ where: { id: 'default' } }) || {
    latitude: 28.6139,
    longitude: 77.209,
    attendanceRadiusMeters: 250.0,
  };

  const distance = haversineDistance(
    parseFloat(latitude),
    parseFloat(longitude),
    settings.latitude,
    settings.longitude
  );

  const roundedDistance = Math.round(distance);

  // Verification check: distance <= radius or developer test bypass
  if (!testBypass && roundedDistance > settings.attendanceRadiusMeters) {
    return res.status(400).json({
      error: `Location out of bounds: You are ${roundedDistance}m away from campus. Maximum permitted distance is ${Math.round(settings.attendanceRadiusMeters)}m.`,
      distanceMeters: roundedDistance,
      allowedRadius: settings.attendanceRadiusMeters,
      schoolLocation: { latitude: settings.latitude, longitude: settings.longitude },
    });
  }

  const record = await prisma.attendanceRecord.create({
    data: {
      studentId: req.user.id,
      date: todayStr,
      status: 'PRESENT',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      distanceMeters: roundedDistance,
      verified: true,
      verifiedBy: 'GEOLOCATION',
    },
  });

  res.json({
    message: 'Attendance verified and recorded successfully',
    record,
    distanceMeters: roundedDistance,
  });
});

app.get('/api/attendance/my', authenticate, async (req, res) => {
  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: req.user.id },
    orderBy: { date: 'desc' },
  });

  const total = records.length;
  const present = records.filter((r) => r.status === 'PRESENT').length;
  const late = records.filter((r) => r.status === 'LATE').length;
  const absent = records.filter((r) => r.status === 'ABSENT').length;
  const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;

  const todayStr = getTodayDateStr();
  const markedToday = records.some((r) => r.date === todayStr);

  res.json({
    records,
    stats: { total, present, late, absent, percentage, markedToday },
  });
});

app.get('/api/attendance/class', authenticate, requireTeacher, async (req, res) => {
  const { className, date } = req.query;
  const targetDate = date || getTodayDateStr();
  const targetClass = className || req.user.className || '10-A';

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT', className: targetClass },
    select: { id: true, name: true, rollNo: true, username: true },
    orderBy: { rollNo: 'asc' },
  });

  const studentIds = students.map((s) => s.id);
  const records = await prisma.attendanceRecord.findMany({
    where: {
      studentId: { in: studentIds },
      date: targetDate,
    },
  });

  const recordMap = new Map(records.map((r) => [r.studentId, r]));

  const list = students.map((st) => {
    const rec = recordMap.get(st.id);
    return {
      studentId: st.id,
      name: st.name,
      rollNo: st.rollNo,
      username: st.username,
      status: rec ? rec.status : 'NOT_RECORDED',
      distanceMeters: rec ? rec.distanceMeters : null,
      verifiedBy: rec ? rec.verifiedBy : null,
      recordId: rec ? rec.id : null,
    };
  });

  res.json({ date: targetDate, className: targetClass, attendance: list });
});

app.post('/api/attendance/override', authenticate, requireTeacher, async (req, res) => {
  const { studentId, date, status } = req.body;

  if (!studentId || !status) {
    return res.status(400).json({ error: 'studentId and status are required' });
  }

  const targetDate = date || getTodayDateStr();

  const record = await prisma.attendanceRecord.upsert({
    where: {
      studentId_date: {
        studentId,
        date: targetDate,
      },
    },
    update: {
      status,
      verified: status === 'PRESENT' || status === 'LATE',
      verifiedBy: 'TEACHER_OVERRIDE',
    },
    create: {
      studentId,
      date: targetDate,
      status,
      verified: status === 'PRESENT' || status === 'LATE',
      verifiedBy: 'TEACHER_OVERRIDE',
    },
  });

  res.json({ message: 'Attendance status updated', record });
});

app.get('/api/attendance/summary', authenticate, requireTeacher, async (req, res) => {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: {
      id: true,
      name: true,
      username: true,
      className: true,
      rollNo: true,
      attendanceRecords: true,
    },
    orderBy: [{ className: 'asc' }, { rollNo: 'asc' }],
  });

  const summary = students.map((s) => {
    const total = s.attendanceRecords.length;
    const present = s.attendanceRecords.filter((r) => r.status === 'PRESENT').length;
    const late = s.attendanceRecords.filter((r) => r.status === 'LATE').length;
    const absent = s.attendanceRecords.filter((r) => r.status === 'ABSENT').length;
    const percentage = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;

    return {
      id: s.id,
      name: s.name,
      username: s.username,
      className: s.className,
      rollNo: s.rollNo,
      total,
      present,
      late,
      absent,
      percentage,
      isLowAttendance: percentage < 75,
    };
  });

  res.json(summary);
});

// ==========================================
// 6. ASSIGNMENTS & TESTS
// ==========================================
app.get('/api/assignments', authenticate, async (req, res) => {
  const { className } = req.query;
  const targetClass = req.user.role === 'STUDENT' ? req.user.className : (className || '10-A');

  const assignments = await prisma.assignment.findMany({
    where: { className: targetClass },
    include: {
      teacher: { select: { name: true } },
      studentStatuses: req.user.role === 'STUDENT' ? { where: { studentId: req.user.id } } : false,
    },
    orderBy: { dueDate: 'asc' },
  });

  const todayStr = getTodayDateStr();

  const formatted = assignments.map((a) => {
    const isDone = a.studentStatuses?.length > 0 ? a.studentStatuses[0].isDone : false;
    const isOverdue = a.dueDate < todayStr && !isDone;

    return {
      id: a.id,
      type: a.type,
      className: a.className,
      subject: a.subject,
      title: a.title,
      description: a.description,
      dueDate: a.dueDate,
      teacherName: a.teacher.name,
      isDone,
      isOverdue,
      createdAt: a.createdAt,
    };
  });

  res.json(formatted);
});

app.post('/api/assignments', authenticate, requireTeacher, async (req, res) => {
  const { title, className, subject, type, description, dueDate } = req.body;

  if (!title || !className || !subject || !dueDate) {
    return res.status(400).json({ error: 'Required fields missing: title, className, subject, and dueDate are mandatory' });
  }

  const created = await prisma.assignment.create({
    data: {
      title,
      className,
      subject,
      type: type === 'TEST' ? 'TEST' : 'ASSIGNMENT',
      description: description || null,
      dueDate,
      teacherId: req.user.id,
    },
  });

  res.status(201).json(created);
});

app.delete('/api/assignments/:id', authenticate, requireTeacher, async (req, res) => {
  const { id } = req.params;
  await prisma.assignment.delete({ where: { id } });
  res.json({ message: 'Assignment/Test removed successfully' });
});

app.post('/api/assignments/:id/toggle-done', authenticate, async (req, res) => {
  if (req.user.role !== 'STUDENT') {
    return res.status(403).json({ error: 'Only students can mark assignments as completed' });
  }

  const { id } = req.params;
  const existing = await prisma.studentAssignmentStatus.findUnique({
    where: {
      studentId_assignmentId: {
        studentId: req.user.id,
        assignmentId: id,
      },
    },
  });

  const nextStatus = existing ? !existing.isDone : true;

  const updated = await prisma.studentAssignmentStatus.upsert({
    where: {
      studentId_assignmentId: {
        studentId: req.user.id,
        assignmentId: id,
      },
    },
    update: {
      isDone: nextStatus,
      completedAt: nextStatus ? new Date() : null,
    },
    create: {
      studentId: req.user.id,
      assignmentId: id,
      isDone: true,
      completedAt: new Date(),
    },
  });

  res.json({ isDone: updated.isDone });
});

// ==========================================
// 7. AI CHATBOT (Claude SDK + Context Grounding)
// ==========================================
app.post('/api/chat', authenticate, async (req, res) => {
  const { messages } = req.body;
  const user = req.user;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // 1. Gather live contextual data for this user
  const todayStr = getTodayDateStr();
  const dayOfWeek = getCurrentDayOfWeek();

  // Schedule for today
  let todaySchedule = [];
  if (user.className) {
    todaySchedule = await prisma.timetableEntry.findMany({
      where: { className: user.className, dayOfWeek },
      orderBy: { period: 'asc' },
    });
  }

  // Attendance
  let attendanceInfo = 'Not applicable';
  if (user.role === 'STUDENT') {
    const records = await prisma.attendanceRecord.findMany({ where: { studentId: user.id } });
    const total = records.length;
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;
    const todayRec = records.find((r) => r.date === todayStr);
    attendanceInfo = `${percentage}% overall (${present}/${total} recorded sessions). Today: ${
      todayRec ? todayRec.status : 'Pending / Not Marked Yet'
    }`;
  }

  // Assignments / Tests
  let pendingTasks = [];
  if (user.className) {
    pendingTasks = await prisma.assignment.findMany({
      where: { className: user.className },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });
  }

  const school = (await prisma.schoolSetting.findUnique({ where: { id: 'default' } })) || {
    schoolName: 'Apex International Academy',
    attendanceRadiusMeters: 250,
  };

  // Build System Prompt
  const systemPrompt = `You are SMARTCLASS AI, an intelligent, friendly, and context-aware academic assistant embedded into the Apex International Academy ERP portal.

CURRENT USER CONTEXT:
- Name: ${user.name}
- Role: ${user.role}
- Enrolled Class / Section: ${user.className || 'Faculty Staff'}
- Current Date: ${todayStr} (${dayOfWeek})
- Institution: ${school.schoolName}
- Attendance Status: ${attendanceInfo}

TODAY'S TIMETABLE (${dayOfWeek}):
${
  todaySchedule.length > 0
    ? todaySchedule
        .map((s) => `• Period ${s.period} (${s.startTime} - ${s.endTime}): ${s.subject} with ${s.teacherName} [${s.room}]`)
        .join('\n')
    : 'No scheduled classes today (or weekend).'
}

UPCOMING ASSIGNMENTS & TESTS:
${
  pendingTasks.length > 0
    ? pendingTasks
        .map((t) => `• [${t.type}] ${t.title} (${t.subject}) - Due: ${t.dueDate}`)
        .join('\n')
    : 'No active assignments or tests.'
}

INSTRUCTIONS:
1. Always be polite, concise, encouraging, and academically helpful.
2. Ground all answers in the live ERP data provided above whenever the user asks about schedules, attendance, classes, teachers, rooms, or assignments.
3. If asked about subjects or academic topics (e.g. calculus, physics, programming, essay writing), provide clear, insightful educational explanations.
4. Keep answers readable with markdown bullet points and bold highlights.`;

  // Try Claude API if configured
  if (anthropic) {
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      });

      const replyText = response.content
        .filter((c) => c.type === 'text')
        .map((c) => c.text)
        .join('\n');

      return res.json({ reply: replyText, source: 'claude' });
    } catch (apiErr) {
      console.warn('Anthropic API request failed, falling back to local reasoning engine:', apiErr.message);
    }
  }

  // Fallback Context-Grounded Intelligent Response Engine
  const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
  let responseText = '';

  if (lastUserMsg.includes('timetable') || lastUserMsg.includes('schedule') || lastUserMsg.includes('class') || lastUserMsg.includes('period') || lastUserMsg.includes('today')) {
    if (todaySchedule.length > 0) {
      responseText = `Here is your schedule for today (**${dayOfWeek}**, ${user.className}):\n\n` +
        todaySchedule.map(s => `• **Period ${s.period}** (${s.startTime} – ${s.endTime}): **${s.subject}** with *${s.teacherName}* in *${s.room}*`).join('\n') +
        `\n\nMake sure to arrive 5 minutes early for roll call!`;
    } else {
      responseText = `You have no scheduled lectures for today (**${dayOfWeek}**). Enjoy your study or revision time!`;
    }
  } else if (lastUserMsg.includes('attendance') || lastUserMsg.includes('present') || lastUserMsg.includes('absent')) {
    responseText = `📊 **Your Attendance Overview:**\n\n• **Status:** ${attendanceInfo}\n• **Geofencing Radius:** Campus geofence is calibrated to **${school.attendanceRadiusMeters} meters**.\n\nYou can verify and submit today's attendance in the **Attendance** tab using your device's high-accuracy GPS.`;
  } else if (lastUserMsg.includes('assignment') || lastUserMsg.includes('homework') || lastUserMsg.includes('test') || lastUserMsg.includes('exam') || lastUserMsg.includes('due')) {
    if (pendingTasks.length > 0) {
      responseText = `📚 **Upcoming Tasks & Deadlines for ${user.className}:**\n\n` +
        pendingTasks.map(t => `• **[${t.type}]** ${t.title} (${t.subject}) — **Due: ${t.dueDate}**`).join('\n') +
        `\n\nYou can track and mark these items as completed in the **Assignments & Tests** tab.`;
    } else {
      responseText = `Great news! You currently have no pending assignments or upcoming tests for **${user.className}**.`;
    }
  } else if (lastUserMsg.includes('who are you') || lastUserMsg.includes('help') || lastUserMsg.includes('what can you do')) {
    responseText = `Hello **${user.name}**! I am **SMARTCLASS AI**, your intelligent academic companion.\n\nI can help you with:\n• **Live Timetables:** Ask *"What is my next class?"* or *"Today's schedule"*\n• **Attendance:** Ask *"What's my attendance percentage?"*\n• **Assignments & Tests:** Ask *"What assignments are due?"*\n• **Academic Explanations:** Ask me to explain concepts in Math, Physics, Computer Science, and more!`;
  } else {
    responseText = `Hello **${user.name}**! I am monitoring your **${user.className || 'academic'}** portal.\n\nYour current attendance is **${attendanceInfo}**. You have **${pendingTasks.length}** pending coursework items registered.\n\nFeel free to ask me anything about your daily schedule, upcoming tests, or course concepts!`;
  }

  res.json({ reply: responseText, source: 'smartclass-fallback-engine' });
});

// ==========================================
// 8. START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 SMARTCLASS AI backend running on http://localhost:${PORT}`);
});
