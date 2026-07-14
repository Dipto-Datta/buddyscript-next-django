# BuddyScript – Full-Stack Social Media Platform

A full-stack social media application implementing a secure email-based authentication system (with optional 2FA), public/private post creation, nested comment replies, and robust like/unlike interactions.

## Technical Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Vanilla CSS (ported from provided design templates).
- **Backend**: Django 5 + Django REST Framework + SimpleJWT (Token Auth).
- **Database**: SQLite (default, with persistent volume binding).
- **Containerization**: Docker Compose (services: `backend`, `frontend`).

---

## Features Built

1. **Authentication & Profile Management**
   - User registration (First name, Last name, Email, Password, Profile avatar).
   - Email/password login with secure JWT token storage (Access + Refresh tokens).
   - Profile retrieval and update (`/api/auth/me/`).

2. **Admin-controlled 2FA Switch (Feature Switch)**
   - Included a robust Two-Factor Authentication (2FA) mechanism sending OTP codes to user email on login attempt.
   - Built a master switch to toggle this 2FA system globally, either via settings config files (`ENABLE_EMAIL_2FA`) or managed directly in Django Admin panel through a `SiteSettings` configuration.

3. **Feed Page Interactions (Protected Route)**
   - Route guard checks authentication status and automatically handles token renewal/refresh.
   - **Post Creation**: Support text posts and image uploads. Supports **Public** (visible to all) vs **Private** (visible to author only) visibility switches.
   - **Interactions**:
     - Like and Unlike posts, comments, and nested replies.
     - View list of who liked a post or comment (Likers modal).
     - Nested reply threads (two levels deep).

4. **Scalable System Decisions**
   - **Cursor-based Pagination**: Designed database queries with cursor-pagination instead of offset-based pagination to handle millions of posts and prevent page skip overhead.
   - **GenericForeignKey Likes**: Standardized the liking logic by utilizing Generic Foreign Keys, mapping Post and Comment models onto a single polymorphic `Like` database schema.
   - **Indexes**: Added composite database indexes on `(visibility, created_at)` and `(author, created_at)` to support ultra-fast sorting on timelines.

---

## Setup & Running with Docker

Ensure you have Docker and Docker Compose installed.

### 1. Build and Run Services
From the root project directory, run:
```bash
docker compose up --build
```
This command builds the Next.js and Django images, runs migrations, and spins up:
- **Frontend**: http://localhost:3000
- **Backend (API)**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin

### 2. Create Admin Superuser
To log into Django Admin and toggle features like global 2FA:
```bash
docker compose exec backend python manage.py createsuperuser
```

---

## Manual Verification Guide

1. Navigate to http://localhost:3000/register and sign up.
2. Sign in at http://localhost:3000/login.
3. Test creating a **Public** post (e.g. text + upload an image).
4. Log out, create a second user, and log in.
5. On the feed, verify you see the first user's public post. Write a comment, like the post, write a reply to your comment, and toggle likes.
6. Click the like count display to see who liked the post/comment.
7. Test posting a **Private** post; verify it is only visible when logged in as the author.
