import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import prisma from './db.js';
import { processChatConversation, testAiKey } from './aiEngine.js';

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
  const { username, password, role } = req.body || {};

  let user = null;

  if (username && password) {
    user = await prisma.user.findUnique({ where: { username } });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
  } else if (username) {
    user = await prisma.user.findUnique({ where: { username } });
  } else if (role) {
    user = await prisma.user.findFirst({ where: { role } });
  }

  // Fallback to default user (Admin or first user in db)
  if (!user) {
    user = (await prisma.user.findFirst({ where: { role: 'ADMIN' } })) || (await prisma.user.findFirst());
  }

  if (!user) {
    return res.status(404).json({ error: 'No user account found in database' });
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
        schoolName: 'Arka Jain University, Gamharia',
        latitude: 22.8433,
        longitude: 86.1024,
        attendanceRadiusMeters: 250.0,
      },
    });
  }
  res.json(settings);
});

app.put('/api/settings', authenticate, requireTeacher, async (req, res) => {
  const { schoolName, latitude, longitude, attendanceRadiusMeters, aiApiKey, aiProvider } = req.body;

  const data = {};
  if (schoolName !== undefined) data.schoolName = String(schoolName);
  if (latitude !== undefined) data.latitude = parseFloat(latitude);
  if (longitude !== undefined) data.longitude = parseFloat(longitude);
  if (attendanceRadiusMeters !== undefined) data.attendanceRadiusMeters = parseFloat(attendanceRadiusMeters);
  if (aiApiKey !== undefined) data.aiApiKey = String(aiApiKey);
  if (aiProvider !== undefined) data.aiProvider = String(aiProvider);

  const updated = await prisma.schoolSetting.upsert({
    where: { id: 'default' },
    update: data,
    create: {
      id: 'default',
      schoolName: data.schoolName || 'Arka Jain University, Gamharia',
      latitude: data.latitude || 22.8433,
      longitude: data.longitude || 86.1024,
      attendanceRadiusMeters: data.attendanceRadiusMeters || 250.0,
      aiApiKey: data.aiApiKey || '',
      aiProvider: data.aiProvider || 'gemini',
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
    latitude: 22.8433,
    longitude: 86.1024,
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
  const todayRec = records.find((r) => r.date === todayStr);
  const markedToday = !!todayRec;

  res.json({
    records,
    stats: {
      total,
      present,
      late,
      absent,
      percentage,
      markedToday,
      todayPassCount: todayRec?.passCount || 0,
      todayFirstSeen: todayRec?.firstSeenTime || null,
      todayLastSeen: todayRec?.lastSeenTime || null,
      todayVerifiedBy: todayRec?.verifiedBy || null,
      todayCctvCamera: todayRec?.cctvCamera || null,
    },
  });
});

app.get('/api/attendance/class', authenticate, requireTeacher, async (req, res) => {
  const { className, date } = req.query;
  const targetDate = date || getTodayDateStr();
  const targetClass = className || req.user.className || '10-A';

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT', className: targetClass },
    select: { id: true, name: true, rollNo: true, username: true, faceImageUrl: true },
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
      faceImageUrl: st.faceImageUrl,
      status: rec ? rec.status : 'NOT_RECORDED',
      distanceMeters: rec ? rec.distanceMeters : null,
      verifiedBy: rec ? rec.verifiedBy : null,
      passCount: rec ? (rec.passCount || 1) : 0,
      firstSeenTime: rec ? rec.firstSeenTime : null,
      lastSeenTime: rec ? rec.lastSeenTime : null,
      cctvCamera: rec ? rec.cctvCamera : null,
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
// 6.5. CCTV FACIAL RECOGNITION & PASSAGE TRACKING
// ==========================================

// 1. Get Enrolled Students for CCTV Recognition
app.get('/api/cctv/students', authenticate, async (req, res) => {
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: {
      id: true,
      name: true,
      username: true,
      className: true,
      rollNo: true,
      faceDescriptor: true,
      faceImageUrl: true,
    },
    orderBy: [{ className: 'asc' }, { rollNo: 'asc' }],
  });
  res.json(students);
});

// 2. Register / Update Face for a Student
app.post('/api/cctv/register-face', authenticate, async (req, res) => {
  const { studentId, faceDescriptor, faceImageUrl } = req.body;
  const targetId = studentId || req.user.id;

  if (req.user.role === 'STUDENT' && req.user.id !== targetId) {
    return res.status(403).json({ error: 'Students can only register their own facial profile' });
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: {
      faceDescriptor: typeof faceDescriptor === 'string' ? faceDescriptor : JSON.stringify(faceDescriptor),
      faceImageUrl: faceImageUrl || null,
    },
    select: { id: true, name: true, rollNo: true, faceImageUrl: true, className: true },
  });

  res.json({ message: 'Facial biometric profile enrolled successfully', student: updated });
});

// 3. Record Passage & Auto-Mark Attendance via CCTV
app.post('/api/cctv/record-passage', authenticate, async (req, res) => {
  const {
    studentId,
    cameraName = 'Gate 1 - Main Turnstile CCTV',
    direction = 'IN',
    confidence = 0.95,
    snapshotUrl = null,
  } = req.body;

  const todayStr = getTodayDateStr();
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0]; // "HH:MM:SS"

  let student = null;
  let passNumber = 1;

  if (studentId) {
    student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, className: true, rollNo: true },
    });
  }

  // Count existing passages for this student or visitor today
  if (studentId) {
    const existingCount = await prisma.cctvPassage.count({
      where: { studentId, date: todayStr },
    });
    passNumber = existingCount + 1;
  } else {
    const unidentifiedCount = await prisma.cctvPassage.count({
      where: { studentId: null, date: todayStr },
    });
    passNumber = unidentifiedCount + 1;
  }

  // Create Passage Log
  const passage = await prisma.cctvPassage.create({
    data: {
      studentId: studentId || null,
      date: todayStr,
      timeStr,
      cameraName,
      direction: direction || 'IN',
      confidence: confidence ? parseFloat(confidence) : null,
      snapshotUrl: snapshotUrl || null,
      passNumber,
      status: studentId ? 'VERIFIED' : 'UNKNOWN',
    },
    include: {
      student: { select: { id: true, name: true, rollNo: true, className: true } },
    },
  });

  let attendanceRecord = null;
  let isFirstPassToday = false;

  // If identified student, automatically mark / update attendance!
  if (studentId) {
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        studentId_date: {
          studentId,
          date: todayStr,
        },
      },
    });

    if (!existingRecord) {
      // First pass of the day -> Mark PRESENT!
      isFirstPassToday = true;
      attendanceRecord = await prisma.attendanceRecord.create({
        data: {
          studentId,
          date: todayStr,
          status: 'PRESENT',
          verified: true,
          verifiedBy: 'CCTV_FACIAL_RECOGNITION',
          passCount: 1,
          firstSeenTime: timeStr,
          lastSeenTime: timeStr,
          cctvCamera: cameraName,
        },
      });
    } else {
      // Subsequent pass -> Increment pass count, update last seen time
      const wasAbsentOrUnmarked = existingRecord.status !== 'PRESENT';
      attendanceRecord = await prisma.attendanceRecord.update({
        where: { id: existingRecord.id },
        data: {
          passCount: (existingRecord.passCount || 1) + 1,
          lastSeenTime: timeStr,
          cctvCamera: cameraName,
          ...(wasAbsentOrUnmarked ? {
            status: 'PRESENT',
            verified: true,
            verifiedBy: 'CCTV_FACIAL_RECOGNITION',
          } : {}),
        },
      });
    }
  }

  res.json({
    success: true,
    message: student
      ? `Passage recorded for ${student.name} (Pass #${passNumber})${isFirstPassToday ? ' — Attendance marked PRESENT via CCTV' : ''}`
      : `Unidentified visitor passage recorded (Pass #${passNumber})`,
    passNumber,
    isFirstPassToday,
    passage,
    attendanceRecord,
  });
});

