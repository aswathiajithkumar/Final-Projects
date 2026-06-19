from django.urls import path
from .views import leaves, simple_login, managers, departments, leave_requests, complaints, employees, update_complaint, update_leave
from .views import user_details
urlpatterns = [
    path("login/", simple_login),
    path("managers/", managers),
    path("departments/", departments),
    path("leave-requests/", leave_requests),
    path("complaints/", complaints),
    path("employees/", employees),
      path("user/<str:username>/", user_details),
          path("complaints/", complaints),
           path("leaves/", leaves),
             path("leaves/<int:pk>/", update_leave),          # ✅ PATCH endpoint
    path("complaints/<int:pk>/", update_complaint),
]
