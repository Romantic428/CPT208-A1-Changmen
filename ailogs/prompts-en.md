# Suzhou Changmen AR Guide Web Application - Complete AI Prompts

---

## Project Overview
Create a Suzhou Changmen AR (Augmented Reality) guide web application using A-Frame + AR.js + WebXR, available on mobile browsers.

---

## Functional Requirements

### 1. AR Reality Display
- Use A-Frame and AR.js to implement real-time camera view
- Overlay 3D navigation elements onto the real scene

### 2. 3D Navigation Arrow
- Display blue navigation arrow on the ground
- Automatically point to the nearest attraction to guide the tour route

### 3. Preset Attraction Coordinates
- Changmen Tower: 31.3222, 120.6292
- Changmen Square: 31.3230, 120.6285
- Canal Dock: 31.3215, 120.6300
- Ancient Theater Site: 31.3218, 120.6280

### 4. GPS Location & Auto-trigger
- Get user's real-time GPS location (browser native geolocation)
- Auto-pop up attraction introduction when entering 100m range
- Use Haversine formula for distance calculation

### 5. AI Voice Synthesis
- Use browser native SpeechSynthesis API
- Auto-read attraction introductions
- Support voice narration on/off toggle
- Voice settings panel: voice selection, speech rate (0.85), pitch (0.8)

### 6. UI Design Style
- Ancient Chinese style, Suzhou garden aesthetic
- Color scheme: Cyan (#2C5F5B), Gray (#6B7280), Cream (#FAF8F5), Gold (#C9A962)
- Mobile-friendly, responsive layout

---

## Technical Implementation

### Tech Stack
- HTML5 + CSS3 + JavaScript (ES6+)
- A-Frame 1.4.0 (3D rendering)
- AR.js (AR functionality)
- Web Speech API (voice synthesis)
- Geolocation API (GPS positioning)

### File Structure
```
├── index.html          # Home page (attraction guide, quiz, souvenir card)
├── ar-guide.html       # AR guide main page
├── style.css           # Style sheet
└── script.js           # Function scripts
```

### Core Modules
1. **Location Module**: Real-time location monitoring, distance calculation to attractions
2. **AR Rendering Module**: 3D markers, navigation arrows, scene rendering
3. **Voice Module**: Speech synthesis, rate/pitch control, toggle management
4. **UI Module**: Popups, status bars, settings panel, interactive buttons

---

## Interface Layout

### AR Scene Layer
- Real-time camera view background
- 3D attraction markers (animated torus + geometry + text labels)
- Blue navigation arrow

### UI Layer
- Top navigation bar: Back button, title, GPS status
- Left panel: Nearest distance display, nearby attractions list
- Right panel: Voice control buttons (settings, toggle, stop)
- Bottom status bar: Voice status, location accuracy
- Popup layer: Attraction introduction modal

---

## Interaction Flow

1. **Launch Phase**: Load AR scene, request location permission
2. **Location Phase**: Get position, calculate distances, update UI
3. **Navigation Phase**: Show arrow pointing to nearest attraction
4. **Trigger Phase**: Enter 100m range → Popup + Voice narration
5. **Interaction Phase**: Repeat playback, adjust voice settings

---

## Code Requirements

### CDN References
- A-Frame: https://aframe.io/releases/1.4.0/aframe.min.js
- AR.js NFT: https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar-nft.js
- AR.js Location: https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar-location.js

### Comment Guidelines
- Add function descriptions before each function
- Add comments for key logic
- Use English comments
- Clear code structure, suitable for course project demonstration

---

## Runtime Environment
- Modern browsers supporting WebRTC
- HTTPS or localhost environment (camera permission required)
- Mobile browsers preferred (mobile-optimized)

---

## Project Highlights

1. **Augmented Reality Guide**: Immersive tour experience
2. **Smart Trigger**: Auto-play narration based on location
3. **Ancient Chinese UI**: Suzhou garden style visual design
4. **Cross-platform**: Pure front-end implementation, no backend required
5. **User-friendly Interaction**: Voice settings, distance display, route guidance


