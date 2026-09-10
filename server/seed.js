import bcrypt from 'bcryptjs';
import prisma from './db.js';

async function seed() {
  console.log('🌱 Starting SMARTCLASS AI database seed...');

  // 1. School Settings
  await prisma.schoolSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      schoolName: 'Apex International Academy',
      latitude: 28.6139,
      longitude: 77.2090,
      attendanceRadiusMeters: 250.0,
    },
  });
  console.log('✅ School settings configured.');

  // Passwords
  const hash = (pw) => bcrypt.hashSync(pw, 10);
  const adminPass = hash('admin123');
  const teacherPass = hash('teacher123');
  const studentPass = hash('student123');

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
    },
    {
      username: 'ananya_sen',
      name: 'Ananya Sen',
      email: 'ananya@smartclass.edu',
      password: studentPass,
      role: 'STUDENT',
      className: '10-A',
      rollNo: '10A02',
    },
    {
      username: 'rahul_verma',
      name: 'Rahul Verma',
      email: 'rahul@smartclass.edu',
      password: studentPass,
      role: 'STUDENT',
      className: '10-B',
      rollNo: '10B01',
    },
    {
      username: 'priya_patel',
      name: 'Priya Patel',
      email: 'priya@smartclass.edu',
      password: studentPass,
      role: 'STUDENT',
      className: '10-B',
      rollNo: '10B02',
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
      },
      create: u,
    });
  }
  console.log(`✅ Seeded ${users.length} users (Admin, Teachers, Students).`);

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
          latitude: 28.61395,
          longitude: 77.20905,
          distanceMeters: distance,
          verified: status === 'PRESENT' || status === 'LATE',
          verifiedBy,
        },
      });
    }
  }
  console.log('✅ Historical attendance records seeded for all students.');
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
