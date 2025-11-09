# A1A Project Design Document: Eye Tracker

**Version:** 1.0  
**Author:** GitHub Copilot  
**Date:** October 19, 2025  
**Target Audience:** Senior Software Engineer

---

### 1. Executive Summary

**Project "Eye Tracker"** is a foundational graphics demonstration focused on object-oriented programming (OOP) principles and vector mathematics within the p5.js environment. The application renders one or more eyes on the canvas, with pupils that dynamically track the user's mouse cursor. The core technical challenge is constraining the pupil's movement within the circular boundary of its eyeball, providing a clean example of geometry-based state management.

### 2. Core Concepts & Architecture

- **Object-Oriented Design:** The system is built around an `Eye` class, encapsulating all state and behavior related to a single eye. This promotes code reusability and simplifies the management of multiple eyes.
- **Vector-Based Logic:** Pupil positioning is calculated using vector operations. The direction from the eye's center to the mouse is determined, and the pupil's position is set along this vector, clamped to a maximum distance to keep it within the eyeball's radius.
- **Scalable State Management:** A simple array, `eyes`, serves as the container for all `Eye` class instances. The main draw loop iterates over this array, decoupling the rendering logic from the number of eyes being displayed.

### 3. Component Breakdown

#### 3.1. `A1A.js` Module Structure

```javascript
// --- Module-level State ---
let eyes = []; // Array to hold all Eye objects
const eyeProperties = [ /* ... configuration data ... */ ];

// --- Core Class ---
class Eye {
  constructor(x, y, radius) {
    this.position = createVector(x, y);
    this.radius = radius;
    this.pupilRadius = radius / 2.5;
  }

  // Calculates pupil position and renders the eye
  display() { /* ... */ }
  
  // Contains the vector math for pupil tracking
  _calculatePupilPosition() { /* ... */ }
}

// --- Core p5.js Functions ---
function setupA1A() {
  // Initialize and populate the 'eyes' array
}

function drawA1A() {
  // Loop through 'eyes' and call display() on each
}

// --- Project Registration ---
// ...
```

#### 3.2. Data Structures

- **`eyes`: `Array<Eye>`**: The primary data structure holding the collection of `Eye` objects to be rendered.
- **`Eye.position`: `p5.Vector`**: Stores the (x, y) coordinates of the center of the eyeball.
- **`Eye.radius`: `number`**: Defines the size of the eyeball.

#### 3.3. Key Functionality & Logic

- **`_calculatePupilPosition()`**: This private helper method is the core of the project.
  1.  Define a vector for the mouse position: `let mouse = createVector(mouseX, mouseY);`
  2.  Calculate the direction vector from the eye's center to the mouse: `let dir = p5.Vector.sub(mouse, this.position);`
  3.  Determine the maximum distance the pupil can travel from the center: `let maxDist = this.radius - this.pupilRadius;`
  4.  Use `constrain(dir.mag(), 0, maxDist)` to determine the actual distance.
  5.  Set the magnitude of the direction vector to this constrained distance: `dir.setMag(constrainedDist);`
  6.  The final pupil position is the eye's center plus the new direction vector: `let pupilPos = p5.Vector.add(this.position, dir);`

### 4. Integration with `ProjectManager`

- The project is fully encapsulated within `frontend/js/A1A.js`.
- `setupA1A` is responsible for creating the canvas and initializing all `Eye` objects.
- `drawA1A` is called by the `ProjectManager`'s main loop and handles the rendering for each frame.
- All p5.js functions are accessed via the `window` object, ensuring compatibility with the instance-mode framework.
