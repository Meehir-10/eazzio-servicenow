import datetime
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import JsonResponse
from django.db.models import Count, Q, Avg
from django.utils import timezone

from .models import (
    Profile, Room, Subject, ClassSchedule, ScheduleChange,
    Holiday, Notification, Attendance, Assignment,
    AssignmentSubmission, Notice, RoomBooking
)
from .forms import (
    RegistrationForm, LoginForm, ClassScheduleForm, ScheduleChangeForm,
    HolidayForm, AssignmentForm, AssignmentSubmissionForm,
    NoticeForm, RoomBookingForm, TimetableGeneratorForm
)
from .ai_timetable import parse_natural_language_prompt, generate_timetable


def landing(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    stats = {
        'students_count': Profile.objects.filter(role='student').count(),
        'teachers_count': Profile.objects.filter(role='teacher').count(),
        'subjects_count': Subject.objects.count(),
        'rooms_count': Room.objects.count(),
        'schedules_count': ClassSchedule.objects.filter(is_active=True).count(),
    }
    recent_notices = Notice.objects.filter(target_role__in=['All', 'Student'])[:3]
    return render(request, 'landing.html', {'stats': stats, 'recent_notices': recent_notices})


def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            role = form.cleaned_data.get('role', 'student')
            if role == 'admin':
                user.is_staff = True
            user.save()

            Profile.objects.create(
                user=user,
                role=role,
                id_number=form.cleaned_data.get('id_number', ''),
                department=form.cleaned_data.get('department', 'Computer Science & Engineering'),
                semester=form.cleaned_data.get('semester', 1),
                section=form.cleaned_data.get('section', 'A'),
            )

            Notification.objects.create(
                recipient=user,
                title="Welcome to CampusSphere AI!",
                message=f"Welcome {user.first_name}! Your {role.capitalize()} account is active. Explore your personalized dashboard.",
                notification_type="General"
            )

            messages.success(request, f"Account created successfully! Welcome, {user.first_name or user.username}.")
            login(request, user)
            return redirect('dashboard')
    else:
        form = RegistrationForm()
    return render(request, 'auth/register.html', {'form': form})


def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f"Welcome back, {user.get_full_name() or user.username}!")
                return redirect('dashboard')
            else:
                messages.error(request, "Invalid username or password. Please try again.")
    else:
        form = LoginForm()
    return render(request, 'auth/login.html', {'form': form})


def logout_view(request):
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect('landing')


@login_required
def dashboard(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)
    if profile.role == 'teacher':
        return redirect('teacher_dashboard')
    elif profile.role == 'admin' or request.user.is_superuser:
        return redirect('admin_dashboard')
    else:
        return redirect('student_dashboard')


@login_required
def student_dashboard(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)
    today_name = timezone.now().strftime('%A')
    
    # Today's classes
    today_schedules = ClassSchedule.objects.filter(
        semester=profile.semester,
        section=profile.section,
        day=today_name,
        is_active=True
    ).select_related('subject', 'faculty', 'room').order_by('start_time')

    # Attendance stats
    attendances = Attendance.objects.filter(student=request.user)
    total_attendance_records = attendances.count()
    present_records = attendances.filter(status='Present').count()
    attendance_pct = round((present_records / total_attendance_records * 100), 1) if total_attendance_records > 0 else 100.0

    # Pending assignments
    submitted_ids = AssignmentSubmission.objects.filter(student=request.user).values_list('assignment_id', flat=True)
    pending_assignments = Assignment.objects.filter(
        semester=profile.semester,
        section=profile.section,
        due_date__gte=timezone.now()
    ).exclude(id__in=submitted_ids)[:5]

    # Notices
    notices = Notice.objects.filter(Q(target_role='All') | Q(target_role='Student'))[:4]
    
    # Notifications
    notifications = Notification.objects.filter(recipient=request.user)[:5]
    
    # Upcoming holidays
    upcoming_holidays = Holiday.objects.filter(date__gte=timezone.now().date())[:3]

    context = {
        'profile': profile,
        'today_name': today_name,
        'today_schedules': today_schedules,
        'attendance_pct': attendance_pct,
        'total_attendance_records': total_attendance_records,
        'present_records': present_records,
        'pending_assignments': pending_assignments,
        'notices': notices,
        'notifications': notifications,
        'upcoming_holidays': upcoming_holidays,
    }
    return render(request, 'dashboards/student_dashboard.html', context)


