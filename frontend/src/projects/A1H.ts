/**
 * A1H ??Corpus Comedian
 *
 * Analyses a text file for word frequency and generates knock-knock jokes
 * from the most common words. Visualises word frequency as a word cloud.
 *
 * Controls:
 *  "Load Demo Text" button ??use the built-in food-recommendation corpus
 *  File input              ??upload a .txt file
 *  "Generate Joke" button  ??generate a new knock-knock joke
 *  "View Word Analysis" button ??toggle word-cloud view
 *
 * @author Interactive Media Assignment ??UTS 2025
 * @since v2.0.0
 */

/** Window extension for global project manager access. */

/* ================================================================
   Interfaces
   ================================================================ */

interface IWordCloudEntry {
  word:  string;
  freq:  number;
  x:     number;
  y:     number;
  size:  number;
  color: p5.Color;
}

/* ================================================================
   Particle class ??visual burst effect
   ================================================================ */

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: { r: number; g: number; b: number };

  constructor(x: number, y: number) {
    this.x     = x;
    this.y     = y;
    this.vx    = window.random(-2, 2);
    this.vy    = window.random(-3, -1);
    this.alpha = 255;
    this.size  = window.random(3, 8);
    this.color = {
      r: window.random(200, 255),
      g: window.random(150, 255),
      b: window.random(100, 200),
    };
  }

  update(): void {
    this.x  += this.vx;
    this.y  += this.vy;
    this.vy += 0.1; // gravity
    this.alpha -= 3;
  }

  display(): void {
    window.push();
    window.noStroke();
    window.fill(this.color.r, this.color.g, this.color.b, this.alpha);
    window.circle(this.x, this.y, this.size);
    window.pop();
  }

  isDead(): boolean { return this.alpha <= 0; }
}

/* ================================================================
   Module state
   ================================================================ */

let wordFrequency:   Map<string, number>    = new Map();
let topWords:        Array<[string, number]> = [];
let currentJoke:     string[]              = [];
let jokeState        = 0;

let fileInput:       p5.Element | null = null;
let generateButton:  p5.Element | null = null;
let analyzeButton:   p5.Element | null = null;

let particles:       Particle[]         = [];
let wordCloudData:   IWordCloudEntry[]  = [];

let isFileLoaded      = false;
let fileName          = '';
let showWordCloud     = false;
let totalWords        = 0;
let animationProgress = 0;
let punchlineScale    = 1;

let backgroundColor:  p5.Color;
let accentColor:      p5.Color;
let titleColor:       p5.Color;

/* ================================================================
   Setup
   ================================================================ */

function setupA1H(): void {
  console.log('A1H - Corpus Comedian setup started');

  backgroundColor = window.color(20, 24, 35);
  accentColor     = window.color(100, 200, 255);
  titleColor      = window.color(255, 220, 100);

  fileInput = window.createFileInput(handleFile);
  fileInput.position(30, 80);
  styleButton(fileInput, '#2d3548', '2px solid #4a5568');

  analyzeButton = window.createButton('View Word Analysis');
  analyzeButton.position(30, 130);
  (analyzeButton as p5.Element & { mousePressed: (fn: () => void) => void }).mousePressed(toggleWordCloud);
  styleButton(analyzeButton, '#4a90e2');
  analyzeButton.hide();

  generateButton = window.createButton('Generate Joke');
  generateButton.position(30, 180);
  (generateButton as p5.Element & { mousePressed: (fn: () => void) => void }).mousePressed(generateJoke);
  styleButton(generateButton, '#e74c3c');
  generateButton.hide();

  const demoButton = window.createButton('Load Demo Text');
  demoButton.position(30, 230);
  (demoButton as p5.Element & { mousePressed: (fn: () => void) => void }).mousePressed(loadDemoText);
  styleButton(demoButton, '#27ae60');

  window.textAlign(window.CENTER, window.CENTER);

  console.log('A1H project initialised');
}

/* ================================================================
   Draw
   ================================================================ */

function drawA1H(): void {
  window.background(backgroundColor);

  // Title
  window.push();
  window.fill(titleColor);
  window.textSize(42);
  if (typeof window.textStyle === 'function') window.textStyle(window.BOLD);
  window.text('Corpus Comedian', width / 2, 40);
  window.textSize(16);
  window.fill(200);
  if (typeof window.textStyle === 'function') window.textStyle(window.NORMAL);
  window.text('Upload a text file to generate custom knock-knock jokes!', width / 2, 75);
  window.pop();

  if (isFileLoaded) {
    window.push();
    window.fill(150, 255, 150);
    window.textSize(14);
    window.text(`File loaded: ${fileName} (${totalWords} words)`, width / 2, 120);
    window.pop();
  }

  if (showWordCloud && topWords.length > 0) {
    displayWordCloud();
  } else if (jokeState > 0) {
    displayJoke();
  } else if (!isFileLoaded) {
    displayInstructions();
  }

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) particles.splice(i, 1);
  }

  if (jokeState === 5) {
    animationProgress += 0.05;
    punchlineScale = 1 + 0.3 * window.sin(animationProgress);
  }
}

