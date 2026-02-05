import os
import django

# 1. Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pathhive_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from paths.models import LearningPath, PathStep, Resource, Tag

User = get_user_model()

def run_seed():
    # Find an admin or the first user to be the "Author"
    creator = User.objects.filter(is_admin=True).first() or User.objects.first()

    if not creator:
        print("❌ Error: No users found. Please create a user first!")
        return

    print(f"👤 Creating friendly community paths for: {creator.username}")

    # --- DATA DEFINITION ---
    paths_data = [
        {
            "title": "My Guide to Full Stack: Django & React 🚀",
            "description": "Hey everyone! 👋 A lot of you asked how I connect Django to React. It can be super confusing at first, so I broke it down into the exact steps I took. We'll start simple, handle those annoying CORS errors together, and end with a real app. You got this!",
            "difficulty": "Intermediate",
            "tags": ["django", "react", "fullstack", "javascript", "web-dev"],
            "steps": [
                {
                    "title": "Step 0: The Big Picture",
                    "description": "Before we write code, let's understand how these two actually talk to each other. It's not magic—it's just JSON!",
                    "position": 1,
                    "resources": [
                        {"title": "Visualizing the Architecture", "url": "https://www.youtube.com/watch?v=pU9Q6oiQNd0", "resource_type": "video"},
                        {"title": "Rest API Concepts (Quick Read)", "url": "https://aws.amazon.com/what-is/restful-api/", "resource_type": "article"}
                    ]
                },
                {
                    "title": "Setting up the Django Backend",
                    "description": "We're going to use Django Rest Framework (DRF). I prefer keeping my API logic separate from the main project settings. Here is the cleanest way to set it up.",
                    "position": 2,
                    "resources": [
                        {"title": "Official DRF Quickstart", "url": "https://www.django-rest-framework.org/tutorial/quickstart/", "resource_type": "doc"},
                        {"title": "Django Project Structure Best Practices", "url": "https://builtwithdjango.com/blog/django-structure", "resource_type": "article"},
                        {"title": "Setting up Serializers (Video)", "url": "https://www.youtube.com/watch?v=YwTX-F2B9k8", "resource_type": "video"}
                    ]
                },
                {
                    "title": "Frontend Fun with Vite & React",
                    "description": "Say goodbye to 'create-react-app'! We are using Vite because it is blazing fast. I'll show you how to scaffold the project in seconds.",
                    "position": 3,
                    "resources": [
                        {"title": "Why Vite is better?", "url": "https://vitejs.dev/guide/why.html", "resource_type": "doc"},
                        {"title": "React for Python Developers", "url": "https://realpython.com/python-web-applications-with-flask-part-i/", "resource_type": "article"}
                    ]
                },
                {
                    "title": "The Bridge: Axios & CORS",
                    "description": "This is where most people get stuck (I know I did 😅). We need to tell Django it's okay to talk to React. We'll install `django-cors-headers` and set up Axios.",
                    "position": 4,
                    "resources": [
                        {"title": "Fixing CORS Errors Once and For All", "url": "https://pypi.org/project/django-cors-headers/", "resource_type": "doc"},
                        {"title": "Axios Cheat Sheet", "url": "https://kapeli.com/cheat_sheets/Axios.docset/Contents/Resources/Documents/index", "resource_type": "article"}
                    ]
                },
                {
                    "title": "Authentication (The Hard Part)",
                    "description": "Let's secure our app. We'll use JWTs (JSON Web Tokens) so users can stay logged in. It's safer and scales better.",
                    "position": 5,
                    "resources": [
                        {"title": "Simple JWT Documentation", "url": "https://django-rest-framework-simplejwt.readthedocs.io/en/latest/", "resource_type": "doc"},
                        {"title": "React Auth Context Pattern", "url": "https://kentcdodds.com/blog/authentication-in-react-applications", "resource_type": "article"}
                    ]
                }
            ]
        },
        {
            "title": "Python for Data: Zero to Hero 🐍",
            "description": "Ideally for beginners! I started my data journey here. No scary math at first—just learning how to grab data, clean it up (data is always messy!), and make some cool charts. Grab a coffee and let's analyze.",
            "difficulty": "Beginner",
            "tags": ["python", "data-science", "pandas", "analysis"],
            "steps": [
                {
                    "title": "Python Basics Refresher",
                    "description": "You need to know Lists, Dictionaries, and Loops really well. Don't worry about Classes yet. Here are the best resources I found.",
                    "position": 1,
                    "resources": [
                        {"title": "Python for Data Science (Free Course)", "url": "https://www.kaggle.com/learn/python", "resource_type": "article"},
                        {"title": "List Comprehensions Explained", "url": "https://realpython.com/list-comprehension-python/", "resource_type": "article"}
                    ]
                },
                {
                    "title": "Pandas: Your New Best Friend",
                    "description": "Pandas is essentially 'Excel on Steroids'. We'll learn how to load messy CSV files and fix missing data.",
                    "position": 2,
                    "resources": [
                        {"title": "Pandas in 10 Minutes", "url": "https://pandas.pydata.org/docs/user_guide/10min.html", "resource_type": "doc"},
                        {"title": "Data Cleaning Walkthrough", "url": "https://www.youtube.com/watch?v=bDhvCp3_lYw", "resource_type": "video"},
                        {"title": "Cheat Sheet", "url": "https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf", "resource_type": "doc"}
                    ]
                },
                {
                    "title": "Visualizing Your Findings",
                    "description": "Numbers are boring; charts are cool. We'll use Matplotlib and Seaborn to make our data tell a story.",
                    "position": 3,
                    "resources": [
                        {"title": "Seaborn Example Gallery", "url": "https://seaborn.pydata.org/examples/index.html", "resource_type": "doc"},
                        {"title": "Matplotlib for Beginners", "url": "https://www.youtube.com/watch?v=3Xc3CA655Y4", "resource_type": "video"}
                    ]
                },
                {
                    "title": "Your First Project: Titanic Dataset",
                    "description": "The classic rite of passage! Let's predict who survived the Titanic. This brings everything together.",
                    "position": 4,
                    "resources": [
                        {"title": "Titanic Tutorial", "url": "https://www.kaggle.com/c/titanic/overview/tutorials", "resource_type": "article"}
                    ]
                }
            ]
        },
        {
            "title": "Stop 'It Works on My Machine' with Docker 🐳",
            "description": "I used to spend hours fixing environment bugs until I learned Docker. It's a game changer for your career. I'll explain it simply without the confusing jargon.",
            "difficulty": "Advanced",
            "tags": ["devops", "docker", "deployment", "containers"],
            "steps": [
                {
                    "title": "Why do we need this?",
                    "description": "Virtual Machines vs Containers. It sounds boring, but understanding this one concept makes everything click.",
                    "position": 1,
                    "resources": [
                        {"title": "Docker in 100 Seconds", "url": "https://www.youtube.com/watch?v=Gjnup-PuquQ", "resource_type": "video"},
                        {"title": "The Concept of Containers", "url": "https://www.docker.com/resources/what-container/", "resource_type": "doc"}
                    ]
                },
                {
                    "title": "Writing your first Dockerfile",
                    "description": "It's just a recipe card for your computer. We'll write one for a simple Python script.",
                    "position": 2,
                    "resources": [
                        {"title": "Dockerfile Best Practices", "url": "https://docs.docker.com/develop/develop-images/dockerfile_best-practices/", "resource_type": "doc"},
                        {"title": "Interactive Playground", "url": "https://labs.play-with-docker.com/", "resource_type": "article"}
                    ]
                },
                {
                    "title": "Docker Compose Magic",
                    "description": "Running one container is easy. Running a Database + Backend + Frontend together? That's where Docker Compose shines.",
                    "position": 3,
                    "resources": [
                        {"title": "Compose file reference", "url": "https://docs.docker.com/compose/compose-file/", "resource_type": "doc"},
                        {"title": "Full Stack Docker Tutorial", "url": "https://www.youtube.com/watch?v=0B2raVCDEjvY", "resource_type": "video"}
                    ]
                }
            ]
        }
    ]

    # --- EXECUTION LOOP ---
    created_count = 0
    for p_data in paths_data:
        # 1. Create Path
        path = LearningPath.objects.create(
            title=p_data['title'],
            description=p_data['description'],
            difficulty=p_data['difficulty'],
            creator=creator,
            is_published=True
        )

        # 2. Add Tags
        for tag_name in p_data.get('tags', []):
            tag_obj, _ = Tag.objects.get_or_create(name=tag_name)
            path.tags.add(tag_obj)
        
        # 3. Add Steps
        for s_data in p_data['steps']:
            step = PathStep.objects.create(
                path=path,
                title=s_data['title'],
                description=s_data['description'],
                position=s_data['position']
            )
            
            # 4. Add Resources
            for r_data in s_data.get('resources', []):
                Resource.objects.create(
                    step=step,
                    title=r_data['title'],
                    url=r_data['url'],
                    resource_type=r_data['resource_type']
                )
        
        created_count += 1
        print(f"✅ Created Path: {path.title}")

    print(f"\n🎉 Success! {created_count} Community-style Learning Paths created.")

if __name__ == "__main__":
    run_seed()