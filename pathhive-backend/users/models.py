from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
import uuid

# This handles creating users (since we use email instead of username)
class UserAccountManager(BaseUserManager):
    def create_user(self, email, username, full_name, password=None):
        if not email:
            raise ValueError('Users must have an email address')
        user = self.model(
            email=self.normalize_email(email),
            username=username,
            full_name=full_name,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, full_name, password=None):
        user = self.create_user(email, username, full_name, password)
        user.is_admin = True
        user.role = 'admin'  # Matches your constraint: CHECK(role IN ('user', 'admin'))
        user.save(using=self._db)
        return user

class UserAccount(AbstractBaseUser):
    ROLE_CHOICES = [('user', 'User'), ('admin', 'Admin')]

    # Matching your schema: id UUID Primary Key
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    bio = models.TextField(null=True, blank=True)
    avatar = models.URLField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False) # Required for Django admin access
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserAccountManager()

    USERNAME_FIELD = 'email'  # We log in with Email
    REQUIRED_FIELDS = ['username', 'full_name']

    def __str__(self):
        return self.username

    # Required helper functions for Django Admin
    def has_perm(self, perm, obj=None): return True
    def has_module_perms(self, app_label): return True
    @property
    def is_staff(self): return self.is_admin