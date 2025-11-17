# 🌊 Ship Sinking Animation Feature

## Overview
Added dramatic ship-sinking animations and notifications when a battleship is destroyed.

## Features Implemented

### 1. **Ship Sinking Animation** 
When a ship is completely destroyed, each cell of the ship plays a dramatic sinking animation:

- **Phase 1 (0-30%)**: Ship briefly rises and brightens (last gasp)
- **Phase 2 (30-60%)**: Ship tilts and starts to sink
- **Phase 3 (60-100%)**: Ship sinks below the waves, darkens, and fades

**Visual Effects:**
- Scale transformation (grows then shrinks)
- Rotation (tilts as it sinks)
- Opacity fade (becomes translucent)
- Brightness filter (darkens as it goes under)
- Duration: 1.5 seconds

### 2. **Wave Overlay Effect** 🌊
A wave emoji (🌊) appears over each sunk ship cell:

- Drops from above
- Scales up as it falls
- Settles over the sunken ship
- Creates the illusion of water covering the wreckage

### 3. **Sinking Notification Banner** 💀
A dramatic full-screen notification appears when any ship is destroyed:

**Design:**
- Red gradient background with gold border
- Large skull emoji (💀) that shakes
- Bold text showing: "ENEMY [SHIP NAME] DESTROYED!" or "YOUR [SHIP NAME] DESTROYED!"
- Centered on screen with dramatic entrance/exit animations

**Animation Sequence:**
- Appears with rotation and scale
- Bounces slightly for emphasis
- Holds for 2 seconds
- Fades out smoothly

**Skull Animation:**
- Continuously shakes left and right
- Creates urgency and drama

### 4. **Timing Coordination**
- Hit animation plays first (💥)
- 300ms delay
- Sinking animation begins on all ship cells
- Notification banner appears simultaneously
- All animations complete before next turn

## Technical Details

### CSS Animations Added:
1. `sink-ship` - Main sinking animation (1.5s)
2. `wave-over` - Wave overlay effect (1.5s)
3. `notification-appear` - Banner entrance/exit (2s)
4. `skull-shake` - Skull wobble effect (0.5s infinite)

### JavaScript Enhancements:
- `showSinkingNotification(shipName, owner)` function
- Delayed sinking animation trigger (300ms after hit)
- Delayed game-over trigger (2s after final ship sinks)
- Notification auto-removal after 2 seconds

## User Experience

### When You Sink Enemy Ship:
1. You click and hit the final cell
2. Explosion animation (💥)
3. Brief pause (300ms)
4. All ship cells start sinking with waves
5. Red banner: "ENEMY [SHIP] DESTROYED!"
6. Message updates: "You sunk the enemy's [ship]!"
7. Stats update automatically

### When Enemy Sinks Your Ship:
1. Computer attacks and hits final cell
2. Explosion animation (💥)
3. Brief pause (300ms)
4. All ship cells start sinking with waves
5. Red banner: "YOUR [SHIP] DESTROYED!"
6. Message updates: "Enemy sunk your [ship]!"
7. Stats update automatically

## Visual Hierarchy

The sinking notification has the highest z-index (1500), ensuring it appears above:
- Game boards
- Stats panels
- Loading overlay (z-index: 999)
- Game over modal (z-index: 1000)

## Accessibility

- Animation respects `prefers-reduced-motion` setting
- High contrast mode compatible
- Clear text messaging alongside visual effects
- Non-blocking (game continues after animation)

## Performance

- GPU-accelerated transforms (translate, scale, rotate)
- Efficient CSS animations
- Minimal DOM manipulation
- Automatic cleanup (notification removed after 2s)

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge ✅
- Firefox ✅
- Safari ✅
- Mobile browsers ✅

---

**Result**: A cinematic, satisfying experience when ships are destroyed, making victories feel more rewarding and defeats more dramatic! 🎮⚓