@login_required
def teacher_dashboard(request):
    profile, _ = Profile.objects.get_or_create(user=request.user, defaults={'role': 'teacher'})
    today_name = timezone.now().strftime('%A')

    # Teacher's schedules today
    today_schedules = ClassSchedule.objects.filter(
        faculty=request.user,
        day=today_name,
        is_active=True
    ).select_related('subject', 'room').order_by('start_time')

    # All subjects taught
    assigned_subjects = Subject.objects.filter(faculty=request.user)
    
    # Assignments created
    my_assignments = Assignment.objects.filter(faculty=request.user)[:5]
    
    # Pending room bookings
    my_bookings = RoomBooking.objects.filter(booked_by=request.user)[:4]

    # Notices
    notices = Notice.objects.filter(Q(target_role='All') | Q(target_role='Teacher'))[:4]
    
    # Notifications
    notifications = Notification.objects.filter(recipient=request.user)[:5]

    context = {
        'profile': profile,
        'today_name': today_name,
        'today_schedules': today_schedules,
        'assigned_subjects': assigned_subjects,
        'my_assignments': my_assignments,
        'my_bookings': my_bookings,
        'notices': notices,
        'notifications': notifications,
    }
    return render(request, 'dashboards/teacher_dashboard.html', context)


@login_required
def admin_dashboard(request):
    profile, _ = Profile.objects.get_or_create(user=request.user, defaults={'role': 'admin'})
    if profile.role != 'admin' and not request.user.is_superuser:
        messages.error(request, "Access restricted to Administrators.")
        return redirect('dashboard')

    metrics = {
        'total_students': Profile.objects.filter(role='student').count(),
        'total_teachers': Profile.objects.filter(role='teacher').count(),
        'total_subjects': Subject.objects.count(),
        'total_rooms': Room.objects.count(),
        'total_schedules': ClassSchedule.objects.filter(is_active=True).count(),
        'total_assignments': Assignment.objects.count(),
        'active_notices': Notice.objects.count(),
        'pending_bookings': RoomBooking.objects.filter(status='Pending').count(),
    }

    recent_changes = ScheduleChange.objects.select_related('schedule', 'created_by').order_by('-created_at')[:5]
    recent_bookings = RoomBooking.objects.select_related('room', 'booked_by').filter(status='Pending')[:5]
    recent_notices = Notice.objects.all()[:5]

    context = {
        'profile': profile,
        'metrics': metrics,
        'recent_changes': recent_changes,
        'recent_bookings': recent_bookings,
        'recent_notices': recent_notices,
    }
    return render(request, 'dashboards/admin_dashboard.html', context)


@login_required
def view_timetable(request):
    profile = getattr(request.user, 'profile', None)
    
    # Filter options
    selected_semester = request.GET.get('semester', profile.semester if profile and profile.role == 'student' else 4)
    selected_section = request.GET.get('section', profile.section if profile and profile.role == 'student' else 'A')
    view_type = request.GET.get('view', 'grid') # 'grid' or 'list'

    try:
        selected_semester = int(selected_semester)
    except (ValueError, TypeError):
        selected_semester = 4

    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    # Fetch schedules
    schedules = ClassSchedule.objects.filter(
        semester=selected_semester,
        section=selected_section,
        is_active=True
    ).select_related('subject', 'faculty', 'room').order_by('day', 'start_time')

    # Build weekly grid: {day: [schedules]}
    timetable_grid = {day: [] for day in days}
    for s in schedules:
        if s.day in timetable_grid:
            timetable_grid[s.day].append(s)

    # Active temporary changes for today/upcoming
    recent_changes = ScheduleChange.objects.filter(
        schedule__semester=selected_semester,
        schedule__section=selected_section,
        date__gte=timezone.now().date()
    ).select_related('schedule', 'new_room', 'new_faculty')

    context = {
        'selected_semester': selected_semester,
        'selected_section': selected_section,
        'view_type': view_type,
        'days': days,
        'timetable_grid': timetable_grid,
        'schedules': schedules,
        'recent_changes': recent_changes,
        'can_edit': profile and (profile.role in ['teacher', 'admin'] or request.user.is_superuser),
    }
    return render(request, 'timetable/view_timetable.html', context)