// 4. Get CCTV Passage Activity Logs
app.get('/api/cctv/passages', authenticate, async (req, res) => {
  const { date, limit = 50, className } = req.query;
  const targetDate = date || getTodayDateStr();

  const whereClause = { date: targetDate };
  if (className) {
    whereClause.student = { className };
  }

  const passages = await prisma.cctvPassage.findMany({
    where: whereClause,
    include: {
      student: { select: { id: true, name: true, rollNo: true, className: true, faceImageUrl: true } },
    },
    orderBy: { timestamp: 'desc' },
    take: parseInt(limit, 10),
  });

  res.json(passages);
});

// 5. Get Aggregate CCTV Passage & Attendance Stats
app.get('/api/cctv/stats', authenticate, async (req, res) => {
  const todayStr = getTodayDateStr();

  const [totalPassages, allPassages, cctvAttendance] = await Promise.all([
    prisma.cctvPassage.count({ where: { date: todayStr } }),
    prisma.cctvPassage.findMany({
      where: { date: todayStr },
      select: { studentId: true, direction: true, timeStr: true, cameraName: true },
    }),
    prisma.attendanceRecord.findMany({
      where: { date: todayStr, verifiedBy: 'CCTV_FACIAL_RECOGNITION' },
    }),
  ]);

  const uniqueStudents = new Set(allPassages.filter(p => p.studentId).map(p => p.studentId)).size;
  const entriesCount = allPassages.filter(p => p.direction === 'IN' || p.direction === 'ENTRY').length;
  const exitsCount = allPassages.filter(p => p.direction === 'OUT' || p.direction === 'EXIT').length;
  const currentInCampus = Math.max(0, entriesCount - exitsCount);

  // Hourly distribution
  const hourlyMap = {};
  for (let h = 8; h <= 18; h++) {
    const hh = String(h).padStart(2, '0') + ':00';
    hourlyMap[hh] = 0;
  }
  for (const p of allPassages) {
    if (p.timeStr) {
      const hour = p.timeStr.split(':')[0] + ':00';
      if (hourlyMap[hour] !== undefined) {
        hourlyMap[hour]++;
      }
    }
  }

  res.json({
    date: todayStr,
    totalPassages,
    uniqueStudents,
    cctvAttendanceCount: cctvAttendance.length,
    entriesCount,
    exitsCount,
    currentInCampus,
    hourly: Object.entries(hourlyMap).map(([hour, count]) => ({ hour, count })),
  });
});

