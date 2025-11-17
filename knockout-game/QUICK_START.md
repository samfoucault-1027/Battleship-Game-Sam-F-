# 🏀 Knockout - Quick Start Guide

## 📍 Your New Game Location
```
/Users/samfoucault/CascadeProjects/windsurf-project-2/knockout-game/
```

## ⚡ Quick Setup (3 Steps)

### 1. Install Node.js (if not installed)
```bash
brew install node
```

### 2. Install & Start
```bash
cd /Users/samfoucault/CascadeProjects/windsurf-project-2/knockout-game
npm install
npm start
```

### 3. Play!
Open: `http://localhost:3001`

## 🎮 How to Play Multiplayer

### Same Computer (Testing)
1. Open `http://localhost:3001` in Tab 1
2. Click "Create Game" → Note the 6-character code
3. Open `http://localhost:3001` in Tab 2
4. Click "Join Game" → Enter the code
5. Back to Tab 1 → Click "Start Game"
6. Take turns shooting!

### Different Computers (Same WiFi)
1. **Host Computer:**
   - Find your IP: `ifconfig | grep inet` (look for 192.168.x.x)
   - Start server: `npm start`
   - Create game at `http://localhost:3001`
   
2. **Friend's Computer:**
   - Visit: `http://HOST_IP:3001`
   - Example: `http://192.168.1.100:3001`
   - Join using the game code

### Over Internet (Friends Anywhere)
```bash
# Install ngrok
brew install ngrok

# Start game server
npm start

# In new terminal
ngrok http 3001

# Share the ngrok URL with friends
```

## 🎯 Game Rules

- **2-4 players** required to start
- **3 lives** per player (❤️❤️❤️)
- **5 shot spots** from easy to hard
- **Power meter** - click when marker is in middle (45-55%)
- **Miss = lose a life**
- **Last player standing wins!** 🏆

## 📁 Project Files

```
knockout-game/
├── server.js              # Game server (WebSocket)
├── package.json           # Dependencies
├── README.md             # Full documentation
├── SETUP_INSTRUCTIONS.md # Detailed setup
├── QUICK_START.md        # This file
└── public/
    ├── index.html        # Game interface
    ├── styles.css        # Styling
    └── game.js           # Client logic
```

## 🔧 Troubleshooting

**"npm: command not found"**
→ Install Node.js: `brew install node`

**"Port 3001 already in use"**
→ Change port in `server.js` line 1: `const PORT = 3002;`

**Can't connect from another computer**
→ Check firewall settings, make sure both on same WiFi

**Game code doesn't work**
→ Make sure game hasn't started yet (max 4 players)

## 🎨 Features

✅ Real-time multiplayer (WebSocket)
✅ 2-4 players
✅ Animated basketball court
✅ Power meter shooting mechanic
✅ Lives system (3 per player)
✅ Turn-based gameplay
✅ Lobby with game codes
✅ Responsive design
✅ Toast notifications
✅ Game over screen with standings

## 🚀 Your Battleship Game

Your Battleship game is still safe at:
```
/Users/samfoucault/CascadeProjects/windsurf-project-2/samf-battleship/
```

Both games are completely separate!

---

**Ready to play? Install Node.js and run `npm start`!** 🏀🎮