@login_required
def ai_timetable_view(request):
    profile = getattr(request.user, 'profile', None)
    if profile and profile.role == 'student':
        messages.error(request, "Students do not have permission to generate timetables.")
        return redirect('view_timetable')

    generated_result = None
    applied_success = False

    if request.method == 'POST':
        form = TimetableGeneratorForm(request.POST)
        action = request.POST.get('action', 'preview')

        if form.is_valid():
            prompt = form.cleaned_data.get('prompt', '')
            semester = form.cleaned_data.get('semester', 4)
            section = form.cleaned_data.get('section', 'A')
            start_hour = form.cleaned_data.get('start_hour', 9)
            slots_per_day = form.cleaned_data.get('slots_per_day', 6)
            working_days = form.cleaned_data.get('working_days')
            include_lunch = form.cleaned_data.get('include_lunch_break', True)

            # If user provided natural language prompt, enhance parameters
            if prompt:
                hints = parse_natural_language_prompt(prompt)
                if 'days' in hints and not request.POST.get('working_days'):
                    working_days = hints['days']
                if 'slots_per_day' in hints:
                    slots_per_day = hints['slots_per_day']
                if 'start_hour' in hints:
                    start_hour = hints['start_hour']

            save_db = (action == 'apply')
            generated_result = generate_timetable(
                semester=semester,
                section=section,
                working_days=working_days,
                start_hour=start_hour,
                slots_per_day=slots_per_day,
                include_lunch=include_lunch,
                save_to_db=save_db
            )

            if save_db and generated_result.get('success'):
                applied_success = True
                messages.success(request, f"AI Timetable successfully generated and deployed to live ERP for Semester {semester} Section {section}!")
                
                # Notify students of that semester & section
                students = User.objects.filter(profile__role='student', profile__semester=semester, profile__section=section)
                for st in students:
                    Notification.objects.create(
                        recipient=st,
                        title="New AI Timetable Published!",
                        message=f"The semester {semester} Section {section} timetable has been generated and updated.",
                        notification_type="Schedule",
                        link="/timetable/"
                    )
    else:
        form = TimetableGeneratorForm()

    context = {
        'form': form,
        'result': generated_result,
        'applied_success': applied_success,
    }
    return render(request, 'timetable/ai_generator.html', context)


@login_required
def change_schedule_view(request):
    profile = getattr(request.user, 'profile', None)
    if not profile or profile.role not in ['teacher', 'admin']:
        messages.error(request, "Permission denied.")
        return redirect('dashboard')

    if request.method == 'POST':
        form = ScheduleChangeForm(request.POST)
        if form.is_valid():
            change = form.save(commit=False)
            change.created_by = request.user
            change.save()

            # Broadcast notification to students
            target_schedule = change.schedule
            students = User.objects.filter(
                profile__role='student',
                profile__semester=target_schedule.semester,
                profile__section=target_schedule.section
            )
            msg_text = f"Notice: Class for {target_schedule.subject.name} on {change.date} has been updated. Reason: {change.reason}"
            if change.is_cancelled:
                msg_text = f"ALERT: Class for {target_schedule.subject.name} on {change.date} is CANCELLED. Reason: {change.reason}"

            for s in students:
                Notification.objects.create(
                    recipient=s,
                    title="Class Schedule Modification",
                    message=msg_text,
                    notification_type="Schedule",
                    link="/timetable/"
                )

            messages.success(request, "Schedule modification saved and students notified!")
            return redirect('view_timetable')
    else:
        form = ScheduleChangeForm()

    return render(request, 'timetable/change_schedule.html', {'form': form})


