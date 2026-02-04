#!/bin/bash

# ============================================
# Inventoria Full Stack Setup Script
# For Unix-based systems (Linux, macOS)
# ============================================

set -e  # Exit on error

echo "=========================================="
echo "   Inventoria Setup Script"
echo "=========================================="
echo ""

# Check Java installation
echo "1. Checking Java installation..."
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 11 or higher."
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | sed 's/\..*//')
if [ "$JAVA_VERSION" -lt 11 ]; then
    echo "❌ Java version $JAVA_VERSION is too old. Please install Java 11 or higher."
    exit 1
fi
echo "✅ Java $JAVA_VERSION detected"
echo ""

# Check Maven installation
echo "2. Checking Maven installation..."
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven 3.6+."
    exit 1
fi
echo "✅ Maven detected"
echo ""

# Check MongoDB installation
echo "3. Checking MongoDB installation..."
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found in PATH."
    read -p "Do you want to continue anyway? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ MongoDB detected"
fi
echo ""

# Build Backend
echo "4. Building backend..."
cd backend
mvn clean install -DskipTests
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed"
    exit 1
fi
echo "✅ Backend built successfully"
cd ..
echo ""

# Create uploads directory
echo "5. Creating uploads directory..."
mkdir -p backend/uploads
echo "✅ Uploads directory created"
echo ""

# Check if MongoDB is running
echo "6. Checking MongoDB connection..."
if command -v mongod &> /dev/null; then
    if ! pgrep -x "mongod" > /dev/null; then
        echo "⚠️  MongoDB is not running."
        echo "   Please start MongoDB with:"
        echo "   - Linux: sudo systemctl start mongodb"
        echo "   - macOS: brew services start mongodb-community"
        read -p "Press Enter to continue..."
    else
        echo "✅ MongoDB is running"
    fi
fi
echo ""

# Setup complete
echo "=========================================="
echo "   Setup Complete! ✅"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start Backend:"
echo "   cd backend"
echo "   mvn spring-boot:run"
echo ""
echo "2. Start Frontend (in new terminal):"
echo "   cd frontend"
echo "   python3 -m http.server 3000"
echo ""
echo "3. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "Default credentials (if using sample data):"
echo "   Username: demo_user"
echo "   Password: password123"
echo ""
echo "=========================================="
