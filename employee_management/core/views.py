from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import User, Department, ManagerProfile
from .serializers import ManagerSerializer, UserSerializer, DepartmentSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User, Department, Employee, LeaveRequest, Complaint
from .serializers import UserSerializer, DepartmentSerializer, EmployeeSerializer, LeaveRequestSerializer, ComplaintSerializer



@api_view(['GET', 'POST'])
def leave_requests(request):
    if request.method == 'GET':
        leaves = LeaveRequest.objects.all()
        return Response(LeaveRequestSerializer(leaves, many=True).data)
    elif request.method == 'POST':
        employee_id = request.data.get("employee")
        reason = request.data.get("reason")
        employee = Employee.objects.get(id=employee_id)
        leave = LeaveRequest.objects.create(employee=employee, reason=reason)
        return Response(LeaveRequestSerializer(leave).data)

@api_view(['POST'])
def simple_login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    role = request.data.get("role")

    user = authenticate(username=username, password=password)
    if user and user.role == role:
        return Response({"username": user.username, "role": user.role,"activeperson": user.id})
    return Response({"error": "Invalid credentials"}, status=400)
@api_view(['GET', 'POST'])
def managers(request):
    if request.method == 'GET':
        managers = User.objects.filter(role="manager")
        return Response(ManagerSerializer(managers, many=True).data)
    # POST logic stays the same


    elif request.method == 'POST':
        name = request.data.get("name")
        email = request.data.get("email")
        dept_name = request.data.get("department")
        username = request.data.get("username")
        password = request.data.get("password")

        # Validate required fields
        if not all([name, email, dept_name, username, password]):
            return Response({"error": "All fields (name, username, password, email, department) are required"}, status=400)

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=400)

        # Assign admin as created_by
        admin_user = User.objects.filter(role="admin").first()
        dept, _ = Department.objects.get_or_create(
            name=dept_name,
            defaults={"created_by": admin_user}
        )

        manager = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role="manager",
            first_name=name
        )

        ManagerProfile.objects.create(user=manager, department=dept)

        return Response(UserSerializer(manager).data)

@api_view(['GET', 'POST'])
def departments(request):
    if request.method == 'GET': 
        depts = Department.objects.all()
        return Response(DepartmentSerializer(depts, many=True).data)

    elif request.method == 'POST':
        name = request.data.get("name")
        created_by_id = request.data.get("created_by")  # ✅ treat as ID

        created_by_user = None
        if created_by_id:
            try:
                created_by_user = User.objects.get(id=created_by_id)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=400)

        dept = Department.objects.create(name=name, created_by=created_by_user)
        return Response(DepartmentSerializer(dept).data, status=201)

@api_view(['GET', 'POST'])
def employees(request):
    if request.method == 'GET':
        employees = Employee.objects.all()
        return Response(EmployeeSerializer(employees, many=True).data)

    elif request.method == 'POST':
        name = request.data.get("name")
        email = request.data.get("email")
        username = request.data.get("username")
        password = request.data.get("password")
        manager_id = request.data.get("manager_id")

        if not all([name, email, username, password, manager_id]):
            return Response({"error": "All fields required"}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=400)

        employee_user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role="employee",
            first_name=name
        )

        # ✅ Save manager_id directly without checking User existence
        employee = Employee.objects.create(user=employee_user, manager_id=manager_id)

        return Response(EmployeeSerializer(employee).data)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Complaint
from .serializers import ComplaintSerializer

@api_view(['GET', 'POST'])
def complaints(request):
    if request.method == 'GET':
        complaints = Complaint.objects.all()
        return Response(ComplaintSerializer(complaints, many=True).data)

    elif request.method == 'POST':
        serializer = ComplaintSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()   # ✅ no Employee lookup
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User, Employee
from .serializers import UserSerializer, EmployeeSerializer

@api_view(['GET'])
def user_details(request, username):
    try:
        user = User.objects.get(username=username)
        # If this user is an employee, fetch their manager_id too
        employee = Employee.objects.filter(user=user).first()
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "role": user.role,
            "manager_id": employee.manager_id if employee else None,
        }
        return Response(data)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
# ✅ Leave Requests API
@api_view(['GET', 'POST'])
def leaves(request):
    if request.method == 'GET':
        leaves = LeaveRequest.objects.all()
        return Response(LeaveRequestSerializer(leaves, many=True).data)

    elif request.method == 'POST':
        serializer = LeaveRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)  
    from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import LeaveRequest, Complaint
from .serializers import LeaveRequestSerializer, ComplaintSerializer

# ✅ Update Leave Status
@api_view(['PATCH'])
def update_leave(request, pk):
    try:
        leave = LeaveRequest.objects.get(pk=pk)
    except LeaveRequest.DoesNotExist:
        return Response({"error": "Leave not found"}, status=404)

    serializer = LeaveRequestSerializer(leave, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


# ✅ Update Complaint Status
@api_view(['PATCH'])
def update_complaint(request, pk):
    try:
        complaint = Complaint.objects.get(pk=pk)
    except Complaint.DoesNotExist:
        return Response({"error": "Complaint not found"}, status=404)

    serializer = ComplaintSerializer(complaint, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)
