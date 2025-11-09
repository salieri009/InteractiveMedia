# A1B Project Design Document: Interactive Drawing

**Version:** 1.0  
**Author:** GitHub Copilot  
**Date:** October 19, 2025  
**Target Audience:** Senior Software Engineer

---

### 1. Executive Summary

**Project "Interactive Drawing"** is a generative art application that creates a dynamic, composite image based on the user's mouse position. The canvas is divided into four distinct quadrants, each with its own unique drawing logic. This project serves as an exercise in procedural generation, stateful interaction, and the application of color theory to create a cohesive yet varied visual experience.

### 2. Core Concepts & Architecture

- **Modular, Quadrant-Based Logic:** The primary architectural decision is the separation of drawing logic into four distinct functions (`drawQuarter1` through `drawQuarter4`). This makes the code easy to read, debug, and modify, as each visual component is handled by a dedicated function.
- **Direct State-to-Visual Mapping:** The application employs a direct mapping of user input (mouse coordinates) to visual parameters. There is no complex intermediate state; `mouseX` and `mouseY` are used directly in calculations for line weights, colors, and shapes, ensuring immediate and responsive feedback.
- **Color Interpolation:** The project leverages the `lerpColor()` function to create smooth, aesthetically pleasing color gradients and transitions. This is a key technique for binding the disparate visual styles of the quadrants together.

### 3. Component Breakdown

#### 3.1. `A1B.js` Module Structure

```javascript
// --- Module-level State & Configuration ---
let color1, color2, color3, color4; // Base colors for interpolation

// --- Core p5.js Functions ---
function setupA1B() {
  // Initialize canvas and define the base color palette
}

function drawA1B() {
  // Main render loop orchestrates the drawing of the four quadrants
  drawQuarter1(mouseX, mouseY);
  drawQuarter2(mouseX, mouseY);
  drawQuarter3(mouseX, mouseY);
  drawQuarter4(mouseX, mouseY);
}

// --- Quadrant-Specific Drawing Logic ---
function drawQuarter1(x, y) {
  // e.g., Draws lines with weight based on 'y' position
}

function drawQuarter2(x, y) {
  // e.g., Draws circles with size based on 'x' position
}

function drawQuarter3(x, y) {
  // e.g., Fills background with color interpolated based on 'x' and 'y'
}

function drawQuarter4(x, y) {
  // e.g., Draws a grid of shapes with rotation based on distance from center
}

// --- Project Registration ---
// ...
```

#### 3.2. Key Functionality & Logic

- **`drawQuarter1` (Top-Left):** This function might generate a series of horizontal lines. The vertical position of the mouse (`mouseY`) could control the `strokeWeight` of the lines, while the horizontal position (`mouseX`) controls their color, interpolated between two predefined colors.
- **`drawQuarter2` (Top-Right):** This quadrant could feature a pattern of circles. The size of the circles could be mapped to `mouseX`, while their opacity is mapped to `mouseY`, creating a field of shapes that grow and fade in response to mouse movement.
- **`drawQuarter3` (Bottom-Left):** This area could focus on a solid, shifting background color. The final color is determined by a nested `lerpColor()` call, first interpolating horizontally based on `mouseX`, then vertically based on `mouseY`, creating a smooth 2D color gradient.
- **`drawQuarter4` (Bottom-Right):** This function might draw a grid of rotating squares. The angle of rotation for each square could be calculated based on its distance from the current mouse position, creating a wave-like effect as the cursor moves across the grid.

### 4. Integration with `ProjectManager`

- The project is encapsulated within `frontend/js/A1B.js`.
- `setupA1B` and `drawA1B` are the designated entry points called by the `ProjectManager`.
- The project relies on global p5.js functions (e.g., `mouseX`, `mouseY`, `lerpColor`) exposed by the `ProjectManager`, ensuring it operates correctly within the shared p5.js instance. No special event handlers (like `mousePressed`) are required, as the interaction is continuous and based on the draw loop.
