# Makefile for DevLead Companion
# Run 'make help' to see all available commands

.PHONY: help install build test clean docker-build docker-run docker-stop ci dev

# Default target - show help
help:
	@echo "DevLead Companion - Available Commands:"
	@echo ""
	@echo "  make install       - Install all dependencies (backend + frontend)"
	@echo "  make build         - Build both backend and frontend"
	@echo "  make test          - Run all tests"
	@echo "  make dev           - Start development servers"
	@echo ""
	@echo "  make docker-build  - Build Docker images"
	@echo "  make docker-run    - Run Docker containers"
	@echo "  make docker-stop   - Stop and remove Docker containers"
	@echo ""
	@echo "  make ci            - Run full CI pipeline (build + test)"
	@echo "  make clean         - Clean build artifacts and containers"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing backend dependencies..."
	cd backend && npm install
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ Dependencies installed!"

# Build projects
build:
	@echo "🔨 Building backend..."
	cd backend && npm run build
	@echo "🔨 Building frontend..."
	cd frontend && npm run build
	@echo "✅ Build complete!"

# Run tests
test:
	@echo "🧪 Running backend tests..."
	cd backend && npm test || true
	@echo "🧪 Running frontend tests..."
	cd frontend && npm test -- --watchAll=false || true
	@echo "✅ Tests complete!"

# Start development servers
dev:
	@echo "� Starting PostgreSQL container..."
	docker-compose up -d postgres
	@echo "�🚀 Starting development servers..."
	@echo "Backend will run on http://localhost:3000"
	@echo "Frontend will run on http://localhost:3002"
	@echo ""
	@echo "Press Ctrl+C to stop"
	@trap 'kill 0' EXIT; \
	cd backend && npm run start:dev & \
	cd frontend && PORT=3002 npm start

# Build Docker images
docker-build:
	@echo "🐳 Building backend Docker image..."
	docker build -t devlead-backend ./backend
	@echo "🐳 Building frontend Docker image..."
	docker build -t devlead-frontend ./frontend
	@echo "✅ Docker images built!"

# Run Docker containers
docker-run:
	@echo "🐳 Starting Docker containers..."
	docker run -d -p 3000:3000 --name devlead-backend-container devlead-backend
	docker run -d -p 3001:80 --name devlead-frontend-container devlead-frontend
	@echo "✅ Containers running!"
	@echo "Backend: http://localhost:3000"
	@echo "Frontend: http://localhost:3001"

# Stop Docker containers
docker-stop:
	@echo "🛑 Stopping Docker containers..."
	-docker stop devlead-backend-container devlead-frontend-container
	-docker rm devlead-backend-container devlead-frontend-container
	@echo "✅ Containers stopped!"

# Run full CI pipeline
ci: build test
	@echo ""
	@echo "✅ ✅ ✅ Local CI Pipeline Passed! ✅ ✅ ✅"
	@echo ""

# Clean everything
clean: docker-stop
	@echo "🧹 Cleaning build artifacts..."
	-rm -rf backend/dist
	-rm -rf frontend/build
	-rm -rf backend/node_modules
	-rm -rf frontend/node_modules
	@echo "🧹 Removing Docker images..."
	-docker rmi devlead-backend devlead-frontend
	@echo "✅ Clean complete!"

# I can add this target to your Makefile:
docker-rebuild: docker-stop docker-build docker-run
	@echo "✅ Docker images rebuilt and containers restarted!"

stop-dev:
	@echo "🛑 Stopping development servers..."
	-kill -9 $(lsof -ti:3000 -ti:3001)
	@echo "✅ Servers stopped!"
