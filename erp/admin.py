from django.contrib import admin
from .models import (
    Profile, Room, Subject, ClassSchedule, ScheduleChange,
    Holiday, Notification, Attendance, Assignment,
    AssignmentSubmission, Notice, RoomBooking
)

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'id_number', 'department', 'semester', 'section')
    list_filter = ('role', 'department', 'semester')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'id_number')

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('room_number', 'name', 'room_type', 'capacity', 'has_projector', 'is_active')
    list_filter = ('room_type', 'is_active')
    search_fields = ('room_number', 'name')

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'department', 'semester', 'credits', 'faculty')
    list_filter = ('semester', 'department')
    search_fields = ('code', 'name')

@admin.register(ClassSchedule)
class ClassScheduleAdmin(admin.ModelAdmin):
    list_display = ('day', 'start_time', 'end_time', 'subject', 'faculty', 'room', 'semester', 'section', 'is_active')
    list_filter = ('day', 'semester', 'section', 'is_active')
    search_fields = ('subject__name', 'faculty__username', 'room__room_number')

@admin.register(ScheduleChange)
class ScheduleChangeAdmin(admin.ModelAdmin):
    list_display = ('schedule', 'date', 'new_room', 'new_faculty', 'is_cancelled', 'created_by', 'created_at')
    list_filter = ('date', 'is_cancelled')

@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'holiday_type', 'created_by')
    list_filter = ('holiday_type',)
    search_fields = ('name',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')
    search_fields = ('title', 'recipient__username')

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'schedule', 'date', 'status', 'marked_by')
    list_filter = ('status', 'date')
    search_fields = ('student__username', 'schedule__subject__name')

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'subject', 'faculty', 'semester', 'section', 'due_date', 'max_marks')
    list_filter = ('semester', 'section', 'due_date')
    search_fields = ('title', 'subject__name')

@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'student', 'submitted_at', 'marks_obtained')
    list_filter = ('submitted_at',)
    search_fields = ('assignment__title', 'student__username')

@admin.register(Notice)
class NoticeAdmin(admin.ModelAdmin):
    list_display = ('title', 'target_role', 'priority', 'posted_by', 'created_at')
    list_filter = ('target_role', 'priority')
    search_fields = ('title', 'content')

@admin.register(RoomBooking)
class RoomBookingAdmin(admin.ModelAdmin):
    list_display = ('room', 'booked_by', 'date', 'start_time', 'end_time', 'status')
    list_filter = ('status', 'date')
    search_fields = ('room__room_number', 'booked_by__username')

