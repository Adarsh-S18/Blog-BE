# Blog Backend

This is the backend for the Blog Application. It is built with Next.js (App Router) and TypeScript.

## Features
- User authentication (register, login, get current user)
- Admin endpoints for managing posts and users
- CRUD operations for blog posts
- Middleware for authentication
- MongoDB integration

## Project Structure
```
blog-backend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── posts/
│   │   │   │   └── users/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── me/
│   │   │   └── posts/
│   │   │       └── [id]/
│   │   ├── lib/
│   │   ├── middleware/
│   │   └── models/
├── middleware.ts
├── package.json
├── tsconfig.json
├── next.config.mjs
├── next-env.d.ts
```

## Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your environment variables (e.g., MongoDB URI, JWT secret).
4. Run the development server:
   ```bash
   npm run dev
   ```

## API Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/user` - Get current user
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a post
- `GET /api/posts/[id]` - Get post by ID
- `PUT /api/admin/posts/[id]` - Update post (admin)
- `DELETE /api/admin/posts/[id]` - Delete post (admin)
- `GET /api/admin/users` - Get all users (admin)

## Technologies Used
- Next.js (App Router)
- TypeScript
- MongoDB
- JWT Authentication

## License
MIT
