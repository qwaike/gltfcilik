# 🐦 Bird Poop Game

A fun Three.js game where you control a bird flying over a city and try to poop on people walking below!

## 🎮 How to Play

### Controls
- **WASD** or **Arrow Keys**: Fly the bird around the city
- **Click** or **Space**: Drop poop on people below
- **Goal**: Hit as many people as you can to score points!

### Game Features
- 🐦 Controllable bird with realistic flight physics
- 🏢 Randomly generated city with buildings
- 👥 Walking people that move back and forth
- 💩 Poop mechanics with collision detection
- 📊 Score tracking system
- 🎨 Beautiful 3D graphics with shadows and lighting

## 🚀 Running the Game

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the game:
   ```bash
   npm run build
   ```

3. Serve the game:
   ```bash
   cd dist && python3 -m http.server 8080
   ```

4. Open your browser and go to: `http://localhost:8080`

## 🎯 Game Mechanics

- The bird follows your input with smooth physics
- People walk back and forth on the ground
- When you poop and hit a person, they turn brown and you get 10 points
- The camera follows the bird smoothly
- The game world has boundaries to keep you in the play area

## 🛠️ Technical Details

- Built with **Three.js** for 3D graphics
- Uses **WebGL** for hardware acceleration
- Responsive design that works on different screen sizes
- Optimized rendering with shadow mapping
- Modular code structure with classes for Bird, Person, and Building

Have fun pooping on people! 🎉 
