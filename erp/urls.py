from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing, name='landing'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('dashboard/student/', views.student_dashboard, name='student_dashboard'),
    path('dashboard/teacher/', views.teacher_dashboard, name='teacher_dashboard'),
    path('dashboard/admin/', views.admin_dashboard, name='admin_dashboard'),
    
    # Timetable
    path('timetable/', views.view_timetable, name='view_timetable'),
    path('timetable/ai-generator/', views.ai_timetable_view, name='ai_timetable'),
    path('timetable/change/', views.change_schedule_view, name='change_schedule'),

    # Academic features
    path('attendance/', views.attendance_list, name='attendance_list'),
    path('attendance/mark/<int:schedule_id>/', views.mark_attendance, name='mark_attendance'),

    path('assignments/', views.assignment_list, name='assignment_list'),
    path('assignments/create/', views.assignment_create, name='assignment_create'),
    path('assignments/<int:pk>/', views.assignment_detail, name='assignment_detail'),

    path('notices/', views.notice_list, name='notice_list'),
    path('notices/create/', views.notice_create, name='notice_create'),

    path('holidays/', views.holiday_list, name='holiday_list'),
    path('rooms/', views.room_list, name='room_list'),
    path('analytics/', views.analytics_view, name='analytics'),
    path('ai-assistant/', views.ai_assistant_view, name='ai_assistant'),

    path('notifications/<int:pk>/read/', views.mark_notification_read, name='mark_notification_read'),
]
