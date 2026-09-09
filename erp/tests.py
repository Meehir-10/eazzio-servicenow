from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
import datetime
from .models import (
    Profile, Room, Subject, ClassSchedule, ScheduleChange,
    Holiday, Notification, Attendance, Assignment,
    AssignmentSubmission, Notice, RoomBooking
)
from .ai_timetable import parse_natural_language_prompt, generate_timetable

class SmartClassAITests(TestCase):
    def setUp(self):
        self.client = Client()
        
        # Admin
        self.admin_user = User.objects.create_user(username='admin_test', password='password123', is_staff=True)
        Profile.objects.create(user=self.admin_user, role='admin')

        # Teacher
        self.teacher_user = User.objects.create_user(username='teacher_test', password='password123')
        Profile.objects.create(user=self.teacher_user, role='teacher', department='CSE')

        # Student
        self.student_user = User.objects.create_user(username='student_test', password='password123')
        Profile.objects.create(user=self.student_user, role='student', semester=4, section='A', id_number='21CS099')

        # Venues
        self.room1 = Room.objects.create(room_number='R101', name='Lecture Hall 1', room_type='Classroom', capacity=60)
        self.lab1 = Room.objects.create(room_number='L201', name='Computing Lab 1', room_type='Lab', capacity=40)

        # Subjects
        self.subj1 = Subject.objects.create(code='CS401', name='Data Structures & Algorithms', semester=4, credits=4, faculty=self.teacher_user)
        self.subj_lab = Subject.objects.create(code='CS402', name='Advanced AI Lab', semester=4, credits=2, faculty=self.teacher_user)

    def test_landing_page(self):
        response = self.client.get(reverse('landing'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "SMART CLASS AI")

    def test_authentication_and_dashboard_routing(self):
        # Login Student
        login_success = self.client.login(username='student_test', password='password123')
        self.assertTrue(login_success)
        response = self.client.get(reverse('dashboard'), follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Student Dashboard")
        self.client.logout()

        # Login Teacher
        self.client.login(username='teacher_test', password='password123')
        response = self.client.get(reverse('dashboard'), follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Faculty Dashboard")
        self.client.logout()

    def test_ai_timetable_engine(self):
        prompt = "Generate a 5-day timetable for semester 4 with 6 lectures starting at 9 AM"
        hints = parse_natural_language_prompt(prompt)
        self.assertEqual(hints['slots_per_day'], 6)
        self.assertEqual(hints['start_hour'], 9)
        self.assertEqual(len(hints['days']), 5)

        result = generate_timetable(
            semester=4,
            section='A',
            working_days=hints['days'],
            start_hour=hints['start_hour'],
            slots_per_day=hints['slots_per_day'],
            include_lunch=True,
            save_to_db=True
        )
        self.assertTrue(result['success'])
        self.assertEqual(result['conflicts_count'], 0)
        self.assertGreaterEqual(result['optimization_score'], 90.0)
        self.assertEqual(result['total_classes'], 30) # 5 days * 6 slots
        self.assertEqual(ClassSchedule.objects.filter(semester=4, section='A').count(), 30)

    def test_schedule_change_and_notification(self):
        schedule = ClassSchedule.objects.create(
            subject=self.subj1,
            faculty=self.teacher_user,
            room=self.room1,
            day='Monday',
            start_time=datetime.time(9, 0),
            end_time=datetime.time(9, 55),
            semester=4,
            section='A'
        )

        self.client.login(username='teacher_test', password='password123')
        post_data = {
            'schedule': schedule.id,
            'date': timezone.now().date(),
            'new_room': self.lab1.id,
            'reason': 'Moving to lab for hands-on demonstration',
            'is_cancelled': False
        }
        response = self.client.post(reverse('change_schedule'), post_data, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(ScheduleChange.objects.filter(schedule=schedule).exists())
        # Check student notification
        notif = Notification.objects.filter(recipient=self.student_user).first()
        self.assertIsNotNone(notif)
        self.assertIn("Moving to lab", notif.message)

    def test_attendance_recording(self):
        schedule = ClassSchedule.objects.create(
            subject=self.subj1,
            faculty=self.teacher_user,
            room=self.room1,
            day='Tuesday',
            start_time=datetime.time(10, 0),
            end_time=datetime.time(10, 55),
            semester=4,
            section='A'
        )
        self.client.login(username='teacher_test', password='password123')
        post_data = {
            'date': timezone.now().strftime('%Y-%m-%d'),
            f'status_{self.student_user.id}': 'Present',
            f'remarks_{self.student_user.id}': 'Active in discussion',
        }
        response = self.client.post(reverse('mark_attendance', args=[schedule.id]), post_data, follow=True)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(Attendance.objects.filter(student=self.student_user, status='Present').exists())

    def test_ai_academic_assistant(self):
        self.client.login(username='student_test', password='password123')
        response = self.client.get(reverse('ai_assistant') + '?query=What is my attendance rate?')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Your overall attendance is")
