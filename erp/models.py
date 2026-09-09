from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Profile(models.Model):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher/Faculty'),
        ('admin', 'Admin/Staff'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    id_number = models.CharField(max_length=50, blank=True, null=True, help_text="Roll No or Faculty ID")
    department = models.CharField(max_length=100, default='Computer Science & Engineering')
    phone = models.CharField(max_length=20, blank=True, null=True)
    semester = models.IntegerField(default=1, blank=True, null=True)
    section = models.CharField(max_length=10, default='A', blank=True, null=True)
    avatar = models.FileField(upload_to='profiles/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.get_role_display()})"


class Room(models.Model):
    ROOM_TYPES = (
        ('Classroom', 'Smart Classroom'),
        ('Lab', 'Computer / AI Lab'),
        ('Seminar', 'Seminar Hall'),
        ('Auditorium', 'Auditorium'),
    )
    room_number = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=100)
    room_type = models.CharField(max_length=30, choices=ROOM_TYPES, default='Classroom')
    capacity = models.PositiveIntegerField(default=60)
    has_projector = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.room_number} - {self.name} ({self.room_type})"


class Subject(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=150)
    department = models.CharField(max_length=100, default='Computer Science & Engineering')
    semester = models.IntegerField(default=1)
    credits = models.PositiveIntegerField(default=3)
    faculty = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_subjects')

    def __str__(self):
        return f"[{self.code}] {self.name} (Sem {self.semester})"


class ClassSchedule(models.Model):
    DAY_CHOICES = (
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='schedules')
    faculty = models.ForeignKey(User, on_delete=models.CASCADE, related_name='teaching_schedules')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='room_schedules')
    day = models.CharField(max_length=20, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    semester = models.IntegerField(default=1)
    section = models.CharField(max_length=10, default='A')
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['day', 'start_time']

    def __str__(self):
        return f"{self.day} {self.start_time.strftime('%H:%M')} - {self.subject.name} (Sec {self.section})"


class ScheduleChange(models.Model):
    schedule = models.ForeignKey(ClassSchedule, on_delete=models.CASCADE, related_name='changes')
    date = models.DateField()
    new_room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='rescheduled_rooms')
    new_faculty = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='substituted_schedules')
    reason = models.TextField()
    is_cancelled = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='schedule_changes_created')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Change for {self.schedule} on {self.date}"


class Holiday(models.Model):
    TYPE_CHOICES = (
        ('National', 'National Holiday'),
        ('Academic', 'Academic / Term Break'),
        ('Festival', 'Cultural / Festival'),
        ('Emergency', 'Administrative / Emergency'),
    )
    name = models.CharField(max_length=150)
    date = models.DateField()
    holiday_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='National')
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date']

    def __str__(self):
        return f"{self.name} ({self.date})"


class Notification(models.Model):
    TYPE_CHOICES = (
        ('Schedule', 'Timetable & Classes'),
        ('Notice', 'Official Notice'),
        ('Holiday', 'Holiday Update'),
        ('Assignment', 'Assignment Alert'),
        ('General', 'General ERP Notice'),
    )
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='General')
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"To {self.recipient.username}: {self.title}"


class Attendance(models.Model):
    STATUS_CHOICES = (
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
    )
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendances')
    schedule = models.ForeignKey(ClassSchedule, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Present')
    remarks = models.CharField(max_length=200, blank=True, null=True)
    marked_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='marked_attendances')
    marked_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'schedule', 'date')
        ordering = ['-date', 'schedule__start_time']

    def __str__(self):
        return f"{self.student.username} - {self.schedule.subject.name} - {self.date}: {self.status}"


class Assignment(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='assignments')
    faculty = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_assignments')
    semester = models.IntegerField(default=1)
    section = models.CharField(max_length=10, default='A')
    due_date = models.DateTimeField()
    max_marks = models.PositiveIntegerField(default=100)
    attachment = models.FileField(upload_to='assignments/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.subject.code})"


class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignment_submissions')
    submission_text = models.TextField(blank=True, null=True)
    submission_file = models.FileField(upload_to='submissions/', blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    marks_obtained = models.FloatField(blank=True, null=True)
    feedback = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('assignment', 'student')
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.student.username} - {self.assignment.title}"


class Notice(models.Model):
    TARGET_CHOICES = (
        ('All', 'All Students & Faculty'),
        ('Student', 'Students Only'),
        ('Teacher', 'Faculty Only'),
    )
    PRIORITY_CHOICES = (
        ('Normal', 'Normal'),
        ('Important', 'Important'),
        ('Urgent', 'Urgent Alert'),
    )
    title = models.CharField(max_length=250)
    content = models.TextField()
    target_role = models.CharField(max_length=20, choices=TARGET_CHOICES, default='All')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Normal')
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posted_notices')
    attachment = models.FileField(upload_to='notices/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.priority}] {self.title}"


class RoomBooking(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending Approval'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='bookings')
    booked_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='room_bookings')
    purpose = models.CharField(max_length=250)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', 'start_time']

    def __str__(self):
        return f"{self.room.room_number} on {self.date} by {self.booked_by.username} ({self.status})"