@login_required
def attendance_list(request):
    profile = getattr(request.user, 'profile', None)
    if profile.role == 'student':
        attendances = Attendance.objects.filter(student=request.user).select_related('schedule__subject')
        total = attendances.count()
        present = attendances.filter(status='Present').count()
        late = attendances.filter(status='Late').count()
        absent = attendances.filter(status='Absent').count()
        pct = round((present + late * 0.5) / total * 100, 1) if total > 0 else 100.0

        # Subject breakdown
        subject_stats = {}
        for a in attendances:
            subj = a.schedule.subject.name
            if subj not in subject_stats:
                subject_stats[subj] = {'present': 0, 'total': 0}
            subject_stats[subj]['total'] += 1
            if a.status == 'Present':
                subject_stats[subj]['present'] += 1

        for k, v in subject_stats.items():
            v['pct'] = round(v['present'] / v['total'] * 100, 1) if v['total'] > 0 else 0

        return render(request, 'academic/student_attendance.html', {
            'attendances': attendances,
            'total': total,
            'present': present,
            'late': late,
            'absent': absent,
            'pct': pct,
            'subject_stats': subject_stats,
        })
    else:
        # Teacher / Admin view: list schedules to take attendance
        if profile.role == 'teacher':
            my_schedules = ClassSchedule.objects.filter(faculty=request.user, is_active=True).select_related('subject', 'room')
        else:
            my_schedules = ClassSchedule.objects.filter(is_active=True).select_related('subject', 'faculty', 'room')
        return render(request, 'academic/teacher_attendance_hub.html', {'schedules': my_schedules})


@login_required
def mark_attendance(request, schedule_id):
    profile = getattr(request.user, 'profile', None)
    if not profile or profile.role not in ['teacher', 'admin']:
        messages.error(request, "Permission denied.")
        return redirect('dashboard')

    schedule = get_object_or_404(ClassSchedule, id=schedule_id)
    students = Profile.objects.filter(
        role='student',
        semester=schedule.semester,
        section=schedule.section
    ).select_related('user').order_by('id_number', 'user__first_name')

    target_date = request.GET.get('date', timezone.now().strftime('%Y-%m-%d'))

    if request.method == 'POST':
        date_val = request.POST.get('date', target_date)
        for st in students:
            status_val = request.POST.get(f"status_{st.user.id}", 'Present')
            remarks_val = request.POST.get(f"remarks_{st.user.id}", '')
            Attendance.objects.update_or_create(
                student=st.user,
                schedule=schedule,
                date=date_val,
                defaults={
                    'status': status_val,
                    'remarks': remarks_val,
                    'marked_by': request.user,
                }
            )
        messages.success(request, f"Attendance successfully saved for {schedule.subject.name} on {date_val}!")
        return redirect('attendance_list')

    # Existing records for this date
    existing_records = {
        a.student_id: a.status
        for a in Attendance.objects.filter(schedule=schedule, date=target_date)
    }

    return render(request, 'academic/mark_attendance.html', {
        'schedule': schedule,
        'students': students,
        'target_date': target_date,
        'existing_records': existing_records,
    })


@login_required
def assignment_list(request):
    profile = getattr(request.user, 'profile', None)
    if profile.role == 'student':
        assignments = Assignment.objects.filter(
            semester=profile.semester,
            section=profile.section
        ).select_related('subject', 'faculty')
        my_submissions = {s.assignment_id: s for s in AssignmentSubmission.objects.filter(student=request.user)}
        return render(request, 'academic/student_assignments.html', {
            'assignments': assignments,
            'my_submissions': my_submissions,
        })
    else:
        # Teacher / Admin
        if profile.role == 'teacher':
            assignments = Assignment.objects.filter(faculty=request.user).select_related('subject')
        else:
            assignments = Assignment.objects.all().select_related('subject', 'faculty')
        return render(request, 'academic/teacher_assignments.html', {'assignments': assignments})


