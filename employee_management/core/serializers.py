from rest_framework import serializers
from .models import ManagerProfile, User, Department, Employee, LeaveRequest, Complaint

class UserSerializer(serializers.ModelSerializer):
    department = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "email", "role", "department"]

    def get_department(self, obj):
        try:
            return obj.employee.department.name
        except:
            return None

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name", "created_by"]

class EmployeeSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
   

    class Meta:
        model = Employee
        fields = ["id", "first_name", "email", "username", "manager_id"]

class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = "__all__"

class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = "__all__"
class ManagerSerializer(serializers.ModelSerializer):
    department = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "first_name", "email", "role", "department"]

    def get_department(self, obj):
        profile = ManagerProfile.objects.filter(user=obj).first()
        return profile.department.name if profile and profile.department else None
