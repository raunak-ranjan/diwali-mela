# 🪔 3D Diwali Mela Experience (Virtual Indian Festival Fairground)

A realistic, cinematic, browser-based **3D Diwali Mela web experience** inspired by traditional Indian festival fairgrounds. Visitors can enter the illuminated mela, walk around freely, explore stalls, light hundreds of glowing clay diyas, shoot carnival balloons, design rangolis, purchase virtual mithai, ride the giant Ferris wheel, and enjoy a synchronized Grand Diwali fireworks finale with traditional festival music.

---

## 🌟 Visual Art Direction & Features

- **Atmospheric Festival Night:** Physically based rendering, atmospheric nocturnal fog, warm saffron, amber, and gold illumination, and moonlight shadows.
- **Grand Toran Entrance Gate:** Carved Indian stone pillars, marigold garlands, mango leaf toran, brass bells, and glowing *"SHUBH DEEPAVALI"* signage.
- **Central Rangoli Plaza:** Concentric geometric floral mandala patterns, carved plinth, and traditional brass urli with floating petals and the Akhand Jyoti.
- **Interactive Stalls & Bazaar:**
  - *Shree Ganesh Mithai Bhandar:* Royal Gulab Jamun, Saffron Jalebi, Motichoor Laddoo, Kaju Katli.
  - *Old Delhi Chaat Corner:* Crispy Samosas and spiced festival snacks.
  - *Festive Handicrafts Lane:* Clay diyas, Akhand Jyoti lamps, Akash Kandil star lanterns, and golden sparklers.
- **Carnival Games Area:**
  - *Air-Rifle Balloon Shooting Booth:* Aim and pop balloons within a 30-second timer to win virtual tokens.
  - *Interactive Rangoli Designer Challenge:* Select vibrant festival powders (Gulal red, Marigold yellow, Peacock blue, Parrot green) and paint the sacred mandala.
  - *Diya Lighting:* Light unlit earthen lamps across the fairground to spread auspicious light and earn tokens.
- **Grand Attractions & Finale:**
  - *Giant Illuminated Ferris Wheel:* Rotating neon wheel with 8 passenger gondolas that stay vertically aligned.
  - *Cultural Sangeet Stage:* Elevated Rajasthani jharokha stage with traditional Indian instruments (Dholak, Tabla, Bayan, Dayan).
  - *Grand Fireworks Finale:* Synchronized fireworks barrage, explosive multi-color particle bursts, confetti, and celebratory Deepavali blessings.
- **Living Mela Autonomous Visitors & Stall Queues:**
  - *Autonomous Pedestrians:* Visitors (Aarav, Priya, Rohan, Ananya, Kabir, Meera, Vikram) walk between mela POIs, enjoy rangolis, view stage performances, and visit attractions.
  - *Pedestrian Repulsion:* Real-time proximity-based avoidance prevents NPCs from walking into or overlapping each other.
  - *Stall Queuing System:* Visitors line up in designated queue slots at Sweet/Chaat stalls, the Ferris wheel, and the balloon booth, step forward in line, and depart after service.
  - *Performance Isolation:* All visitor updates run in WebGL frame loops with zero React re-render overhead.

---

## 🕹️ Player Controls

### Desktop Controls
- **W / A / S / D** or **Arrow Keys**: Move the festive character.
- **Mouse Drag (Left or Right Click)**: Rotate camera / look around.
- **[E] Key**: Interact with nearby stalls, games, and diyas.
- **[ESC] Key**: Open Pause Menu & Settings.

### Mobile Touch Controls
- **Virtual Joystick (Bottom Left)**: 360-degree analog character movement.
- **Touch Swipe (Right Side)**: Smooth camera orbit and tilt.
- **Action Button (Bottom Right)**: Contextual tap-to-interact with nearby stalls.

---

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 8
- **3D Graphics:** Three.js + React Three Fiber (`@react-three/fiber`) + Drei (`@react-three/drei`)
- **State Management:** Zustand (optimized selective state subscription without per-frame React re-renders)
- **Styling:** Tailwind CSS (Festive gold, amber, and saffron color palette)
- **Audio Engine:** High-performance procedural Web Audio API (zero external asset dependencies; synthesizes raga drone, balloon pops, rifle shots, fireworks explosions, and diya chimes)
- **Collision & Physics:** Kinematic character physics foundation (gravity, jumping, grounded detection, delta-time independent substeps) + swept-capsule obstacle sliding and boundary clamping
- **Autonomous Living Mela (NPC AI):** Lightweight pedestrian avoidance, obstacle-aware navigation, stall queues (Mithai, Chaat, Ferris Wheel, Balloon booth), and spectator watching behaviors running outside React state for constant 60 FPS
- **Persistence:** Versioned `LocalSaveRepository` with schema validation and fallback recovery
- **Testing:** Vitest (unit tests) & Playwright (browser automation)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Installation
```bash
npm install
```

### Running Locally
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Running Unit Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

---

## 🔮 Future Multiplayer Architecture Roadmap

The project is structured with decoupled state, collision, and event layers to facilitate multiplayer integration:
1. **Network Sync Layer:** Integrate WebSocket client (`socket.io` or `colyseus.js`) to stream player position, heading, and animation state.
2. **Authoritative Room Server:** Validate token awards, balloon hits, and shared fairground events on the server.
3. **Shared Festival Moments:** Synchronize the Grand Fireworks countdown across all visitors in the same mela instance.