@login_required
def assignment_create(request):
    profile = getattr(request.user, 'profile', None)
    if not profile or profile.role not in ['teacher', 'admin']:
        messages.error(request, "Permission denied.")
        return redirect('dashboard')

    if request.method == 'POST':
        form = AssignmentForm(request.POST, request.FILES)
        if form.is_valid():
            assign = form.save(commit=False)
            assign.faculty = request.user
            assign.save()

            # Notify students
            students = User.objects.filter(
                profile__role='student',
                profile__semester=assign.semester,
                profile__section=assign.section
            )
            for s in students:
                Notification.objects.create(
                    recipient=s,
                    title=f"New Assignment: {assign.title}",
                    message=f"New assignment posted in {assign.subject.name}. Due on {assign.due_date.strftime('%b %d, %Y')}.",
                    notification_type="Assignment",
                    link="/assignments/"
                )

            messages.success(request, f"Assignment '{assign.title}' created and students notified!")
            return redirect('assignment_list')
    else:
        form = AssignmentForm()

    return render(request, 'academic/assignment_create.html', {'form': form})


@login_required
def assignment_detail(request, pk):
    assignment = get_object_or_404(Assignment, pk=pk)
    profile = getattr(request.user, 'profile', None)

    submission = None
    all_submissions = None

    if profile.role == 'student':
        submission = AssignmentSubmission.objects.filter(assignment=assignment, student=request.user).first()
        if request.method == 'POST':
            form = AssignmentSubmissionForm(request.POST, request.FILES, instance=submission)
            if form.is_valid():
                sub = form.save(commit=False)
                sub.assignment = assignment
                sub.student = request.user
                sub.save()
                messages.success(request, "Assignment submitted successfully!")
                return redirect('assignment_detail', pk=pk)
        else:
            form = AssignmentSubmissionForm(instance=submission)
    else:
        form = None
        all_submissions = AssignmentSubmission.objects.filter(assignment=assignment).select_related('student__profile')
        
        # Grading action
        if request.method == 'POST' and 'grade_submission_id' in request.POST:
            sub_id = request.POST.get('grade_submission_id')
            marks = request.POST.get('marks')
            feedback = request.POST.get('feedback', '')
            sub = get_object_or_404(AssignmentSubmission, id=sub_id, assignment=assignment)
            sub.marks_obtained = float(marks) if marks else None
            sub.feedback = feedback
            sub.save()
            
            Notification.objects.create(
                recipient=sub.student,
                title=f"Assignment Graded: {assignment.title}",
                message=f"You received {sub.marks_obtained}/{assignment.max_marks} marks.",
                notification_type="Assignment"
            )
            messages.success(request, f"Grade updated for {sub.student.username}.")
            return redirect('assignment_detail', pk=pk)

    return render(request, 'academic/assignment_detail.html', {
        'assignment': assignment,
        'submission': submission,
        'all_submissions': all_submissions,
        'form': form,
    })


@login_required
def notice_list(request):
    profile = getattr(request.user, 'profile', None)
    if profile.role == 'student':
        notices = Notice.objects.filter(Q(target_role='All') | Q(target_role='Student'))
    elif profile.role == 'teacher':
        notices = Notice.objects.filter(Q(target_role='All') | Q(target_role='Teacher'))
    else:
        notices = Notice.objects.all()

    return render(request, 'academic/notices.html', {'notices': notices})


@login_required
def notice_create(request):
    profile = getattr(request.user, 'profile', None)
    if not profile or profile.role not in ['teacher', 'admin']:
        messages.error(request, "Permission denied.")
        return redirect('dashboard')

    if request.method == 'POST':
        form = NoticeForm(request.POST, request.FILES)
        if form.is_valid():
            notice = form.save(commit=False)
            notice.posted_by = request.user
            notice.save()

            # Broadcast notifications
            target_users = User.objects.all()
            if notice.target_role == 'Student':
                target_users = target_users.filter(profile__role='student')
            elif notice.target_role == 'Teacher':
                target_users = target_users.filter(profile__role='teacher')

            for u in target_users:
                Notification.objects.create(
                    recipient=u,
                    title=f"New Notice: {notice.title}",
                    message=notice.content[:150] + ("..." if len(notice.content) > 150 else ""),
                    notification_type="Notice",
                    link="/notices/"
                )

            messages.success(request, "Notice posted and notifications broadcasted!")
            return redirect('notice_list')
    else:
        form = NoticeForm()

    return render(request, 'academic/notice_create.html', {'form': form})


