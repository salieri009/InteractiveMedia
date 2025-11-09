# A1D Project Design Document: Rotating Squares

**Version:** 1.0  
**Author:** GitHub Copilot  
**Date:** October 19, 2025  
**Target Audience:** Junior Developer, Project Manager

---

### 1. Executive Summary

**Project "Rotating Squares"** is a minimal, animated graphics demonstration. Its primary purpose is to serve as a clean, understandable template and placeholder within the larger interactive media project. It showcases fundamental p5.js concepts, including procedural animation and the use of the transformation matrix, in a clear and concise manner.

### 2. Core Concepts & Architecture

- **Procedural Animation:** The animation is not keyframed but is generated procedurally. The rotation angle is calculated in real-time based on the `frameCount`, a continuously incrementing variable provided by p5.js. This creates a smooth, perpetual rotation without complex state management.
- **Transformation Matrix:** The project relies on p5.js's transformation stack (`push()`, `pop()`, `translate()`, `rotate()`) to perform the animation. This is a fundamental concept in 2D/3D graphics that simplifies the process of drawing objects relative to a transformed coordinate system, rather than calculating new vertex positions manually.
- **Architectural Minimalism:** The code is intentionally simple, consisting only of a `setupA1D` and `drawA1D` function. This makes it an ideal starting point for new projects and a clear example of the basic structure required for integration with the `ProjectManager`.

### 3. Component Breakdown

#### 3.1. `A1D.js` Module Structure

```javascript
// --- No Module-level State Required ---

// --- Core p5.js Functions ---
function setupA1D() {
  // Basic canvas and color mode setup.
  // Sets rect mode to CENTER for easier rotation.
}

function drawA1D() {
  // Main render loop.
  // Clears background, applies transformations, and draws the shape.
}

// --- Project Registration ---
// ...
```

#### 3.2. Key Functionality & Logic

- **`setupA1D()`**:
  - Initializes the canvas.
  - Sets `rectMode(CENTER)`. This is a crucial step that makes `rect()` draw from its center point, ensuring that rotation occurs around the object's geometric center.
- **`drawA1D()`**:
  1.  **Clear Canvas:** `background(0)` is called to clear the previous frame and prevent smearing.
  2.  **Save State:** `push()` is called to save the current state of the transformation matrix.
  3.  **Translate:** `translate(width / 2, height / 2)` moves the origin `(0,0)` to the center of the canvas. All subsequent drawing operations will be relative to this new origin.
  4.  **Rotate:** `rotate(frameCount * 0.01)` rotates the coordinate system. The angle is a function of time (`frameCount`), and `0.01` is a magic number that controls the speed of rotation.
  5.  **Draw Shape:** `rect(0, 0, 100, 100)` draws the square. Because the origin has been moved to the center of the canvas, drawing at `(0,0)` places it exactly in the middle.
  6.  **Restore State:** `pop()` is called to restore the transformation matrix to its original state, preventing the transformations from affecting other potential drawing operations.

### 4. Integration with `ProjectManager`

- The project is fully encapsulated within `frontend/js/A1D.js`.
- It serves as the most basic example of a valid project module for the `ProjectManager`.
- `setupA1D` and `drawA1D` are the only required entry points, and they are called automatically by the `ProjectManager` when the project is active.
- Its simplicity makes it an excellent tool for debugging the `ProjectManager` itself, as it has minimal dependencies and a predictable output.
