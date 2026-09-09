import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from erp.models import (
    Profile, Room, Subject, ClassSchedule, Holiday,
    Notice, Assignment, AssignmentSubmission, Attendance, Notification
)

class Command(BaseCommand):
    help = 'Seeds complete college ERP demonstration dataset for CampusSphere AI'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Starting CampusSphere AI database seeding..."))

        # 1. Admin User
        admin_user, _ = User.objects.get_or_create(username='admin', defaults={'email': 'admin@campussphere.edu', 'is_staff': True, 'is_superuser': True, 'first_name': 'Dean', 'last_name': 'Academics'})
        admin_user.set_password('admin123')
        admin_user.save()
        Profile.objects.update_or_create(user=admin_user, defaults={'role': 'admin', 'id_number': 'EMP001', 'department': 'Academic Administration'})

        # 2. Faculty Users
        prof1, _ = User.objects.get_or_create(username='prof_sharma', defaults={'email': 'sharma@campussphere.edu', 'first_name': 'Rajesh', 'last_name': 'Sharma'})
        prof1.set_password('teacher123')
        prof1.save()
        Profile.objects.update_or_create(user=prof1, defaults={'role': 'teacher', 'id_number': 'FAC-CS-101', 'department': 'Computer Science & Engineering'})

        prof2, _ = User.objects.get_or_create(username='prof_gupta', defaults={'email': 'gupta@campussphere.edu', 'first_name': 'Pooja', 'last_name': 'Gupta'})
        prof2.set_password('teacher123')
        prof2.save()
        Profile.objects.update_or_create(user=prof2, defaults={'role': 'teacher', 'id_number': 'FAC-CS-102', 'department': 'Computer Science & Engineering'})

        # 3. Student Users
        student1, _ = User.objects.get_or_create(username='rohit_kumar', defaults={'email': 'rohit@student.edu', 'first_name': 'Rohit', 'last_name': 'Kumar'})
        student1.set_password('student123')
        student1.save()
        Profile.objects.update_or_create(user=student1, defaults={'role': 'student', 'id_number': '21CS042', 'semester': 4, 'section': 'A', 'department': 'Computer Science & Engineering'})

        student2, _ = User.objects.get_or_create(username='ananya_sen', defaults={'email': 'ananya@student.edu', 'first_name': 'Ananya', 'last_name': 'Sen'})
        student2.set_password('student123')
        student2.save()
        Profile.objects.update_or_create(user=student2, defaults={'role': 'student', 'id_number': '21CS015', 'semester': 4, 'section': 'A', 'department': 'Computer Science & Engineering'})

        # 4. Rooms
        r1, _ = Room.objects.get_or_create(room_number='LH-101', defaults={'name': 'Turing Lecture Hall', 'room_type': 'Classroom', 'capacity': 70, 'has_projector': True})
        r2, _ = Room.objects.get_or_create(room_number='LH-102', defaults={'name': 'Lovelace Lecture Hall', 'room_type': 'Classroom', 'capacity': 70, 'has_projector': True})
        r3, _ = Room.objects.get_or_create(room_number='L-201', defaults={'name': 'Advanced AI & ML Lab', 'room_type': 'Lab', 'capacity': 45, 'has_projector': True})
        r4, _ = Room.objects.get_or_create(room_number='L-202', defaults={'name': 'Data Systems & Cloud Lab', 'room_type': 'Lab', 'capacity': 45, 'has_projector': True})
        r5, _ = Room.objects.get_or_create(room_number='SH-1', defaults={'name': 'Kalam Seminar Hall', 'room_type': 'Seminar', 'capacity': 150, 'has_projector': True})

        # 5. Subjects
        s1, _ = Subject.objects.get_or_create(code='CS401', defaults={'name': 'Design & Analysis of Algorithms', 'semester': 4, 'credits': 4, 'faculty': prof1})
        s2, _ = Subject.objects.get_or_create(code='CS402', defaults={'name': 'Database Management Systems', 'semester': 4, 'credits': 4, 'faculty': prof2})
        s3, _ = Subject.objects.get_or_create(code='CS403', defaults={'name': 'Artificial Intelligence & Machine Learning', 'semester': 4, 'credits': 4, 'faculty': prof1})
        s4, _ = Subject.objects.get_or_create(code='CS404', defaults={'name': 'Computer Networks & Security', 'semester': 4, 'credits': 3, 'faculty': prof2})
        s5, _ = Subject.objects.get_or_create(code='CS405', defaults={'name': 'AI & Machine Learning Practical Lab', 'semester': 4, 'credits': 2, 'faculty': prof1})

        # 6. Class Schedules (Mon - Fri for Sem 4 Sec A)
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        subjects_sequence = [
            (s1, prof1, r1, datetime.time(9, 0), datetime.time(9, 55)),
            (s2, prof2, r1, datetime.time(10, 0), datetime.time(10, 55)),
            (s3, prof1, r2, datetime.time(11, 15), datetime.time(12, 10)),
            (s5, prof1, r3, datetime.time(13, 15), datetime.time(15, 0)),
            (s4, prof2, r2, datetime.time(15, 10), datetime.time(16, 5)),
        ]

        ClassSchedule.objects.filter(semester=4, section='A').delete()
        for day in days:
            for subj, fac, rm, st, et in subjects_sequence:
                ClassSchedule.objects.create(
                    subject=subj,
                    faculty=fac,
                    room=rm,
                    day=day,
                    start_time=st,
                    end_time=et,
                    semester=4,
                    section='A',
                    is_active=True
                )

        # 7. Holidays
        today = timezone.now().date()
        Holiday.objects.get_or_create(name='National Science & Innovation Day', date=today + datetime.timedelta(days=12), defaults={'holiday_type': 'Academic', 'description': 'College symposium and exhibition day'})
        Holiday.objects.get_or_create(name='Mid-Term Academic Break', date=today + datetime.timedelta(days=25), defaults={'holiday_type': 'Academic', 'description': 'Scheduled break for term evaluations'})
        Holiday.objects.get_or_create(name='Autumn Festival', date=today + datetime.timedelta(days=40), defaults={'holiday_type': 'Festival', 'description': 'Official institute holiday'})

        # 8. Notices
        Notice.objects.get_or_create(
            title="Mid-Term Examination Schedule Announced",
            defaults={
                'content': "The semester 4 Mid-Term Examinations will commence from next month. Detailed subject-wise syllabus is uploaded to portal.",
                'target_role': 'All',
                'priority': 'Important',
                'posted_by': admin_user
            }
        )
        Notice.objects.get_or_create(
            title="AI Innovation Hackathon Registrations Open",
            defaults={
                'content': "CampusSphere AI Lab is hosting the Annual 48-hour student hackathon. Cash prizes and internship opportunities for top 3 teams.",
                'target_role': 'Student',
                'priority': 'Normal',
                'posted_by': prof1
            }
        )

        # 9. Assignments
        assign1, _ = Assignment.objects.get_or_create(
            title="Lab Assignment 1: Minimax & Alpha-Beta Pruning Implementation",
            defaults={
                'subject': s3,
                'faculty': prof1,
                'semester': 4,
                'section': 'A',
                'due_date': timezone.now() + datetime.timedelta(days=5),
                'max_marks': 50,
                'description': "Implement Tic-Tac-Toe agent with Minimax optimization. Submit code and analysis report."
            }
        )

        AssignmentSubmission.objects.get_or_create(
            assignment=assign1,
            student=student1,
            defaults={
                'submission_text': 'Implemented adversarial search with alpha-beta cutoff. Tested on 100 iterations.',
                'marks_obtained': 48.0,
                'feedback': 'Excellent implementation and clean time complexity benchmarks.'
            }
        )

        # 10. Sample Attendance
        sch_sample = ClassSchedule.objects.filter(semester=4, section='A').first()
        if sch_sample:
            for day_offset in range(1, 6):
                d = today - datetime.timedelta(days=day_offset)
                Attendance.objects.get_or_create(student=student1, schedule=sch_sample, date=d, defaults={'status': 'Present', 'marked_by': prof1})
                Attendance.objects.get_or_create(student=student2, schedule=sch_sample, date=d, defaults={'status': 'Present' if day_offset != 3 else 'Absent', 'marked_by': prof1})

        # 11. Welcome Notifications
        Notification.objects.create(
            recipient=student1,
            title="Semester 4 Timetable Published",
            message="Your weekly schedule is ready. First lecture begins at 9:00 AM in LH-101.",
            notification_type="Schedule",
            link="/timetable/"
        )

        self.stdout.write(self.style.SUCCESS("Demo database successfully populated!"))
        self.stdout.write("Credentials:")
        self.stdout.write("  Admin:    admin       / admin123")
        self.stdout.write("  Teacher:  prof_sharma / teacher123")
        self.stdout.write("  Student:  rohit_kumar / student123")