/* ================================================================
   Text analysis
   ================================================================ */

function loadDemoText(): void {
  const demoText = `Food Recommendations for Today

Welcome to your daily food guide. Consider having scrambled eggs with whole wheat toast. Eggs are an excellent source of protein. Greek yogurt with honey and mixed berries provides protein while berries add natural sweetness. Oatmeal with sliced bananas and walnuts gives sustained energy throughout the morning.

For lunch, consider a hearty salad with grilled chicken or salmon. Fresh salad greens topped with protein make a balanced meal. Add quinoa or brown rice to make the salad more filling. A sandwich with turkey and avocado on whole grain bread with lettuce and tomato provides lean protein and healthy fats.

Dinner should be satisfying but not too heavy. Grilled salmon with roasted vegetables provides omega-3 fatty acids and fiber. Pasta with marinara sauce, fresh basil, and grilled vegetables is always popular. A simple caprese salad complements pasta perfectly.

Between meals, healthy snacks help maintain your energy. Fresh fruit like apples and bananas are perfect portable snacks. Hummus with carrot sticks and cucumber slices makes a crunchy satisfying snack. Greek yogurt with granola and fresh berries serves as both a snack and a light dessert.`;

  fileName = 'Demo: Food Recommendations';
  analyzeText(demoText);
  isFileLoaded = true;
  generateButton?.show();
  analyzeButton?.show();
  createParticleBurst(width / 2, 120);
  console.log('Demo text loaded');
}

function handleFile(file: p5.File): void {
  if (file.type === 'text') {
    fileName = file.name;
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>): void => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        analyzeText(result);
        isFileLoaded = true;
        generateButton?.show();
        analyzeButton?.show();
        createParticleBurst(width / 2, 120);
      }
    };
    reader.readAsText(file.file);
  } else {
    alert('Please upload a text file (.txt)');
  }
}

function analyzeText(txt: string): void {
  wordFrequency.clear();

  const words = txt
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .split(/\s+/)
    .filter((w): boolean => w.length > 2);

  totalWords = words.length;
  for (const word of words) {
    wordFrequency.set(word, (wordFrequency.get(word) ?? 0) + 1);
  }

  topWords = Array.from(wordFrequency.entries())
    .sort((a, b): number => b[1] - a[1])
    .slice(0, 20);

  wordCloudData = topWords.map((entry): IWordCloudEntry => ({
    word:  entry[0],
    freq:  entry[1],
    x:     window.random(200, width - 200),
    y:     window.random(250, height - 100),
    size:  window.map(entry[1], topWords[topWords.length - 1][1], topWords[0][1], 16, 60),
    color: window.color(window.random(100, 255), window.random(100, 255), window.random(150, 255)),
  }));
}

/* ================================================================
   Joke generator
   ================================================================ */

function generateJoke(): void {
  if (topWords.length === 0) return;

  showWordCloud     = false;
  jokeState         = 0;
  currentJoke       = [];
  animationProgress = 0;

  const chosen      = topWords[Math.floor(window.random(Math.min(10, topWords.length)))][0];
  const freq        = wordFrequency.get(chosen) ?? 0;
  const capitalised = chosen.charAt(0).toUpperCase() + chosen.slice(1);

  currentJoke = [
    'Knock knock!',
    "Who's there?",
    capitalised,
    `${capitalised} who?`,
    `${capitalised}??it appears ${freq} times in your text!`,
  ];

  setTimeout((): void => { advanceJoke(); }, 800);
}

function advanceJoke(): void {
  jokeState++;
  if (jokeState <= 5) {
    createParticleBurst(width / 2, height / 2);
    if (jokeState < 5) {
      setTimeout((): void => { advanceJoke(); }, jokeState === 2 ? 1200 : 1500);
    }
  }
}

/* ================================================================
   Visualisers
   ================================================================ */

