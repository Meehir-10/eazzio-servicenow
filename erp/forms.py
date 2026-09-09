from django import forms
from django.contrib.auth.models import User
from .models import (
    Profile, ClassSchedule, ScheduleChange, Holiday,
    Attendance, Assignment, AssignmentSubmission, Notice, RoomBooking, Room, Subject
)

class RegistrationForm(forms.ModelForm):
    first_name = forms.CharField(max_length=50, required=True, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'First Name'}))
    last_name = forms.CharField(max_length=50, required=True, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Last Name'}))
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'name@college.edu'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Enter password'}), required=True)
    confirm_password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Confirm password'}), required=True)
    
    role = forms.ChoiceField(choices=Profile.ROLE_CHOICES, widget=forms.Select(attrs={'class': 'form-select'}))
    id_number = forms.CharField(max_length=50, required=False, widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Roll No / Faculty ID'}))
    department = forms.CharField(max_length=100, initial='Computer Science & Engineering', widget=forms.TextInput(attrs={'class': 'form-control'}))
    semester = forms.IntegerField(initial=1, required=False, widget=forms.NumberInput(attrs={'class': 'form-control'}))
    section = forms.CharField(max_length=10, initial='A', required=False, widget=forms.TextInput(attrs={'class': 'form-control'}))

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Choose username'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        p1 = cleaned_data.get('password')
        p2 = cleaned_data.get('confirm_password')
        if p1 and p2 and p1 != p2:
            self.add_error('confirm_password', 'Passwords do not match.')
        return cleaned_data


class LoginForm(forms.Form):
    username = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Username'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Password'}))


class ClassScheduleForm(forms.ModelForm):
    class Meta:
        model = ClassSchedule
        fields = ['subject', 'faculty', 'room', 'day', 'start_time', 'end_time', 'semester', 'section']
        widgets = {
            'subject': forms.Select(attrs={'class': 'form-select'}),
            'faculty': forms.Select(attrs={'class': 'form-select'}),
            'room': forms.Select(attrs={'class': 'form-select'}),
            'day': forms.Select(attrs={'class': 'form-select'}),
            'start_time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'end_time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'semester': forms.NumberInput(attrs={'class': 'form-control'}),
            'section': forms.TextInput(attrs={'class': 'form-control'}),
        }


class ScheduleChangeForm(forms.ModelForm):
    class Meta:
        model = ScheduleChange
        fields = ['schedule', 'date', 'new_room', 'new_faculty', 'reason', 'is_cancelled']
        widgets = {
            'schedule': forms.Select(attrs={'class': 'form-select'}),
            'date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'new_room': forms.Select(attrs={'class': 'form-select'}),
            'new_faculty': forms.Select(attrs={'class': 'form-select'}),
            'reason': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Reason for schedule modification or cancellation'}),
            'is_cancelled': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }


class HolidayForm(forms.ModelForm):
    class Meta:
        model = Holiday
        fields = ['name', 'date', 'holiday_type', 'description']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., Diwali / Semester Break'}),
            'date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'holiday_type': forms.Select(attrs={'class': 'form-select'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Additional information'}),
        }


class AssignmentForm(forms.ModelForm):
    class Meta:
        model = Assignment
        fields = ['title', 'description', 'subject', 'semester', 'section', 'due_date', 'max_marks', 'attachment']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Assignment Title'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'subject': forms.Select(attrs={'class': 'form-select'}),
            'semester': forms.NumberInput(attrs={'class': 'form-control'}),
            'section': forms.TextInput(attrs={'class': 'form-control'}),
            'due_date': forms.DateTimeInput(attrs={'class': 'form-control', 'type': 'datetime-local'}),
            'max_marks': forms.NumberInput(attrs={'class': 'form-control'}),
            'attachment': forms.FileInput(attrs={'class': 'form-control'}),
        }


class AssignmentSubmissionForm(forms.ModelForm):
    class Meta:
        model = AssignmentSubmission
        fields = ['submission_text', 'submission_file']
        widgets = {
            'submission_text': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Enter your solution, project notes, or link here...'}),
            'submission_file': forms.FileInput(attrs={'class': 'form-control'}),
        }


class NoticeForm(forms.ModelForm):
    class Meta:
        model = Notice
        fields = ['title', 'content', 'target_role', 'priority', 'attachment']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Notice Heading'}),
            'content': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Notice details...'}),
            'target_role': forms.Select(attrs={'class': 'form-select'}),
            'priority': forms.Select(attrs={'class': 'form-select'}),
            'attachment': forms.FileInput(attrs={'class': 'form-control'}),
        }


class RoomBookingForm(forms.ModelForm):
    class Meta:
        model = RoomBooking
        fields = ['room', 'purpose', 'date', 'start_time', 'end_time']
        widgets = {
            'room': forms.Select(attrs={'class': 'form-select'}),
            'purpose': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. AI Lab Exam / Seminar'}),
            'date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'start_time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'end_time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
        }


class TimetableGeneratorForm(forms.Form):
    prompt = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'rows': 3,
            'placeholder': 'e.g. "Create a 5-day timetable for Semester 4 Section A with 5 subjects including Lab sessions between 9 AM and 4 PM."'
        }),
        help_text="Optional: Enter a natural language request or customize parameters below."
    )
    semester = forms.IntegerField(initial=4, widget=forms.NumberInput(attrs={'class': 'form-control'}))
    section = forms.CharField(initial='A', max_length=5, widget=forms.TextInput(attrs={'class': 'form-control'}))
    start_hour = forms.IntegerField(initial=9, min_value=8, max_value=12, widget=forms.NumberInput(attrs={'class': 'form-control'}))
    slots_per_day = forms.IntegerField(initial=6, min_value=3, max_value=8, widget=forms.NumberInput(attrs={'class': 'form-control'}))
    working_days = forms.MultipleChoiceField(
        choices=ClassSchedule.DAY_CHOICES,
        initial=['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        widget=forms.CheckboxSelectMultiple(attrs={'class': 'form-check-input'})
    )
    include_lunch_break = forms.BooleanField(initial=True, required=False, widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}))
