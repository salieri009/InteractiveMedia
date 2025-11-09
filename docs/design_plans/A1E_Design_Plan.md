# A1E Project Design Document: Sound-Painted Night Sky

**Version:** 1.0  
**Author:** GitHub Copilot  
**Date:** October 19, 2025  
**Target Audience:** Senior Software Engineer

---

### 1. Executive Summary

**Project "Sound-Painted Night Sky"** is an advanced audio-reactive visualization that generates a dynamic celestial scene based on live microphone input. The application listens for ambient sound levels and uses this data to trigger the creation of stars, meteor showers, and other visual effects. This project demonstrates the integration of external hardware (a microphone), management of multiple complex particle systems, and the implementation of object lifecycles within a p5.js application.

### 2. Core Concepts & Architecture

- **Audio-Reactive System:** The core of the application is its ability to react to sound. It uses the `p5.AudioIn` library to capture microphone input and measures the amplitude (volume). This amplitude value serves as the primary trigger for all generative events.
- **Multiple Particle Systems:** The architecture manages several distinct arrays of objects (`stars`, `meteors`, `ripples`), each representing a different visual element. This separation allows for independent logic, rendering, and lifecycle management for each type of effect.
- **Object Lifecycle Management:** Every generated object (e.g., a `Star` or `Meteor`) is designed with a finite lifecycle. They have properties like `lifespan` or `alpha` that decay over time. The main draw loop is responsible for updating these objects and removing them from their respective arrays once they "die," preventing memory leaks and performance degradation.
- **Event-Driven Generation:** New visual elements are not created on a fixed schedule but are generated in response to events—specifically, when the microphone input level crosses a predefined threshold. This creates a more organic and responsive user experience.

### 3. Component Breakdown

#### 3.1. `A1E.js` Module Structure

```javascript
// --- Module-level State ---
let mic; // p5.AudioIn object
let stars = [];
let meteors = [];
let ripples = [];
const volumeThreshold = 0.1;

// --- Core Classes ---
class Star { /* ... has position, size, lifespan ... */ }
class Meteor { /* ... has start/end position, velocity, lifespan ... */ }
class Ripple { /* ... has center, radius, lifespan ... */ }

// --- Core p5.js Functions ---
function setupA1E() {
  // Initialize mic, get user permission for audio
}

function drawA1E() {
  // Get mic level, check threshold, and update/render all particle systems
}

function mousePressedA1E() {
  // e.g., create a constellation or a ripple effect
}

// --- Internal Logic ---
function checkAudioInput() {
  let vol = mic.getLevel();
  if (vol > volumeThreshold) {
    // Add new Star or Meteor objects to their arrays
  }
}

function manageParticles(particleArray) {
  // Loop backwards to safely remove dead particles
  for (let i = particleArray.length - 1; i >= 0; i--) {
    let p = particleArray[i];
    p.update();
    p.display();
    if (p.isDead()) {
      particleArray.splice(i, 1);
    }
  }
}

// --- Project Registration ---
// ...
```

#### 3.2. Data Structures

- **`mic`: `p5.AudioIn`**: The object that provides access to the raw microphone input stream.
- **`stars`, `meteors`, `ripples`: `Array<Object>`**: Three separate arrays, each holding instances of their respective classes. This separation is key to managing the different behaviors and rendering logic.

#### 3.3. Key Functionality & Logic

- **Audio Input (`setupA1E`, `checkAudioInput`)**:
  - In `setupA1E`, `mic = new p5.AudioIn()` is created, and `mic.start()` is called. This will typically trigger a browser permission prompt for microphone access.
  - In `drawA1E`, `mic.getLevel()` is called every frame to get the current amplitude (a float between 0 and 1).
  - This value is compared against `volumeThreshold`. If it's higher, a new `Star` or `Meteor` is instantiated and pushed into the appropriate array.
- **Particle Management (`drawA1E`, `manageParticles`)**:
  - The main draw loop delegates the management of each particle system to a generic `manageParticles` function.
  - This function iterates through its given array **backwards**. This is a critical pattern for safely removing items from an array while iterating over it.
  - For each particle, it calls its `update()` and `display()` methods.
  - It then checks an `isDead()` method (e.g., `this.lifespan <= 0`). If true, it removes the particle from the array using `splice(i, 1)`.
- **Object Behavior (`Star`, `Meteor` classes)**:
  - **`Star`**: A simple particle. Its `update()` method might make it twinkle (e.g., by oscillating its alpha or size), and its `lifespan` decreases each frame.
  - **`Meteor`**: A more complex particle. Its `update()` method changes its position based on a `velocity` vector. It might also have a "tail" effect, which could be implemented by drawing a fading line or a series of smaller particles.

### 4. Integration with `ProjectManager`

- The project is encapsulated in `frontend/js/A1E.js`.
- `setupA1E` handles the potentially asynchronous nature of requesting microphone permission. The `ProjectManager` must be able to accommodate a project that may have a brief initialization delay.
- `drawA1E` and `mousePressedA1E` are called by the `ProjectManager`, ensuring audio processing and interaction only occur when the project is active.
- The `ProjectManager` must also handle cleanup. When switching away from A1E, `mic.stop()` should be called to release the microphone resource. This requires adding a `cleanup` or `stop` hook to the project registration object.
