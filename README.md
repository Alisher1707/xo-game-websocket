# 🎮 XO Game - Modern Tic Tac Toe

Modern WebSocket-based Tic Tac Toe game with AI opponent and custom avatars.

## 🚀 Quick Start

### Option 1: One-click start (Recommended)
Double-click `start-project.bat` file to automatically start both servers.

### Option 2: Manual start

**Start Server (Terminal 1):**
```bash
cd server
npm start
```

**Start Client (Terminal 2):**
```bash
cd client  
npm start
```

## 🌐 Access
- **Game**: http://localhost:3000
- **Server**: http://localhost:3001

## ✨ Features

### 🎯 Game Modes
- **👥 Multiplayer**: Play with friends online
- **🤖 vs Computer**: Play against AI (auto-starts)

### 👤 User Profile
- **Custom avatar upload** with image resizing
- **3 default emoji avatars**: 🎮 🔥 ⚡
- **Username validation** (2-15 characters)
- **Always fresh start** - modal opens on each visit

### 🎨 Modern UI
- **Glassmorphism design** with animated backgrounds
- **Responsive layout** for all devices  
- **Smooth animations** and hover effects
- **Win celebrations** with proper messages

### 🏆 Game Features
- **Auto-starting AI games** (no symbol selection needed)
- **Proper win messages**: "YOU WIN!" vs opponent username
- **Real-time multiplayer** via WebSocket
- **Game state persistence** during session

## 🛠️ Technical Details

### Frontend (Client - Port 3000)
- **Vite** development server
- **Socket.IO Client** for real-time communication
- **Modern CSS** with animations and glassmorphism
- **File upload** with canvas resizing

### Backend (Server - Port 3001)  
- **Node.js** with Socket.IO server
- **Real-time game state** management
- **Player data storage** and synchronization
- **Win detection** algorithm

### Port Management
- **Auto port cleanup** - automatically kills processes on ports 3000/3001
- **Consistent ports** - always runs on same ports
- **Error handling** - graceful fallbacks if ports are busy

## 📝 Usage Commands

```bash
# Start with auto port cleanup
npm start

# Development mode  
npm run dev

# Build for production
npm run build
```

## 🎮 How to Play

1. **Open** http://localhost:3000
2. **Choose game mode**: Multiplayer or vs Computer
3. **Select avatar**: Upload custom photo or choose emoji
4. **Enter username** (2-15 characters)
5. **Start playing!**

### Multiplayer Mode
- Choose your symbol (X or O)
- Wait for friend to join
- Take turns clicking cells
- First to get 3 in a row wins!

### Computer Mode  
- Automatically starts (you play as X)
- AI makes random moves
- Try to beat the computer!

## 🏆 Win Conditions
- **3 in a row** (horizontal, vertical, diagonal)
- **Draw** when board is full
- **Celebrations** with animated winning cells

Made with ❤️ using modern web technologies!