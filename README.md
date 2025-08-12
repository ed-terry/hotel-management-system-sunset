# � Sunset Hotel Management System

A comprehensive, modern hotel management system built specifically for Sunset Hotel, featuring React, TypeScript, Node.js, and GraphQL.

## ✨ Features

- 🏠 **Room Management** - Complete room inventory and status tracking
- 👥 **Guest Management** - Customer profiles and booking history
- 📅 **Booking System** - Reservation management with real-time availability
- 🧹 **Housekeeping** - Task management and room status updates
- 👨‍💼 **Staff Management** - Employee profiles and role management
- 📊 **Analytics Dashboard** - Business insights and performance metrics
- 💰 **Billing & Invoicing** - Automated billing with PDF generation
- 🔐 **Authentication** - Secure login with JWT tokens
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎨 **Sunset Theme** - Beautiful sunset-themed interface with warm colors
- 🌅 **Brand Integration** - Custom Sunset Hotel branding and logos

## 🏗️ Architecture

### Frontend (Client)

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: Apollo Client for GraphQL
- **Routing**: React Router v6
- **Icons**: Heroicons
- **Charts**: Chart.js + Recharts
- **Build Tool**: Vite

### Backend (Server)

- **Runtime**: Node.js with TypeScript
- **API**: GraphQL with Apollo Server
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **File Uploads**: Multer
- **Email**: Nodemailer

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/ed-terry/hotel-management-system.git
   cd hotel-management-system
   ```

2. **Environment Configuration**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker (Recommended)**

   ```bash
   # Development environment
   docker-compose -f docker-compose.dev.yml up --build

   # Production environment
   docker-compose up --build
   ```

4. **Manual Setup**

   ```bash
   # Install server dependencies
   cd server
   npm install

   # Setup database
   npx prisma migrate dev
   npx prisma db seed

   # Start server
   npm run dev

   # In a new terminal, install client dependencies
   cd ../client
   npm install

   # Start client
   npm run dev
   ```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/graphql
- **Database**: localhost:5432

## 🔧 Development

### Available Scripts

#### Client

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run test:ci      # Run tests with coverage
npm run lint         # Lint code
npm run typecheck    # TypeScript check
```

#### Server

```bash
npm run dev          # Start development server
npm run build        # Build TypeScript
npm run start        # Start production server
npm run test         # Run tests
npm run seed         # Seed database
```

### Project Structure

```
hotel-management-system/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── graphql/       # GraphQL queries/mutations
│   │   ├── types/         # TypeScript types
│   │   └── assets/        # Static assets
│   ├── public/            # Public assets
│   └── Dockerfile         # Production Docker image
├── server/                # Node.js backend
│   ├── src/
│   │   ├── resolvers/     # GraphQL resolvers
│   │   ├── schema/        # GraphQL schema
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Utility functions
│   ├── prisma/            # Database schema and migrations
│   └── Dockerfile         # Production Docker image
├── .github/workflows/     # CI/CD workflows
├── docker-compose.yml     # Production docker compose
├── docker-compose.dev.yml # Development docker compose
└── README.md
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

#### 1. **Main CI/CD Pipeline** (`.github/workflows/docker-image.yml`)

- ✅ **Test Suite**: Runs tests for both client and server
- 🏗️ **Build**: Creates optimized Docker images
- 🔒 **Security Scan**: Trivy vulnerability scanning
- 📦 **Registry**: Pushes to GitHub Container Registry
- 🚀 **Deploy**: Automated deployment to staging/production

#### 2. **Code Quality** (`.github/workflows/code-quality.yml`)

- 🔍 **Linting**: ESLint and Prettier checks
- 🛡️ **Security**: CodeQL analysis
- 📊 **Coverage**: SonarCloud integration
- 🔐 **Dependencies**: Security audit

#### 3. **Dependency Updates** (`.github/workflows/dependency-updates.yml`)

- 📅 **Scheduled**: Weekly dependency updates
- 🔧 **Automated**: Creates PRs for updates
- 🛡️ **Security**: Applies security patches

#### 4. **Documentation** (`.github/workflows/docs.yml`)

- 📚 **Build**: Generates API documentation
- 🌐 **Deploy**: GitHub Pages deployment

### Deployment Environments

- **Development**: Feature branches, PR previews
- **Staging**: `develop` branch auto-deployment
- **Production**: `main` branch with manual approval

### Container Registry

Images are automatically built and pushed to GitHub Container Registry:

- `ghcr.io/ed-terry/hotel-management-system-client:latest`
- `ghcr.io/ed-terry/hotel-management-system-server:latest`

## 🔒 Security

- JWT-based authentication
- CORS protection
- SQL injection prevention with Prisma
- XSS protection
- HTTPS enforcement in production
- Security headers middleware
- Automated vulnerability scanning
- Dependency security audits

## 📊 Monitoring & Analytics

- Application performance monitoring
- Error tracking with Sentry
- Business analytics dashboard
- Docker health checks
- Automated log aggregation

## 🧪 Testing

- **Unit Tests**: Jest + Vitest
- **Integration Tests**: Supertest for API
- **E2E Tests**: Cypress (planned)
- **Code Coverage**: Istanbul
- **CI Testing**: Automated on every PR

## 📝 API Documentation

GraphQL API documentation is available at `/graphql` endpoint with GraphQL Playground enabled in development.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow TypeScript strict mode
- Use conventional commit messages
- Ensure CI/CD pipeline passes
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: Ed Terry
- **Repository**: https://github.com/ed-terry/hotel-management-system

## 🙏 Acknowledgments

- React team for the amazing framework
- Apollo GraphQL for excellent tooling
- Tailwind CSS for beautiful styling
- All open source contributors

---

**Built with ❤️ using modern web technologies**
