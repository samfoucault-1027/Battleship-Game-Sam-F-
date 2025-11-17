# 🏀 Knockout - Multiplayer Basketball Game

A real-time multiplayer basketball game inspired by Game Pigeon's Knockout, supporting 2-4 players over the network!

## 🎮 Features

### Multiplayer
- **2-4 Players** - Play with friends from different computers
- **Real-time Gameplay** - WebSocket-based instant updates
- **Easy Join System** - Share a 6-character game code
- **Lobby System** - Wait for all players before starting

### Gameplay
- **Turn-Based Shooting** - Each player takes turns shooting
- **5 Shot Spots** - Corner 3, Wing 3, Top of Key, Free Throw, Layup
- **Power Meter** - Time your shot for perfect accuracy
- **Lives System** - Start with 3 lives, lose one for each miss
- **Elimination** - Last player standing wins!

### Visual Design
- **Animated Basketball Court** - Realistic court with lines and hoop
- **Shot Animations** - Watch the ball fly through the air
- **Live Player Status** - See everyone's lives and current turn
- **Toast Notifications** - Real-time game updates
- **Responsive Design** - Works on desktop and mobile

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Navigate to the game directory:**
   ```bash
   cd knockout-game
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

### For Development
```bash
npm run dev
```
This uses nodemon for auto-restart on file changes.

## 🎯 How to Play

### Starting a Game

1. **Host creates a game:**
   - Enter your name
   - Click "Create Game"
   - Share the 6-character game code with friends

2. **Friends join:**
   - Enter their name
   - Click "Join Game"
   - Enter the game code
   - Click "Join"

3. **Start when ready:**
   - Wait for 2-4 players
   - Host clicks "Start Game"

### Playing

1. **Wait for your turn** - Watch the active player indicator
2. **When it's your turn:**
   - Watch the power meter move back and forth
   - Click "SHOOT" when the marker is in the middle (45-55%)
   - Closer to 50% = higher accuracy
3. **Make the shot** - Keep your life
4. **Miss the shot** - Lose a life ❤️
5. **Survive** - Be the last player with lives remaining!

### Winning

- **Last player standing wins** 🏆
- Players are eliminated when they lose all 3 lives
- Game continues through all 5 spots and multiple rounds

## 🎨 Shot Spots

1. **Layup** (Distance: 0) - Easiest, closest to hoop
2. **Free Throw** (Distance: 1) - Classic free throw line
3. **Top of Key** (Distance: 2) - Mid-range shot
4. **Wing 3** (Distance: 3) - Three-pointer from the wing
5. **Corner 3** (Distance: 3) - Three-pointer from corner

## 🌐 Multiplayer Setup

### Playing on Same Network (LAN)

1. **Find your local IP:**
   - Mac/Linux: `ifconfig | grep inet`
   - Windows: `ipconfig`
   - Look for something like `192.168.1.x`

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Share the URL:**
   - Host: `http://localhost:3001`
   - Others: `http://YOUR_IP:3001`
   - Example: `http://192.168.1.100:3001`

### Playing Over Internet

For playing with friends not on your network, you'll need to:

1. **Port forward** port 3001 on your router, OR
2. **Use a service** like ngrok:
   ```bash
   npx ngrok http 3001
   ```
   Share the ngrok URL with friends

## 🛠️ Technical Stack

- **Backend:**
  - Node.js
  - Express.js (web server)
  - WebSocket (ws library) for real-time communication

- **Frontend:**
  - Vanilla JavaScript (ES6+)
  - HTML5 & CSS3
  - WebSocket API
  - CSS Animations & Transitions

## 📁 Project Structure

```
knockout-game/
├── server.js           # WebSocket server & game logic
├── package.json        # Dependencies
├── README.md          # This file
└── public/
    ├── index.html     # Game UI
    ├── styles.css     # Styling & animations
    └── game.js        # Client-side game logic
```

## 🎮 Game Rules

1. **Turn Order** - Players shoot in order, cycling through all active players
2. **Spot Progression** - All players shoot at each spot before moving to next
3. **Life Loss** - Miss a shot = lose 1 life
4. **Elimination** - 0 lives = eliminated from game
5. **Victory** - Last player with lives remaining wins

## 🐛 Troubleshooting

### Can't connect to server
- Make sure the server is running (`npm start`)
- Check firewall settings
- Verify the correct IP address and port

### Game code doesn't work
- Codes are case-insensitive but must be 6 characters
- Game must be in "waiting" status (not started)
- Maximum 4 players per game

### WebSocket connection fails
- Check browser console for errors
- Ensure WebSocket isn't blocked by firewall
- Try refreshing the page

## 🔮 Future Enhancements

Potential features to add:
- [ ] Sound effects for shots and misses
- [ ] Player avatars and customization
- [ ] Tournament mode with brackets
- [ ] Spectator mode
- [ ] Chat system
- [ ] Game statistics and leaderboards
- [ ] Different court themes
- [ ] Power-ups and special shots

## 📝 License

MIT License - Feel free to use and modify!

## 🎉 Credits

Inspired by Game Pigeon's Knockout game. Built for multiplayer fun with friends!

---

**Have fun and may the best shooter win!** 🏀🏆
