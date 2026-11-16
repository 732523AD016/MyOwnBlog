
MyOwnBlog

MyOwnBlog is a full-stack blogging platform built using the MERN stack. Users can create, read, update and delete blog posts. Admins can manage users and blog posts.

 Technology used

Frontend
React.js
React Router
CSS
Vite

Backend
 Node.js
Express.js
 MongoDB
 Mongoose
JWT Authentication
bcryptjs
Multer

Features

 User Features
 User registration and login
 Secure password hashing
 JWT authentication
 Create and manage blog posts
 Upload blog images
 Search blog posts
 Filter posts by category
 Filter posts by tags
 View blog details
 Author information and bio

 Blog Features
 Published and draft posts
 Unique SEO-friendly slugs
 Blog pagination
 Trending blogs
 Featured blogs
 Related blog suggestions
 Previous and next blog navigation
 Blog view counter
 SEO title and meta description
- Scheduled publishing

 Admin Features

 Admin authentication
 View all users
 Delete users
 View all blog posts
 Change post status
 Manage featured posts

 SEO Features

 Sitemap XML generation
 SEO-friendly blog URLs
 Meta title and description fields

 Project Structure


MyOwnBlog

backend/
config/
db.js
seedCategories.js
controllers/
authController.js
postController.js
adminController.js

middleware/
authMiddleware.js
adminMiddleware.js
uploadMiddleware.js

 models/
User.js
Post.js
Category.js

routes/
authRoutes.js
blogRoutes.js
adminRoutes.js
categoryRoutes.js
tagRoutes.js
seoRoutes.js

uploads/
server.js
package.json
.env.example

frontend/
src/


API 

 Authentication

 Method  Endpoint 

 POST  /api/auth/register 
 POST  /api/auth/login 

Blogs

 Method  Endpoint 

 GET  /api/posts 
 GET  /api/posts/:id 
 GET  /api/posts/slug/:slug 
 GET  /api/posts/trending 
 GET  /api/posts/featured 
 GET  /api/posts/related/:id 
 GET  /api/posts/adjacent/:id 
 POST  /api/posts 
 PUT  /api/posts/:id 
 DELETE  /api/posts/:id 

Categories and Tags

 Method  Endpoint 

 GET  /api/categories 
 GET  /api/tags 

Admin

 Method  Endpoint 

 GET  /api/admin/users 
 DELETE  /api/admin/users/:id 
 GET  /api/admin/posts 
 PATCH  /api/admin/posts/:id/status 
 PATCH  /api/admin/posts/:id/featured 

SEO

 Method  Endpoint 

 GET  /api/seo/sitemap.xml 

 Installation
 Backend


cd backend
npm install
npm run dev


Frontend


cd frontend
npm install
npm run dev


Environment Variables

Create a .env file inside the backend folder.

env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=my secret key
FRONTEND_URL=http://localhost:5173

Database

MongoDB is used to store:
 User information
 Blog posts
 Blog categories

Project Purpose

MyOwnBlog provides a platform for users to publish and manage articles with authentication, content management and administrative features.
