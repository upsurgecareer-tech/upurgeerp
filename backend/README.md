# UpsurgeERP Backend

Educational Institution Management System - Backend API

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- Redis 6+

### Installation

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Database Setup**
```bash
# Create database
mysql -u root -p
CREATE DATABASE upsurgeerp;
exit;

# Run migrations (coming soon)
npm run migrate
```

4. **Start Development Server**
```bash
npm run dev
```

Server will start at: `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Redis config
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middlewares/     # Auth, validation
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── validators/      # Input validation
│   ├── app.js           # Express app
│   └── server.js        # Entry point
├── uploads/             # File storage
├── .env                 # Environment variables
└── package.json
```

## 🔑 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user (Protected)

### Health Check
- `GET /health` - Server health status

## 🛠️ Tech Stack

- **Framework**: Express.js
- **Database**: MySQL 8.0+ (Sequelize ORM)
- **Cache**: Redis
- **Authentication**: JWT
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## 📝 Environment Variables

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_NAME=upsurgeerp
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
REDIS_HOST=localhost
```

## 🧪 Testing

```bash
npm test
```

## 📦 Build for Production

```bash
npm start
```

## 🔒 Security Features

- JWT Authentication
- Password Hashing (bcrypt)
- Rate Limiting
- Helmet Security Headers
- CORS Protection
- Input Validation

## 📄 License

MIT

---

**Made with ❤️ by UpsurgeERP Team**
