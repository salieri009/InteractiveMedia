# A1H Project Design Document: Corpus Comedian

**Version:** 1.0  
**Author:** GitHub Copilot  
**Date:** October 19, 2025  
**Target Audience:** Senior Software Engineer

---

### 1. Executive Summary

**Project "Corpus Comedian"** is an interactive application that combines natural language processing (NLP), data visualization, and generative text. The user uploads a text file (a "corpus"), which the application analyzes to determine word frequency. It then visualizes this data as a word cloud and uses the most frequent words to generate custom "knock-knock" jokes. This project is unique within the A1 series as it heavily integrates with the browser's DOM for file input and UI, and its logic is primarily data-driven rather than purely graphical.

### 2. Core Concepts & Architecture

- **Three-Module Architecture:** The application is logically divided into three distinct modules:
  1.  **Text Analyzer:** Responsible for processing the raw text input.
  2.  **Joke Generator:** Uses the analyzed data to create generative content.
  3.  **Visualizer:** Renders the data (as a word cloud) and the generated content (the joke) to the canvas.
- **DOM Integration:** Unlike other projects that exist purely within the p5.js canvas, A1H uses p5.js's DOM library to create and manage HTML elements (`<input type="file">`, `<button>`). This requires careful management of element positioning and event handling.
- **Data-Driven Generation:** The output of the joke generator is directly dependent on the output of the text analyzer. The quality and nature of the generated jokes are emergent properties of the input text provided by the user.
- **Stateful UI:** The application uses several state variables (`isFileLoaded`, `showWordCloud`, `jokeState`) to manage what is currently being displayed on the screen, creating a multi-view user experience within a single canvas.

### 3. Component Breakdown

#### 3.1. `A1H.js` Module Structure

```javascript
// --- Module-level State ---
let wordFrequency = new Map();
let topWords = [];
let currentJoke = [];
let jokeState = 0; // FSM for joke animation
let showWordCloud = false; // Toggles between joke and word cloud

// --- UI Elements (p5.Element objects) ---
let fileInput, generateButton, analyzeButton;

// --- Core p5.js Functions ---
function setupA1H() {
  // Create and style DOM elements (buttons, file input)
}

function drawA1H() {
  // Main render loop, acts as a router based on state variables
  // Calls displayJoke(), displayWordCloud(), or displayInstructions()
}

// --- Module 1: Text Analyzer ---
function handleFile(file) { /* ... uses FileReader API ... */ }
function analyzeText(txt) { /* ... populates wordFrequency map ... */ }

// --- Module 2: Joke Generator ---
function generateJoke() { /* ... creates the joke text array ... */ }
function advanceJoke() { /* ... increments jokeState for animation ... */ }

// --- Module 3: Visualizer ---
function displayJoke() { /* ... renders currentJoke based on jokeState ... */ }
function displayWordCloud() { /* ... renders topWords data ... */ }
function displayInstructions() { /* ... renders initial UI text ... */ }

// --- Project Registration ---
// ...
```

#### 3.2. Data Structures

- **`wordFrequency`: `Map<string, number>`**: A hash map used to store the frequency of each word. A `Map` is chosen for its efficient key-value lookup performance.
- **`topWords`: `Array<[string, number]>`**: An array containing the top 20 most frequent words, sorted in descending order. This is derived from `wordFrequency` and serves as the data source for both the word cloud and the joke generator.
- **`currentJoke`: `Array<string>`**: An array of strings, where each string is one line of the generated knock-knock joke.
- **`jokeState`: `number`**: An integer acting as a state pointer for animating the joke display line-by-line.

#### 3.3. Key Functionality & Logic

- **Text Analysis (`analyzeText`)**:
  1.  The input text is converted to lowercase and sanitized by removing punctuation using a regular expression.
  2.  The text is split into an array of words. Short, common words (e.g., "the", "a", "is") are filtered out to improve the quality of the analysis.
  3.  The function iterates through the `words` array, populating the `wordFrequency` map.
  4.  Finally, it converts the map to an array, sorts it by frequency, and takes the top 20 entries to populate `topWords`.
- **DOM Element Management (`setupA1H`)**:
  - `createFileInput()` and `createButton()` are used to generate HTML elements.
  - These elements are positioned absolutely on the page using `.position(x, y)`.
  - Custom styling is applied via the `.style()` method to ensure a consistent look and feel.
  - Event listeners (`.mousePressed()`, or the callback in `createFileInput`) are attached to link the DOM elements to the p5.js logic.
- **Joke Animation (`displayJoke`, `advanceJoke`)**:
  - `generateJoke()` populates the `currentJoke` array and initiates the animation by calling `setTimeout(() => advanceJoke(), ...)`.
  - `advanceJoke()` increments `jokeState` and sets another `setTimeout` to call itself again, creating a timed sequence.
  - `displayJoke()` checks the value of `jokeState` and uses a `for` loop to render only the lines of the joke that should be visible at the current stage of the animation.

### 4. Integration with `ProjectManager`

- This project required an extension of the `ProjectManager`'s global function exposure. `createFileInput`, `createButton`, and `textStyle` constants (`BOLD`, `NORMAL`) had to be added to the list of globally exposed p5.js functions to make them available within the `A1H.js` module.
- The DOM elements created by A1H persist on the page even when another project is active. The `ProjectManager` was updated to include a `cleanup` hook, allowing projects to remove their DOM elements when they are switched away from, preventing UI clutter.
