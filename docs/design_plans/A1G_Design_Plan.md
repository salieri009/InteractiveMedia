# A1G Project Design Document: Interactive Pixel Sort

**Version:** 1.0  
**Author:** GitHub Copilot  
**Date:** October 19, 2025  
**Target Audience:** Senior Software Engineer

---

### 1. Executive Summary

**Project "Interactive Pixel Sort"** is a creative coding project focused on image processing and interactive art. The application loads an image, applies a pixel-sorting algorithm to it, and displays both the original and sorted versions. The user can then "sample" colors from the sorted image with their mouse and "paint" with them on the canvas, creating a trail of generative shapes. The project demonstrates handling of pixel data, implementation of a sorting algorithm, and state management for an interactive painting tool.

### 2. Core Concepts & Architecture

- **Image Data Manipulation:** The core of the project involves direct manipulation of an image's pixel data. The `loadPixels()` and `updatePixels()` functions are used to read pixel data into the `pixels` array for processing and then write it back to the image for display.
- **Off-Screen Graphics Buffers:** The system uses `p5.Image` and `p5.Graphics` objects (`img` and `sortedImg`) to act as off-screen buffers. This allows the original image to be preserved while the sorting algorithm operates on a copy.
- **Sorting Algorithm:** A custom sorting function is implemented. It can operate on either rows or columns of the image and can sort pixels based on different metrics (e.g., brightness, hue).
- **Interactive Painting System:** A simple particle system (`trailShapes`) is used to create the painting effect. When the user clicks and drags, new "particle" objects are added to this array, each capturing the currently sampled color. These particles have a limited lifespan and fade over time.

### 3. Component Breakdown

#### 3.1. `A1G.js` Module Structure

```javascript
// --- Module-level State ---
let img, sortedImg; // p5.Image buffers
let currentPixelColor;
let sortMode = 'brightness'; // 'brightness' or 'hue'
let sortDirection = 'horizontal'; // 'horizontal' or 'vertical'
let trailShapes = []; // Array for paint particles

// --- Core p5.js Functions ---
function setupA1G() {
  // Load the initial image (either from a file or procedurally generated)
  // Initialize 'sortedImg' as a copy
}

function drawA1G() {
  // 1. Display original and sorted images
  // 2. Sample color from 'sortedImg' based on mouse position
  // 3. If mouse is pressed, add a new shape to 'trailShapes'
  // 4. Update and render all shapes in 'trailShapes', removing dead ones
  // 5. Display UI text and color swatch
}

function keyPressedA1G() {
  // Handle key presses to change 'sortMode' or 'sortDirection'
  // and re-run performPixelSort()
}

// --- Internal Logic ---
function performPixelSort() {
  // The main sorting algorithm
}

// --- Project Registration ---
// ...
```

#### 3.2. Data Structures

- **`img`, `sortedImg`: `p5.Image`**: Graphics buffers that store the pixel data for the original and manipulated images.
- **`trailShapes`: `Array<Object>`**: An array of plain JavaScript objects, where each object represents a painted shape and has properties like `x`, `y`, `color`, `size`, and `life`.

#### 3.3. Key Functionality & Logic

- **`performPixelSort()`**:
  1.  Calls `sortedImg.loadPixels()` to populate the `sortedImg.pixels` array.
  2.  **Outer Loop:** Iterates through either rows (`y`) or columns (`x`) based on `sortDirection`.
  3.  **Inner Loop (Data Extraction):** For each row/column, it iterates through the pixels, extracts their RGBA values, and stores them in a temporary array (e.g., `let rowData = []`).
  4.  **Sort:** It calls `rowData.sort()` with a custom comparator function. The comparator checks the global `sortMode` variable to decide whether to compare pixels based on brightness `(r+g+b)/3` or hue `hue(color(r,g,b))`.
  5.  **Inner Loop (Data Injection):** After the temporary array is sorted, it iterates through it and writes the sorted pixel data back into the correct positions in the `sortedImg.pixels` array.
  6.  Finally, it calls `sortedImg.updatePixels()` to apply the changes to the image buffer so it can be drawn to the canvas.
- **Interactive Painting (`drawA1G`)**:
  - **Sampling:** Checks if the mouse is within the bounds of the `sortedImg`. If so, it uses `sortedImg.get(x, y)` to retrieve the color of the pixel under the cursor.
  - **Generation:** If `mouseIsPressed` is true, it creates a new object with the current mouse coordinates and the sampled color, and pushes it to the `trailShapes` array.
  - **Lifecycle:** It loops backwards through `trailShapes`, reduces the `life` property of each shape, and removes it with `splice()` if `life <= 0`.

### 4. Integration with `ProjectManager`

- The project is encapsulated within `frontend/js/A1G.js`.
- `setupA1G` handles the loading of image assets, which can be an asynchronous operation. The `drawA1G` function includes a check to ensure `img` is loaded before attempting to render, displaying a "Loading..." message if necessary.
- `drawA1G` and `keyPressedA1G` are the hooks called by the `ProjectManager`.
- The project relies on a wide range of globally exposed p5.js functions, including `loadImage`, `loadPixels`, `updatePixels`, `get`, and color functions like `hue`.
