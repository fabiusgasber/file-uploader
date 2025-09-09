# File Uploader

🔗 [Live Preview](https://file-uploader-production-f55b.up.railway.app)

## Introduction

This project is part of **The Odin Project** curriculum. The goal was to build a file uploader where users can upload, organize and download files built with Express, Prisma, Passport.js, and Multer.
This project demonstrates user authentication, file uploads, folder management, and cloud storage integration.

---

## Features

- User Authentication
  Session-based authentication with Passport.js. Sessions are persisted using Prisma session store.

- File Uploads
  Upload files via a form (authenticated users only).
  Files initially stored in the local filesystem using Multer.
  Extended functionality to upload and store files in a cloud storage service (Cloudinary or Supabase).

- Folders
  CRUD functionality for folders. Users can upload files into specific folders.

- File Management
  CRUD functionality for files. Users can view file details (name, size, upload time) and download files from the application.

---

## Tech Stack

- Express – Web framework for Node.js
- Prisma – Database ORM
- Passport.js – Authentication middleware
- Multer – Middleware for handling file uploads
- Supabase – Cloud storage solutions

## Future Improvements

- Add user sharing and permissions for files and folders
- Add ability to move files and folders
- Drag and drop uploads
- File search functionality

---

License

This project is licensed under the MIT License.
