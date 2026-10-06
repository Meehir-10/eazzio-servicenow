import bcrypt from 'bcryptjs';
import prisma from './db.js';

async function seed() {
  console.log('🌱 Starting SMARTCLASS AI database seed...');

  // 1. School Settings
  await prisma.schoolSetting.upsert({
    where: { id: 'default' },
    update: {
      schoolName: 'Arka Jain University, Gamharia',
      latitude: 22.8433,
      longitude: 86.1024,
      attendanceRadiusMeters: 250.0,
    },
    create: {
      id: 'default',
      schoolName: 'Arka Jain University, Gamharia',
      latitude: 22.8433,
      longitude: 86.1024,
      attendanceRadiusMeters: 250.0,
    },
  });
  console.log('✅ School settings configured.');

  // Passwords
  const hash = (pw) => bcrypt.hashSync(pw, 10);
  const adminPass = hash('admin123');
  const teacherPass = hash('teacher123');
  const studentPass = hash('student123');

  // Helper to generate normalized 128-dimensional biometric facial embedding
  function generateFaceEmbedding(seedVal) {
    const vec = [];
    let sumSq = 0;
    for (let i = 0; i < 128; i++) {
      const val = Math.sin((seedVal + 1) * (i + 1) * 12.9898) * 43758.5453 % 1;
      vec.push(val);
      sumSq += val * val;
    }
    const norm = Math.sqrt(sumSq) || 1;
    return vec.map((v) => Number((v / norm).toFixed(4)));
  }

  // High quality SVG Face Portraits for students
  const rohitFaceSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="%231e293b"/><circle cx="60" cy="50" r="28" fill="%23e0ac69"/><path d="M36 44 Q60 22 84 44" fill="%231e1b4b" stroke="%231e1b4b" stroke-width="8"/><rect x="42" y="44" width="14" height="10" rx="3" fill="none" stroke="%231e1b4b" stroke-width="2.5"/><rect x="64" y="44" width="14" height="10" rx="3" fill="none" stroke="%231e1b4b" stroke-width="2.5"/><line x1="56" y1="48" x2="64" y2="48" stroke="%231e1b4b" stroke-width="2.5"/><circle cx="49" cy="49" r="2.5" fill="%231e1b4b"/><circle cx="71" cy="49" r="2.5" fill="%231e1b4b"/><path d="M52 64 Q60 70 68 64" fill="none" stroke="%239a3412" stroke-width="2.5" stroke-linecap="round"/><path d="M25 110 C25 85 95 85 95 110 Z" fill="%233b82f6"/></svg>`;
  const ananyaFaceSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="%230f172a"/><circle cx="60" cy="52" r="27" fill="%23f5d0b5"/><path d="M30 40 Q60 18 90 40 Q94 66 90 85 Q82 60 80 50 Q60 30 40 50 Q38 60 30 85 Z" fill="%23171717"/><circle cx="48" cy="52" r="3" fill="%23171717"/><circle cx="72" cy="52" r="3" fill="%23171717"/><path d="M53 66 Q60 72 67 66" fill="none" stroke="%23be123c" stroke-width="2.5" stroke-linecap="round"/><path d="M25 110 C25 88 95 88 95 110 Z" fill="%2310b981"/></svg>`;
  const rahulFaceSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="%2318181b"/><circle cx="60" cy="50" r="28" fill="%23d4a373"/><path d="M34 42 Q60 20 86 42" fill="%2327272a" stroke="%2327272a" stroke-width="7"/><circle cx="48" cy="49" r="3" fill="%2327272a"/><circle cx="72" cy="49" r="3" fill="%2327272a"/><path d="M53 65 Q60 70 67 65" fill="none" stroke="%23854d0e" stroke-width="2.5" stroke-linecap="round"/><path d="M25 110 C25 86 95 86 95 110 Z" fill="%238b5cf6"/></svg>`;
  const priyaFaceSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="%23111827"/><circle cx="60" cy="52" r="27" fill="%23e8be96"/><path d="M32 42 Q60 20 88 42 Q86 64 88 78 Q78 50 60 40 Q42 50 32 78 Z" fill="%231c1917"/><circle cx="48" cy="51" r="3" fill="%231c1917"/><circle cx="72" cy="51" r="3" fill="%231c1917"/><path d="M52 66 Q60 71 68 66" fill="none" stroke="%23e11d48" stroke-width="2.5" stroke-linecap="round"/><path d="M25 110 C25 88 95 88 95 110 Z" fill="%23ec4899"/></svg>`;

  // 2. Demo Users
  const users = [
    {
      username: 'admin',
      name: 'Dr. Alistair Vance (Dean)',
      email: 'admin@smartclass.edu',
      password: adminPass,
      role: 'ADMIN',
    },
    {
      username: 'prof_sharma',
      name: 'Prof. Rajesh Sharma',
      email: 'sharma@smartclass.edu',
      password: teacherPass,
      role: 'TEACHER',
      className: '10-A',
    },
    {
      username: 'prof_gupta',
      name: 'Prof. Neha Gupta',
      email: 'gupta@smartclass.edu',
      password: teacherPass,
      role: 'TEACHER',
      className: '10-B',
    },
    {
      username: 'rohit_kumar',
      name: 'Rohit Kumar',
      email: 'rohit@smartclass.edu',
      password: studentPass,
      role: 'STUDENT',
      className: '10-A',
      rollNo: '10A01',
      faceDescriptor: JSON.stringify(generateFaceEmbedding(101)),
      faceImageUrl: rohitFaceSvg,
    },
    {
      username: 'ananya_sen',
      name: 'Ananya Sen',
      email: 'ananya@smartclass.edu',
      password: studentPass,
      role: 'STUDENT',
      className: '10-A',
      rollNo: '10A02',
      faceDescriptor: JSON.stringify(generateFaceEmbedding(102)),
      faceImageUrl: ananyaFaceSvg,
    },
    {
      username: 'rahul_verma',
      name: 'Rahul Verma',
      email: 'rahul@smartclass.edu',
      password: studentPass,
      role: 'STUDENT',
      className: '10-B',
      rollNo: '10B01',
      faceDescriptor: JSON.stringify(generateFaceEmbedding(103)),
      faceImageUrl: rahulFaceSvg,
    },
    {
      username: 'priya_patel',
      name: 'Priya Patel',
      email: 'priya@smartclass.edu',
      password: studentPass,
      role: 'STUDENT',
      className: '10-B',
      rollNo: '10B02',
      faceDescriptor: JSON.stringify(generateFaceEmbedding(104)),
      faceImageUrl: priyaFaceSvg,
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: {
        name: u.name,
        email: u.email,
        password: u.password,
        role: u.role,
        className: u.className || null,
        rollNo: u.rollNo || null,
        faceDescriptor: u.faceDescriptor || null,
        faceImageUrl: u.faceImageUrl || null,
      },
      create: u,
    });
  }
  console.log(`✅ Seeded ${users.length} users with facial recognition biometric profiles.`);

  const teacherSharma = await prisma.user.findUnique({ where: { username: 'prof_sharma' } });
  const teacherGupta = await prisma.user.findUnique({ where: { username: 'prof_gupta' } });
  const studentRohit = await prisma.user.findUnique({ where: { username: 'rohit_kumar' } });
  const studentAnanya = await prisma.user.findUnique({ where: { username: 'ananya_sen' } });
  const studentRahul = await prisma.user.findUnique({ where: { username: 'rahul_verma' } });
  const studentPriya = await prisma.user.findUnique({ where: { username: 'priya_patel' } });

  // 3. Weekly Timetables for 10-A and 10-B
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [
    { period: 1, start: '09:00', end: '09:50' },
    { period: 2, start: '09:55', end: '10:45' },
    { period: 3, start: '10:50', end: '11:40' },
    { period: 4, start: '11:45', end: '12:35' },
    { period: 5, start: '13:30', end: '14:20' },
    { period: 6, start: '14:25', end: '15:15' },
  ];

  const schedule10A = [
    ['Mathematics', 'Physics', 'Computer Science', 'English', 'Chemistry', 'Sports & Wellness'],
    ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Social Science', 'Library Hour'],
    ['Computer Science', 'Mathematics', 'Physics', 'English', 'Biology', 'Robotics Club'],
    ['Mathematics', 'Computer Science', 'Chemistry', 'Social Science', 'Physics', 'Mentorship'],
    ['Chemistry', 'Physics', 'Mathematics', 'English', 'AI Lab', 'Seminar'],
  ];

  const schedule10B = [
    ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'English', 'AI Lab'],
    ['Chemistry', 'Social Science', 'Computer Science', 'Mathematics', 'Physics', 'Sports & Wellness'],
    ['Mathematics', 'Physics', 'English', 'Computer Science', 'Social Science', 'Mentorship'],
    ['Physics', 'Mathematics', 'Chemistry', 'English', 'Computer Science', 'Robotics Club'],
    ['Social Science', 'Computer Science', 'Physics', 'Mathematics', 'Chemistry', 'Library Hour'],
  ];

  const getTeacherForSubject = (subj) => {
    if (subj.includes('Math') || subj.includes('Physics') || subj.includes('Seminar')) {
      return 'Prof. Rajesh Sharma';
    }
    if (subj.includes('Computer') || subj.includes('AI') || subj.includes('Robotics')) {
      return 'Prof. Neha Gupta';
    }
    if (subj.includes('Chem') || subj.includes('Bio')) {
      return 'Dr. Anita Desai';
    }
    return 'Dr. Robert Blake';
  };

  const getRoomForSubject = (subj) => {
    if (subj.includes('Computer') || subj.includes('AI') || subj.includes('Robotics')) {
      return 'AI Computing Lab 4';
    }
    if (subj.includes('Physics') || subj.includes('Chem') || subj.includes('Bio')) {
      return 'Science Lab 2';
    }
    return 'Lecture Hall 301';
  };

  for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
    const day = days[dayIdx];
    for (let pIdx = 0; pIdx < periods.length; pIdx++) {
      const p = periods[pIdx];

      // 10-A
      const subjA = schedule10A[dayIdx][pIdx];
      await prisma.timetableEntry.upsert({
        where: {
          className_dayOfWeek_period: {
            className: '10-A',
            dayOfWeek: day,
            period: p.period,
          },
        },
        update: {
          startTime: p.start,
          endTime: p.end,
          subject: subjA,
          teacherName: getTeacherForSubject(subjA),
          room: getRoomForSubject(subjA),
        },
        create: {
          className: '10-A',
          dayOfWeek: day,
          period: p.period,
          startTime: p.start,
          endTime: p.end,
          subject: subjA,
          teacherName: getTeacherForSubject(subjA),
          room: getRoomForSubject(subjA),
        },
      });

      // 10-B
      const subjB = schedule10B[dayIdx][pIdx];
      await prisma.timetableEntry.upsert({
        where: {
          className_dayOfWeek_period: {
            className: '10-B',
            dayOfWeek: day,
            period: p.period,
          },
        },
        update: {
          startTime: p.start,
          endTime: p.end,
          subject: subjB,
          teacherName: getTeacherForSubject(subjB),
          room: getRoomForSubject(subjB),
        },
        create: {
          className: '10-B',
          dayOfWeek: day,
          period: p.period,
          startTime: p.start,
          endTime: p.end,
          subject: subjB,
          teacherName: getTeacherForSubject(subjB),
          room: getRoomForSubject(subjB),
        },
      });
    }
  }
  console.log('✅ Weekly timetables generated for Class 10-A & 10-B (60 total slots).');

  // 4. Assignments & Tests
  const today = new Date();
  const formatOffset = (daysOffset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split('T')[0];
  };

  const sampleAssignments = [
    {
      title: 'Calculus: Derivatives & Optimization Problem Set',
      className: '10-A',
      subject: 'Mathematics',
      type: 'ASSIGNMENT',
      description: 'Complete questions 1 to 15 from Chapter 4. Show complete mathematical proofs and graphs where applicable.',
      dueDate: formatOffset(3),
      teacherId: teacherSharma.id,
    },
    {
      title: 'Database Normalization & 3NF ERD Design',
      className: '10-A',
      subject: 'Computer Science',
      type: 'ASSIGNMENT',
      description: 'Design a normalized relational schema for a multi-vendor logistics system up to 3NF/BCNF. Include key diagrams.',
      dueDate: formatOffset(5),
      teacherId: teacherGupta.id,
    },
    {
      title: 'Electromagnetism & Wave Mechanics Unit Test',
      className: '10-A',
      subject: 'Physics',
      type: 'TEST',
      description: 'Comprehensive 50-mark timed unit assessment covering Maxwell equations, induction, and wave propagation.',
      dueDate: formatOffset(7),
      teacherId: teacherSharma.id,
    },
    {
      title: 'Thermodynamics Calorimetry Lab Report',
      className: '10-A',
      subject: 'Physics',
      type: 'ASSIGNMENT',
      description: 'Submit the formal lab observation notes and calculated specific heat constants from last week’s experiment.',
      dueDate: formatOffset(-2), // Overdue!
      teacherId: teacherSharma.id,
    },
    {
      title: 'Data Structures: Binary Search Trees & Heaps',
      className: '10-B',
      subject: 'Computer Science',
      type: 'ASSIGNMENT',
      description: 'Implement AVL tree rotations and max-heap priority queue operations with complexity analysis.',
      dueDate: formatOffset(4),
      teacherId: teacherGupta.id,
    },
    {
      title: 'Linear Algebra Matrices Midterm Assessment',
      className: '10-B',
      subject: 'Mathematics',
      type: 'TEST',
      description: 'Timed assessment covering eigenvalues, eigenvectors, and Gaussian row reductions.',
      dueDate: formatOffset(6),
      teacherId: teacherSharma.id,
    },
  ];

  for (const a of sampleAssignments) {
    const existing = await prisma.assignment.findFirst({
      where: { title: a.title, className: a.className },
    });
    if (!existing) {
      const created = await prisma.assignment.create({ data: a });
      // Mark one done for Rohit for realistic test
      if (a.title.includes('Calculus') && studentRohit) {
        await prisma.studentAssignmentStatus.create({
          data: {
            studentId: studentRohit.id,
            assignmentId: created.id,
            isDone: true,
          },
        });
      }
    }
  }
  console.log('✅ Assignments and tests populated.');

  // 5. Historical Attendance Records
  // Generate records for the past 10 days for each student
  const students = [studentRohit, studentAnanya, studentRahul, studentPriya];
  for (let i = 1; i <= 10; i++) {
    const dStr = formatOffset(-i);
    // skip weekends
    const dayDate = new Date(today);
    dayDate.setDate(dayDate.getDate() - i);
    if (dayDate.getDay() === 0 || dayDate.getDay() === 6) continue;

    for (const st of students) {
      if (!st) continue;
      // High attendance for Rohit & Ananya (90%), lower for Rahul (70%), Priya (85%)
      let status = 'PRESENT';
      let verifiedBy = 'GEOLOCATION';
      let distance = 45.2;

      if (st.username === 'rahul_verma' && (i === 2 || i === 5 || i === 8)) {
        status = 'ABSENT';
        distance = 1450.0;
        verifiedBy = 'TEACHER_OVERRIDE';
      } else if (st.username === 'priya_patel' && i === 3) {
        status = 'LATE';
        distance = 68.4;
      }

      await prisma.attendanceRecord.upsert({
        where: {
          studentId_date: {
            studentId: st.id,
            date: dStr,
          },
        },
        update: {},
        create: {
          studentId: st.id,
          date: dStr,
          status,
          latitude: 22.84335,
          longitude: 86.10245,
          distanceMeters: distance,
          verified: status === 'PRESENT' || status === 'LATE',
          verifiedBy,
        },
      });
    }
  }
  console.log('✅ Historical attendance records seeded for all students.');

  // 6. CCTV Campus Turnstiles & Entrance Cameras
  const cameras = [
    { name: 'Gate 1 - Main Turnstile CCTV', location: 'Campus Main Entrance Gate', type: 'ENTRANCE' },
    { name: 'Gate 2 - East Sports Wing CCTV', location: 'East Perimeter Pavilion', type: 'ENTRANCE' },
    { name: 'Science & AI Block Corridor CCTV-03', location: 'Academic Wing Floor 1', type: 'HALLWAY' },
    { name: 'Central Library Turnstile CCTV-04', location: 'Library & Resource Hub', type: 'ENTRANCE' },
  ];

  for (const c of cameras) {
    const existingCam = await prisma.cctvCamera.findFirst({ where: { name: c.name } });
    if (!existingCam) {
      await prisma.cctvCamera.create({ data: c });
    }
  }
  console.log('✅ CCTV Campus cameras initialized.');

  // 7. Today's Live CCTV Passages & Facial Recognition Attendance
  const todayStr = new Date().toISOString().split('T')[0];

  // Seed passages for today
  if (studentRohit && studentAnanya && studentRahul) {
    // Clear today's test passages to avoid unbounded duplicates
    await prisma.cctvPassage.deleteMany({ where: { date: todayStr } });

    // Rohit passed 3 times today
    await prisma.cctvPassage.createMany({
      data: [
        {
          studentId: studentRohit.id,
          date: todayStr,
          timeStr: '08:52:14',
          cameraName: 'Gate 1 - Main Turnstile CCTV',
          direction: 'IN',
          confidence: 0.98,
          passNumber: 1,
          status: 'VERIFIED',
        },
        {
          studentId: studentRohit.id,
          date: todayStr,
          timeStr: '12:45:08',
          cameraName: 'Gate 1 - Main Turnstile CCTV',
          direction: 'OUT',
          confidence: 0.96,
          passNumber: 2,
          status: 'VERIFIED',
        },
        {
          studentId: studentRohit.id,
          date: todayStr,
          timeStr: '13:15:30',
          cameraName: 'Gate 1 - Main Turnstile CCTV',
          direction: 'IN',
          confidence: 0.97,
          passNumber: 3,
          status: 'VERIFIED',
        },
      ],
    });

    // Ananya passed 2 times today
    await prisma.cctvPassage.createMany({
      data: [
        {
          studentId: studentAnanya.id,
          date: todayStr,
          timeStr: '09:01:22',
          cameraName: 'Gate 1 - Main Turnstile CCTV',
          direction: 'IN',
          confidence: 0.99,
          passNumber: 1,
          status: 'VERIFIED',
        },
        {
          studentId: studentAnanya.id,
          date: todayStr,
          timeStr: '13:20:45',
          cameraName: 'Science & AI Block Corridor CCTV-03',
          direction: 'IN',
          confidence: 0.95,
          passNumber: 2,
          status: 'VERIFIED',
        },
      ],
    });

    // Rahul passed 1 time today
    await prisma.cctvPassage.create({
      data: {
        studentId: studentRahul.id,
        date: todayStr,
        timeStr: '09:14:50',
        cameraName: 'Gate 1 - Main Turnstile CCTV',
        direction: 'IN',
        confidence: 0.94,
        passNumber: 1,
        status: 'VERIFIED',
      },
    });

    // Unidentified visitor passed once
    await prisma.cctvPassage.create({
      data: {
        studentId: null,
        date: todayStr,
        timeStr: '10:32:10',
        cameraName: 'Gate 1 - Main Turnstile CCTV',
        direction: 'IN',
        confidence: 0.62,
        passNumber: 1,
        status: 'UNKNOWN',
      },
    });

    // Record today's attendance records marked by CCTV Facial Recognition
    await prisma.attendanceRecord.upsert({
      where: { studentId_date: { studentId: studentRohit.id, date: todayStr } },
      update: {
        status: 'PRESENT',
        verified: true,
        verifiedBy: 'CCTV_FACIAL_RECOGNITION',
        passCount: 3,
        firstSeenTime: '08:52:14',
        lastSeenTime: '13:15:30',
        cctvCamera: 'Gate 1 - Main Turnstile CCTV',
      },
      create: {
        studentId: studentRohit.id,
        date: todayStr,
        status: 'PRESENT',
        verified: true,
        verifiedBy: 'CCTV_FACIAL_RECOGNITION',
        passCount: 3,
        firstSeenTime: '08:52:14',
        lastSeenTime: '13:15:30',
        cctvCamera: 'Gate 1 - Main Turnstile CCTV',
      },
    });

    await prisma.attendanceRecord.upsert({
      where: { studentId_date: { studentId: studentAnanya.id, date: todayStr } },
      update: {
        status: 'PRESENT',
        verified: true,
        verifiedBy: 'CCTV_FACIAL_RECOGNITION',
        passCount: 2,
        firstSeenTime: '09:01:22',
        lastSeenTime: '13:20:45',
        cctvCamera: 'Gate 1 - Main Turnstile CCTV',
      },
      create: {
        studentId: studentAnanya.id,
        date: todayStr,
        status: 'PRESENT',
        verified: true,
        verifiedBy: 'CCTV_FACIAL_RECOGNITION',
        passCount: 2,
        firstSeenTime: '09:01:22',
        lastSeenTime: '13:20:45',
        cctvCamera: 'Gate 1 - Main Turnstile CCTV',
      },
    });

    await prisma.attendanceRecord.upsert({
      where: { studentId_date: { studentId: studentRahul.id, date: todayStr } },
      update: {
        status: 'PRESENT',
        verified: true,
        verifiedBy: 'CCTV_FACIAL_RECOGNITION',
        passCount: 1,
        firstSeenTime: '09:14:50',
        lastSeenTime: '09:14:50',
        cctvCamera: 'Gate 1 - Main Turnstile CCTV',
      },
      create: {
        studentId: studentRahul.id,
        date: todayStr,
        status: 'PRESENT',
        verified: true,
        verifiedBy: 'CCTV_FACIAL_RECOGNITION',
        passCount: 1,
        firstSeenTime: '09:14:50',
        lastSeenTime: '09:14:50',
        cctvCamera: 'Gate 1 - Main Turnstile CCTV',
      },
    });

    console.log('✅ Today\'s CCTV passage records and facial recognition attendance populated.');
  }

  console.log('🎉 SMARTCLASS AI database seed completed successfully!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
