# 🏀 Knockout Setup Instructions

## ⚠️ Node.js Required

This multiplayer game requires Node.js to run the WebSocket server.

## 📥 Installing Node.js

### Option 1: Homebrew (Recommended for Mac)
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify installation
node --version
npm --version
```

### Option 2: Official Installer
1. Visit https://nodejs.org/
2. Download the LTS (Long Term Support) version
3. Run the installer
4. Restart your terminal

## 🚀 After Installing Node.js

1. **Navigate to the game directory:**
   ```bash
   cd /Users/samfoucault/CascadeProjects/windsurf-project-2/knockout-game
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   ```
   http://localhost:3001
   ```

5. **To play multiplayer:**
   - Open the game in multiple browser tabs/windows, OR
   - Share your local IP with friends on the same network
   - Find your IP: `ifconfig | grep inet` (look for 192.168.x.x)
   - Friends visit: `http://YOUR_IP:3001`

## 🎮 Quick Test

To test the game works:
1. Open `http://localhost:3001` in one browser tab
2. Create a game and note the game code
3. Open another tab with the same URL
4. Join the game using the code
5. Start playing!

## 🌐 Playing Over Internet

For playing with friends not on your network:

### Using ngrok (easiest)
```bash
# Install ngrok
brew install ngrok

# Start your game server first
npm start

# In another terminal, create tunnel
ngrok http 3001

# Share the ngrok URL with friends
```

### Alternative: Port Forwarding
1. Forward port 3001 on your router
2. Find your public IP: https://whatismyipaddress.com/
3. Share: `http://YOUR_PUBLIC_IP:3001`

## ❓ Need Help?

If you encounter issues:
1. Make sure Node.js is installed: `node --version`
2. Check if port 3001 is available
3. Look for errors in the terminal
4. Check browser console (F12) for client errors

---

**Once Node.js is installed, the game will work perfectly!** 🏀