@login_required
def holiday_list(request):
    holidays = Holiday.objects.all().order_by('date')
    profile = getattr(request.user, 'profile', None)
    can_manage = profile and (profile.role in ['teacher', 'admin'] or request.user.is_superuser)

    if request.method == 'POST' and can_manage:
        form = HolidayForm(request.POST)
        if form.is_valid():
            hol = form.save(commit=False)
            hol.created_by = request.user
            hol.save()

            # Broadcast notification
            for u in User.objects.all():
                Notification.objects.create(
                    recipient=u,
                    title=f"Holiday Announced: {hol.name}",
                    message=f"{hol.name} on {hol.date.strftime('%b %d, %Y')} ({hol.get_holiday_type_display()})",
                    notification_type="Holiday",
                    link="/holidays/"
                )
            messages.success(request, f"Holiday '{hol.name}' added and announced!")
            return redirect('holiday_list')
    else:
        form = HolidayForm()

    return render(request, 'academic/holidays.html', {'holidays': holidays, 'form': form, 'can_manage': can_manage})


@login_required
def room_list(request):
    rooms = Room.objects.all().order_by('room_number')
    bookings = RoomBooking.objects.filter(date__gte=timezone.now().date()).order_by('date', 'start_time')
    profile = getattr(request.user, 'profile', None)

    if request.method == 'POST':
        form = RoomBookingForm(request.POST)
        if form.is_valid():
            booking = form.save(commit=False)
            booking.booked_by = request.user
            if profile and profile.role in ['teacher', 'admin']:
                booking.status = 'Approved'
            booking.save()
            messages.success(request, f"Room booking request submitted for {booking.room.room_number}!")
            return redirect('room_list')
    else:
        form = RoomBookingForm()

    return render(request, 'academic/rooms.html', {
        'rooms': rooms,
        'bookings': bookings,
        'form': form,
    })


@login_required
def analytics_view(request):
    profile = getattr(request.user, 'profile', None)
    if profile.role == 'student':
        messages.error(request, "Analytics is restricted to Faculty and Administrators.")
        return redirect('dashboard')

    total_classes = ClassSchedule.objects.filter(is_active=True).count()
    total_students = Profile.objects.filter(role='student').count()
    attendance_records = Attendance.objects.all()
    overall_attendance = 0
    if attendance_records.exists():
        overall_attendance = round(attendance_records.filter(status='Present').count() / attendance_records.count() * 100, 1)

    # Department distribution
    dept_distribution = Profile.objects.filter(role='student').values('department').annotate(count=Count('id'))
    
    # Subject workload
    subject_workload = Subject.objects.annotate(classes_count=Count('schedules')).order_by('-classes_count')[:8]

    # Room utilization
    room_utilization = Room.objects.annotate(classes_count=Count('room_schedules')).order_by('-classes_count')

    context = {
        'total_classes': total_classes,
        'total_students': total_students,
        'overall_attendance': overall_attendance,
        'dept_distribution': dept_distribution,
        'subject_workload': subject_workload,
        'room_utilization': room_utilization,
    }
    return render(request, 'academic/analytics.html', context)