// 6. Configured CCTV Cameras
app.get('/api/cctv/cameras', authenticate, async (req, res) => {
  let cameras = await prisma.cctvCamera.findMany();
  if (cameras.length === 0) {
    await prisma.cctvCamera.createMany({
      data: [
        { name: 'Gate 1 - Main Turnstile CCTV', location: 'Campus Main Entrance Gate', type: 'ENTRANCE' },
        { name: 'Gate 2 - East Sports Wing CCTV', location: 'East Perimeter Pavilion', type: 'ENTRANCE' },
        { name: 'Science & AI Block Corridor CCTV-03', location: 'Academic Wing Floor 1', type: 'HALLWAY' },
        { name: 'Central Library Turnstile CCTV-04', location: 'Library & Resource Hub', type: 'ENTRANCE' },
      ],
    });
    cameras = await prisma.cctvCamera.findMany();
  }
  res.json(cameras);
});

// ==========================================
// 7. AI CHATBOT (Claude SDK + Context Grounding)
// ==========================================
app.post('/api/ai/test-key', authenticate, async (req, res) => {
  const { apiKey, provider, save } = req.body;
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }

  try {
    const testResult = await testAiKey({ apiKey, provider: provider || 'gemini' });
    if (save) {
      await prisma.schoolSetting.upsert({
        where: { id: 'default' },
        update: { aiApiKey: apiKey, aiProvider: provider || 'gemini' },
        create: {
          id: 'default',
          schoolName: 'Arka Jain University, Gamharia',
          aiApiKey: apiKey,
          aiProvider: provider || 'gemini',
        },
      });
    }
    return res.json({ success: true, message: 'Google Gemini API key verified successfully!', model: testResult.model });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/chat', authenticate, async (req, res) => {
  const { messages, apiKey, provider } = req.body;
  const user = req.user;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    const result = await processChatConversation({
      messages,
      user,
      prisma,
      clientKey: apiKey,
      clientProvider: provider,
    });
    return res.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Failed to process chat message', details: error.message });
  }
});

// ==========================================
// 8. START SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 SMARTCLASS AI backend running on http://localhost:${PORT}`);
});
