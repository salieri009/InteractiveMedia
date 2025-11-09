# A1C Project Design Document: Order & Chaos

**Version:** 1.0  
**Author:** GitHub Copilot  
**Date:** October 19, 2025  
**Target Audience:** Senior Software Engineer

---

### 1. Executive Summary

**Project "Order & Chaos"** is a generative art system that explores the dualistic themes of structure and randomness. The application renders a field of dice, which can be displayed in a perfectly aligned grid ("Order") or scattered randomly across the canvas ("Chaos"). This project serves as an excellent case study for state management, object-oriented design, and event-driven interaction in a p5.js context.

### 2. Core Concepts & Architecture

- **Finite State Machine (FSM):** The application's core is a simple FSM with two primary states: `'order'` and `'chaos'`. A single state variable, `mode`, controls which rendering logic is executed, providing a clear and robust mechanism for switching between the two visual styles.
- **Object-Oriented Design:** A `Dice` class is used to encapsulate the properties and drawing logic of a single die. This includes its position, rotation, and current face value. This approach simplifies the main application logic, which becomes responsible only for managing a collection of `Dice` objects.
- **Event-Driven Interaction:** The system state is manipulated via user input. `mousePressed` is used to trigger a "roll" event, which randomizes the state of all dice, while `keyPressed` is used to toggle the global `mode` between `'order'` and `'chaos'`.

### 3. Component Breakdown

#### 3.1. `A1C.js` Module Structure

```javascript
// --- Module-level State ---
let dice = []; // Array to hold all Dice objects
let mode = 'order'; // Initial state: 'order' or 'chaos'

// --- Core Class ---
class Dice {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.value = 1;
    this.angle = 0;
  }

  // Randomizes the die's value
  roll() {
    this.value = floor(random(1, 7));
  }

  // Renders the die based on its value and position
  display() { /* ... */ }
}

// --- Core p5.js Functions ---
function setupA1C() {
  // Initialize the 'dice' array
}

function drawA1C() {
  // Main render loop, checks 'mode' to decide rendering logic
  if (mode === 'order') {
    drawOrder();
  } else {
    drawChaos();
  }
}

function mousePressedA1C() {
  // Trigger roll() on all dice
}

function keyPressedA1C() {
  // Toggle the 'mode' variable
}

// --- Internal Logic ---
function drawOrder() { /* ... */ }
function drawChaos() { /* ... */ }

// --- Project Registration ---
// ...
```

#### 3.2. Data Structures

- **`dice`: `Array<Dice>`**: The primary collection of `Dice` objects.
- **`mode`: `string`**: A state variable holding either `'order'` or `'chaos'`.
- **`Dice.value`: `number`**: An integer from 1 to 6 representing the die's face.

#### 3.3. Key Functionality & Logic

- **State Management (`drawA1C`)**: The main draw loop is a simple conditional that checks the `mode` variable. It delegates the entire rendering process to either `drawOrder()` or `drawChaos()`, cleanly separating the two concerns.
- **`drawOrder()`**:
  1.  Iterates through the `dice` array with a simple `for` loop.
  2.  Calculates a grid position for each die based on its index (e.g., using `i % cols` and `floor(i / cols)`).
  3.  Sets the `x` and `y` properties of each `Dice` object to its calculated grid position.
  4.  Sets the `angle` to `0` to ensure perfect alignment.
  5.  Calls `die.display()`.
- **`drawChaos()`**:
  1.  In `setupA1C` or when switching to chaos mode for the first time, each die is assigned a random `x`, `y`, and `angle`.
  2.  The `drawChaos()` function simply iterates through the `dice` array and calls `die.display()`, using the pre-randomized position and angle properties.
- **`mousePressedA1C()`**: This function iterates through the `dice` array and calls the `roll()` method on each `Dice` object, updating their `value` property.
- **`keyPressedA1C()`**: This function toggles the `mode` variable. A simple ternary operator is sufficient: `mode = (mode === 'order') ? 'chaos' : 'order';`.

### 4. Integration with `ProjectManager`

- The project is encapsulated within `frontend/js/A1C.js`.
- The `ProjectManager` calls `setupA1C`, `drawA1C`, and passes user input to `mousePressedA1C` and `keyPressedA1C`. This ensures the event handlers are only active when A1C is the current project.
- The code relies on the globally exposed p5.js functions for drawing and random number generation.