@login_required
def ai_assistant_view(request):
    profile = getattr(request.user, 'profile', None)
    today_name = timezone.now().strftime('%A')
    user_query = request.GET.get('query', '').strip()
    ai_response = None

    if user_query:
        q = user_query.lower()

        if 'class' in q or 'today' in q or 'schedule' in q or 'timetable' in q or 'lecture' in q:
            if profile.role == 'student':
                classes = ClassSchedule.objects.filter(
                    semester=profile.semester,
                    section=profile.section,
                    day=today_name,
                    is_active=True
                ).select_related('subject', 'room')
                if classes.exists():
                    class_list = ", ".join([f"{c.subject.name} ({c.start_time.strftime('%I:%M %p')} in {c.room.room_number})" for c in classes])
                    ai_response = f"Today is {today_name}. You have {classes.count()} scheduled classes: {class_list}."
                else:
                    ai_response = f"Great news! You have no classes scheduled for today ({today_name})."
            else:
                classes = ClassSchedule.objects.filter(faculty=request.user, day=today_name, is_active=True).select_related('subject', 'room')
                if classes.exists():
                    class_list = ", ".join([f"{c.subject.name} (Sec {c.section}) at {c.start_time.strftime('%I:%M %p')} in {c.room.room_number}" for c in classes])
                    ai_response = f"Prof. {request.user.first_name or request.user.username}, you have {classes.count()} lectures today ({today_name}): {class_list}."
                else:
                    ai_response = f"You have no lectures scheduled for today ({today_name})."

        elif 'attendance' in q:
            if profile.role == 'student':
                atts = Attendance.objects.filter(student=request.user)
                tot = atts.count()
                pres = atts.filter(status='Present').count()
                pct = round(pres / tot * 100, 1) if tot > 0 else 100.0
                ai_response = f"Your overall attendance is {pct}% across {tot} recorded lectures ({pres} Present). Minimum requirement is 75%."
            else:
                ai_response = "As faculty, you can record student attendance from the Teacher Dashboard or Attendance Hub."

        elif 'holiday' in q or 'break' in q or 'vacation' in q:
            next_hol = Holiday.objects.filter(date__gte=timezone.now().date()).first()
            if next_hol:
                ai_response = f"The next upcoming holiday is **{next_hol.name}** on {next_hol.date.strftime('%A, %B %d, %Y')} ({next_hol.get_holiday_type_display()})."
            else:
                ai_response = "No upcoming holidays currently registered in the academic calendar."

        elif 'assignment' in q or 'homework' in q or 'deadline' in q:
            if profile.role == 'student':
                pending = Assignment.objects.filter(
                    semester=profile.semester,
                    section=profile.section,
                    due_date__gte=timezone.now()
                )
                if pending.exists():
                    items = ", ".join([f"'{a.title}' for {a.subject.name} (Due: {a.due_date.strftime('%b %d')})" for a in pending[:3]])
                    ai_response = f"You have {pending.count()} upcoming assignment(s): {items}."
                else:
                    ai_response = "You are all caught up! No pending assignments with upcoming deadlines."
            else:
                my_assigns = Assignment.objects.filter(faculty=request.user).count()
                ai_response = f"You have created {my_assigns} active assignment(s) for your classes."

        elif 'notice' in q or 'announcement' in q:
            recent_notice = Notice.objects.all().first()
            if recent_notice:
                ai_response = f"Latest Announcement: **{recent_notice.title}** posted on {recent_notice.created_at.strftime('%b %d')} - \"{recent_notice.content[:120]}...\""
            else:
                ai_response = "No active notices posted on the board."

        elif 'room' in q or 'lab' in q:
            labs = Room.objects.filter(room_type='Lab', is_active=True).count()
            classrooms = Room.objects.filter(room_type='Classroom', is_active=True).count()
            ai_response = f"CampusSphere has {classrooms} smart classrooms and {labs} high-performance computing/AI labs equipped with projectors and Wi-Fi."

        else:
            ai_response = (
                f"Hello {request.user.first_name or request.user.username}! I am CampusSphere AI. "
                f"I can help you check your timetable, track attendance, alert you about assignment deadlines, "
                f"verify room availability, or list upcoming holidays. Try asking: 'What classes do I have today?', "
                f"'What is my attendance?', or 'When is the next holiday?'"
            )

    return render(request, 'academic/ai_assistant.html', {
        'user_query': user_query,
        'ai_response': ai_response,
    })


@login_required
def mark_notification_read(request, pk):
    notif = get_object_or_404(Notification, id=pk, recipient=request.user)
    notif.is_read = True
    notif.save()
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({'status': 'ok'})
    return redirect(notif.link if notif.link else 'dashboard')
