from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('employee', 'Employee'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
class Department(models.Model):
    name = models.CharField(max_length=100)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    manager_id = models.IntegerField(null=True, blank=True)   # ✅ plain integer field
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True)


class ManagerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    department = department = models.ForeignKey(
    Department,
    on_delete=models.CASCADE,
    default=1   # 👈 assumes department with ID=1 exists
)

class LeaveRequest(models.Model):
    employee_id = models.IntegerField(max_length=100, default=0)
    manager_id = models.IntegerField(max_length=100, default=0)
    reason = models.TextField()
    start_date = models.DateField(default=None, null=True, blank=True)
    end_date = models.DateField(default=None, null=True, blank=True)
    half_day = models.BooleanField(default=False)
    status = models.CharField(max_length=20, default="Pending")

class Complaint(models.Model):
    employee_id = models.IntegerField(max_length=100, default=0)
    manager_id = models.IntegerField(max_length=100, default=0)
    title = models.CharField(max_length=200, default="No Title")  # ✅ default
    details = models.TextField(max_length=100, default="Details not provided")  # ✅ default
    category = models.CharField(max_length=100, default="General")  # ✅ default
    status = models.CharField(max_length=20, default="Pending")