function displayJoke(): void {
  if (currentJoke.length === 0) return;

  let yOffset = 280;
  for (let i = 0; i < jokeState && i < currentJoke.length; i++) {
    window.push();

    if (i === 0 || i === 2) {
      window.fill(accentColor);
      window.textSize(32);
      if (typeof window.textStyle === 'function') window.textStyle(window.BOLD);
    } else if (i === 4) {
      window.fill(255, 220, 100);
      window.textSize(28 * punchlineScale);
      if (typeof window.textStyle === 'function') window.textStyle(window.BOLD);
    } else {
      window.fill(255);
      window.textSize(24);
      if (typeof window.textStyle === 'function') window.textStyle(window.NORMAL);
    }

    window.text(currentJoke[i], width / 2, yOffset);
    yOffset += i === 4 ? 80 : 60;
    window.pop();
  }

  if (jokeState >= 5) {
    window.push();
    window.fill(150);
    window.textSize(14);
    window.text('Click the button to generate another joke', width / 2, height - 40);
    window.pop();
  }
}

function displayWordCloud(): void {
  window.push();
  window.fill(255);
  window.textSize(28);
  if (typeof window.textStyle === 'function') window.textStyle(window.BOLD);
  window.text('Most Frequent Words', width / 2, 180);
  window.pop();

  wordCloudData.forEach((data): void => {
    window.push();
    try {
      window.fill(window.red(data.color), window.green(data.color), window.blue(data.color));
    } catch { window.fill(data.color); }
    window.textSize(data.size);
    if (typeof window.textStyle === 'function') window.textStyle(window.BOLD);
    window.text(data.word, data.x, data.y);
    window.fill(200);
    window.textSize(12);
    window.text(`(${data.freq})`, data.x, data.y + data.size / 2 + 10);
    window.pop();
  });

  window.push();
  window.fill(150);
  window.textSize(14);
  window.text('Word size represents frequency in the text', width / 2, height - 40);
  window.pop();
}

function displayInstructions(): void {
  window.push();
  window.fill(200); window.textSize(20);
  window.text('Choose an option:', width / 2, 280);
  window.pop();

  window.push();
  window.fill(accentColor); window.textSize(18);
  if (typeof window.textStyle === 'function') window.textStyle(window.BOLD);
  window.text('Load Demo Text', width / 2, 330);
  window.fill(200); window.textSize(14);
  if (typeof window.textStyle === 'function') window.textStyle(window.NORMAL);
  window.text('Quick start with food recommendations', width / 2, 360);
  window.pop();

  window.push();
  window.fill(150); window.textSize(18);
  window.text('OR', width / 2, 400);
  window.pop();

  window.push();
  window.fill(titleColor); window.textSize(18);
  if (typeof window.textStyle === 'function') window.textStyle(window.BOLD);
  window.text('Upload Your Own Text File', width / 2, 440);
  window.fill(200); window.textSize(14);
  if (typeof window.textStyle === 'function') window.textStyle(window.NORMAL);
  window.text('Novels, articles, essays ??any .txt file works!', width / 2, 470);
  window.pop();

  window.push();
  window.fill(accentColor); window.textSize(12);
  window.text('Tip: Longer texts create more interesting jokes', width / 2, 520);
  window.pop();
}

function toggleWordCloud(): void {
  showWordCloud = !showWordCloud;
  jokeState = 0;
  analyzeButton?.html(showWordCloud ? 'Back to Jokes' : 'View Word Analysis');
}

function createParticleBurst(x: number, y: number): void {
  for (let i = 0; i < 20; i++) {
    particles.push(new Particle(x, y));
  }
}

function styleButton(btn: p5.Element, bgColor: string, border = 'none'): void {
  btn.style('background-color', bgColor);
  btn.style('color', '#fff');
  btn.style('border', border);
  btn.style('padding', '12px 24px');
  btn.style('border-radius', '8px');
  btn.style('cursor', 'pointer');
  btn.style('font-size', '14px');
  btn.style('font-weight', 'bold');
}

/* ================================================================
   Cleanup ??remove p5 DOM elements on project switch
   ================================================================ */

function cleanupA1H(): void {
  fileInput?.remove();
  analyzeButton?.remove();
  generateButton?.remove();
  fileInput     = null;
  analyzeButton = null;
  generateButton = null;
}

/* ================================================================
   Project registration
   ================================================================ */

window.projectManager.registerProject(
  'a1h',
  'A1H - Corpus Comedian',
  setupA1H,
  drawA1H,
  {
    cleanup:     cleanupA1H,
    description: 'Text analysis and joke generator. Upload a text file to analyse word frequency and generate custom knock-knock jokes.',
    canvasSize:  { width: 900, height: 700 },
  }
);
