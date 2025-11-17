# ⚓ Sam F Battleship - Premium Edition

A stunning, premium Battleship game with AAA-level polish, featuring a beautiful naval theme, glassmorphism effects, smooth animations, and intelligent AI opponents.

## 🌟 Premium Features

### Visual Excellence
- **Naval/Ocean Theme**: Immersive deep blue gradient backgrounds with animated waves
- **Glassmorphism UI**: Modern frosted glass panels with backdrop blur effects
- **3D Depth Effects**: Box shadows and layered animations
- **Particle Effects**: Explosion animations for hits, water splashes for misses
- **Victory Confetti**: Celebratory animation on winning

### Gameplay Features
- **Three Difficulty Levels**: Easy, Medium, and Hard AI opponents
- **Smart AI**: Intelligent targeting system that adapts to difficulty
- **Real-time Stats**: Track shots fired, accuracy, and ships remaining
- **Coordinate System**: A-J rows and 1-10 columns for authentic gameplay
- **Ship Collision Detection**: Realistic ship placement rules

### User Experience
- **Smooth Animations**: 60fps animations throughout
- **Loading States**: Radar animation while computer thinks
- **Turn Indicators**: Clear visual feedback for whose turn it is
- **Game Over Modal**: Beautiful victory/defeat screens with stats
- **Sound Toggle**: Mute/unmute option
- **High Contrast Mode**: Accessibility option for better visibility

## How to Play

1. **Setup Phase**:
   - Click on a ship to select it
   - Click on the board to place the ship
   - Press 'R' or click the "Rotate Ship" button to change ship orientation
   - Place all 5 ships
   - Click "Start Game" when ready

2. **Gameplay**:
   - Click on the computer's board to attack
   - Red = Hit
   - White = Miss
   - Sink all the computer's ships to win!

## 🚀 Running the Game

### Option 1: Python (Recommended - No Dependencies)
```bash
cd samf-battleship
python3 -m http.server 3000 --directory public
```

### Option 2: Node.js
```bash
cd samf-battleship
node server.js
```

Then open your browser and navigate to: **http://localhost:3000**

## Game Controls

- **Left Click**: Select/Place ships (setup) or attack (gameplay)
- **R Key**: Rotate selected ship (setup)
- **Reset Button**: Start a new game

## Ships

- Carrier (5 cells)
- Battleship (4 cells)
- Cruiser (3 cells)
- Submarine (3 cells)
- Destroyer (2 cells)

## 🎨 Technologies Used

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern features including:
  - CSS Grid & Flexbox
  - CSS Animations & Keyframes
  - Backdrop Filter (Glassmorphism)
  - CSS Variables for theming
  - Media Queries for responsiveness
- **Vanilla JavaScript (ES6+)**: No frameworks, pure performance
- **Python/Node.js**: Simple HTTP server options

## 📊 Technical Highlights

- **60+ Premium Features**: See FEATURES.md for complete list
- **Zero Dependencies**: Pure vanilla JavaScript
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Accessibility**: High contrast mode, keyboard navigation, reduced motion support
- **Performance**: GPU-accelerated animations, optimized rendering
- **Clean Code**: Well-structured, maintainable, commented

## 🎯 AI Difficulty Levels

- **Easy**: Random targeting
- **Medium**: 70% chance to target adjacent cells after a hit
- **Hard**: Intelligent hunt mode with target queue system

## 📱 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🎮 Game Tips

1. Spread your ships out to make them harder to find
2. Don't place ships touching each other (game enforces this)
3. On Hard difficulty, the AI is very intelligent - good luck!
4. Use the stats panel to track your accuracy
5. Try different difficulty levels to find your challenge

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy your naval warfare! ⚓🎮**
