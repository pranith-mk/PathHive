import os
import django
import random

# 1. Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pathhive_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from paths.models import LearningPath, Enrollment, Review, Comment

User = get_user_model()

def seed_community():
    print("🌱 Seeding Community Data (Users, Reviews, Comments)...")

    # --- 1. Create Fake Students ---
    students = []
    student_names = [
        ("alex_dev", "Alex Chen"),
        ("sarah_codes", "Sarah Miller"),
        ("jordan_tech", "Jordan Lee"),
        ("priya_learning", "Priya Patel"),
        ("david_builder", "David Kim")
    ]

    for username, fullname in student_names:
        # Get or Create the user
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': f'{username}@example.com',
                'full_name': fullname,
                'bio': "I love learning new tech stacks! 🚀",
                'role': 'user' # Assuming you have a role field
            }
        )
        if created:
            user.set_password('password123') # Default password
            user.save()
            print(f"   👤 Created Student: {username}")
        students.append(user)

    # --- 2. Interact with Paths ---
    paths = LearningPath.objects.all()

    if not paths.exists():
        print("❌ No paths found! Run 'seed_paths.py' first.")
        return

    for path in paths:
        print(f"\n⚡ Generating activity for path: {path.title}")
        
        # Pick 3 random students to interact with this path
        active_students = random.sample(students, 3)

        for student in active_students:
            # A. ENROLL
            Enrollment.objects.get_or_create(student=student, learning_path=path)
            
            # B. REVIEW (Give it 4 or 5 stars)
            rating = random.choice([4, 5])
            review_texts = [
                "This was exactly what I needed. Thanks!",
                "Super clear and friendly. Loved the tone.",
                "A bit fast in step 2, but otherwise perfect.",
                "Best guide on this topic I've found so far.",
                "The resources provided were a goldmine. 💎"
            ]
            
            # Use update_or_create to avoid duplicate key errors if run twice
            Review.objects.update_or_create(
                path=path,
                user=student,
                defaults={
                    'rating': rating,
                    'comment': random.choice(review_texts)
                }
            )

            # C. COMMENT (Ask a question or give praise)
            comment_texts = [
                "Hey, does this work on Windows too?",
                "I was stuck on step 3, but the video helped. Thanks!",
                "Can you add more about deployment?",
                "Woah, I didn't know you could do that! 🤯",
                "Is there a part 2 coming soon?"
            ]
            
            Comment.objects.create(
                user=student,
                learning_path=path,
                text=random.choice(comment_texts)
            )

    print("\n🎉 Success! The community is now alive.")

if __name__ == "__main__":
    seed_community()