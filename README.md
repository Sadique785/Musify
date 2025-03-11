Musify

Overview

Musify is a web application designed to bring music lovers together. It allows users to upload, edit, and share audio content, interact via real-time chat, and stream music seamlessly. Built with a microservices architecture, Musify ensures scalability and high performance.

Live Site: Musify

Features

User Authentication: JWT-based authentication system.

Audio Management: Upload, edit, and process audio files with WaveSurfer.js and FFmpeg.

Real-time Chat: Implemented using WebSockets and Django Channels.

Local Storage for Audio Editing: Uses IndexedDB to prevent data loss before saving.

Microservices Architecture: Auth, Content, Connection, and Gateway services communicate via Kafka message brokers.

Tech Stack

Backend:

Django, Django REST Framework

PostgreSQL (AWS RDS)

Redis (for WebSockets and caching)

Kafka & Zookeeper (for event-driven communication)

Django Channels (WebSockets implementation)

Frontend:

React (Vite framework)

Tailwind CSS

WaveSurfer.js (for audio visualization and editing)

Deployment:

Backend: Google Cloud GKE (Kubernetes)

Frontend: Deployed via Kubernetes

Installation & Setup

1️⃣ Running Musify Locally with Kubernetes (Recommended)

To run Musify locally using Minikube or any Kubernetes setup, follow these steps:

Start Minikube

minikube start

Apply Kubernetes Manifests

Navigate to the infra/k8s/ directory and apply each YAML file:

kubectl apply -f namespace.yaml  # Create namespace
kubectl apply -f zookeeper.yaml  # Start Zookeeper
kubectl apply -f kafka.yaml      # Start Kafka
kubectl apply -f redis.yaml      # Start Redis
kubectl apply -f auth-service.yaml  # Start Auth service
kubectl apply -f content-service.yaml  # Start Content service
kubectl apply -f connection-service.yaml  # Start Connection service
kubectl apply -f gateway-service.yaml  # Start Gateway service
kubectl apply -f frontend-service.yaml  # Start Frontend service
kubectl apply -f ingress.yaml  # Configure Ingress

Check Running Pods

kubectl get pods -n musify

Ensure Redis is Available

Redis should be running on localhost:6379. If it's not available, check the Kubernetes pod logs.

Update Manifest Files (Optional)

Update infra/k8s/*.yaml files to use your own RDS/PostgreSQL instance before applying them.

2️⃣ Running Musify Locally Without Kubernetes (For Development)

For debugging and development, you can manually run each service separately:

1. Setup Each Service

Create a virtual environment for each service (except frontend):

cd backend/Auth   # Navigate to Auth service
python -m venv venv  # Create virtual environment
source venv/bin/activate  # Activate environment (Windows: venv\Scripts\activate)
pip install -r requirements.txt  # Install dependencies

Repeat this for Auth, Connection, Content, and Gateway services.

2. Start PostgreSQL & Redis Locally

Make sure PostgreSQL is running (localhost:5432 or localhost:5433).

Start Redis before running the services:

redis-server

3. Start Kafka & Zookeeper

Inside the backend folder, run:

docker-compose up -d  # Starts Kafka & Zookeeper

4. Run Each Service in Separate Terminals

Start services in the following order:

# Gateway Service (Port 8000)
cd backend/Gateway
python manage.py runserver 8000

# Auth Service (Port 8001)
cd backend/Auth
python manage.py runserver 8001

# Content Service (Port 8002)
cd backend/Content
python manage.py runserver 8002

# Connection Service (Port 8003 - Use Daphne for ASGI)
cd backend/Connection
daphne -p 8003 -b 0.0.0.0 musify.asgi:application

5. Run Kafka Consumers (For Content & Connection Services)

Each service that interacts with Kafka needs a separate terminal:

# Inside Connection & Content service directories:
python manage.py start_kafka_consumer

API Documentation

🚀 API documentation will be added soon. Placeholder for future updates.

Database Configuration

Production: PostgreSQL (AWS RDS)

Local Development: Use PostgreSQL on localhost:5432

Ensure .env files are configured for each service (not included in GitHub).

Example .env file (DO NOT SHARE SECRETS!):

SECRET_KEY='your-secret-key'
DB_NAME='your_db_name'
DB_USER='your_db_user'
DB_PASSWORD='your_db_password'
DB_HOST='localhost'
DB_PORT='5432'

License

This project is not currently licensed. All rights reserved by the author.

Contributing

Want to contribute? Follow these steps:

Fork the repository

Create a new branch: git checkout -b feature-branch

Commit changes: git commit -m "Added new feature"

Push to GitHub: git push origin feature-branch

Open a Pull Request 🚀

Contact

For any queries, feel free to reach out!Website: Musify
