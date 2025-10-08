// ===============================================
// A1H - Corpus Comedian (Text Analysis & Joke Generator)
// Creative Project: Text file analyzer that generates knock-knock jokes based on word frequency
// Combines text analysis, data visualization, and interactive humor generation
// ===============================================

// Core data structures for text analysis
let wordFrequency = new Map();
let topWords = [];
let currentJoke = [];
let jokeState = 0;

// UI elements
let fileInput;
let generateButton;
let analyzeButton;

// Visual elements
let particles = [];
let wordCloudData = [];

// State variables
let isFileLoaded = false;
let fileName = '';
let showWordCloud = false;
let sourceText = '';
let totalWords = 0;
let animationProgress = 0;
let punchlineScale = 1;

// Color scheme
let backgroundColor;
let accentColor;
let titleColor;

// Particle class for visual effects
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-2, 2);
    this.vy = random(-3, -1);
    this.alpha = 255;
    this.size = random(3, 8);
    this.color = color(random(200, 255), random(150, 255), random(100, 200));
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // Gravity
    this.alpha -= 3;
  }

  display() {
    push();
    noStroke();
    fill(red(this.color), green(this.color), blue(this.color), this.alpha);
    circle(this.x, this.y, this.size);
    pop();
  }

  isDead() {
    return this.alpha <= 0;
  }
}

function setupA1H() {
  console.log("🎪 A1H - Corpus Comedian setup started!");
  
  // Check if p5.js functions are available
  if (typeof background === 'undefined') {
    console.error('❌ p5.js not loaded! background function not available.');
    return;
  }

  backgroundColor = color(20, 24, 35);
  accentColor = color(100, 200, 255);
  titleColor = color(255, 220, 100);

  // Create UI elements
  fileInput = createFileInput(handleFile);
  fileInput.position(30, 80);
  styleButton(fileInput, '#2d3548', '2px solid #4a5568');

  analyzeButton = createButton('📊 View Word Analysis');
  analyzeButton.position(30, 130);
  analyzeButton.mousePressed(toggleWordCloud);
  styleButton(analyzeButton, '#4a90e2');
  analyzeButton.hide();

  generateButton = createButton('🎭 Generate Joke');
  generateButton.position(30, 180);
  generateButton.mousePressed(generateJoke);
  styleButton(generateButton, '#e74c3c');
  generateButton.hide();
  
  // Add button to load demo text
  let demoButton = createButton('📝 Load Demo Text');
  demoButton.position(30, 230);
  demoButton.mousePressed(loadDemoText);
  styleButton(demoButton, '#27ae60');

  textAlign(CENTER, CENTER);
  
  console.log("✅ A1H project initialized successfully!");
}

function drawA1H() {
  // Check if p5.js functions are available
  if (typeof background === 'undefined') {
    console.error('❌ p5.js functions not available in drawA1H!');
    return;
  }

  background(backgroundColor);

  // Title
  push();
  fill(titleColor);
  textSize(42);
  textStyle(BOLD);
  text('🎪 Corpus Comedian', width / 2, 40);
  textSize(16);
  fill(200);
  textStyle(NORMAL);
  text('Upload a text file to generate custom knock-knock jokes!', width / 2, 75);
  pop();

  if (isFileLoaded) {
    push();
    fill(150, 255, 150);
    textSize(14);
    text(`✓ File loaded: ${fileName} (${totalWords} words)`, width / 2, 120);
    pop();
  }

  if (showWordCloud && topWords.length > 0) {
    displayWordCloud();
  } else if (jokeState > 0) {
    displayJoke();
  } else if (!isFileLoaded) {
    displayInstructions();
  }

  // Particle update
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].isDead()) particles.splice(i, 1);
  }

  if (jokeState === 5) {
    animationProgress += 0.05;
    punchlineScale = 1 + 0.3 * sin(animationProgress);
  }
}

// === Module 1: Text Analyzer ===
function loadDemoText() {
  const demoText = `Food Recommendations for Today

Welcome to your daily food guide! Here are some delicious recommendations for meals throughout the day.

Breakfast Options

Start your morning with a nutritious breakfast to fuel your day. Consider having scrambled eggs with whole wheat toast and fresh avocado. Eggs are an excellent source of protein and help keep you satisfied until lunch. If you prefer something lighter, try Greek yogurt with honey and mixed berries. The yogurt provides protein while the berries add natural sweetness and antioxidants.

Oatmeal is another fantastic breakfast choice. Top your oatmeal with sliced bananas, a drizzle of maple syrup, and a handful of walnuts. This combination gives you sustained energy throughout the morning. For those who enjoy savory breakfast, a vegetable omelet with mushrooms, spinach, and cheese is highly recommended.

Lunch Suggestions

For lunch, consider a hearty salad with grilled chicken or salmon. Fresh salad greens topped with protein make for a balanced meal. Add some quinoa or brown rice to make the salad more filling. A balsamic vinaigrette dressing complements the fresh vegetables perfectly.

Sandwiches are always a reliable lunch option. Try a turkey and avocado sandwich on whole grain bread with lettuce, tomato, and mustard. The turkey provides lean protein while the avocado adds healthy fats. Pair your sandwich with a side of sweet potato fries or a cup of vegetable soup for a complete meal.

Dinner Ideas

Dinner should be satisfying but not too heavy. Grilled salmon with roasted vegetables is an excellent choice. The salmon provides omega-3 fatty acids while the vegetables add fiber and vitamins. Season the salmon with lemon, garlic, and herbs for maximum flavor.

Pasta dishes are always popular for dinner. Try whole wheat pasta with marinara sauce, fresh basil, and grilled vegetables. Add some grilled chicken or shrimp if you want extra protein. A simple caprese salad on the side complements the pasta perfectly.

Snack Recommendations

Between meals, healthy snacks help maintain your energy levels. Fresh fruit like apples, bananas, or oranges are perfect portable snacks. Pair an apple with a tablespoon of almond butter for added protein and healthy fats.

Hummus with carrot sticks and cucumber slices makes for a crunchy, satisfying snack. The hummus provides protein and fiber while the vegetables add vitamins and minerals. Greek yogurt with a handful of granola and fresh berries serves as both a snack and a light dessert.

Beverage Suggestions

Stay hydrated throughout the day with plenty of water. Aim for at least eight glasses of water daily. Green tea is an excellent beverage choice that provides antioxidants and a gentle energy boost. Fresh fruit smoothies make for refreshing drinks, especially in warmer weather.

Remember that healthy eating doesn't have to be complicated or boring. Focus on whole foods, plenty of vegetables, lean proteins, and whole grains. Enjoy your meals mindfully and savor the flavors and textures of your food.`;

  fileName = 'Demo: Food Recommendations';
  analyzeText(demoText);
  isFileLoaded = true;
  generateButton.show();
  analyzeButton.show();
  createParticleBurst(width / 2, 120);
  console.log('✅ Demo text loaded successfully!');
}

function handleFile(file) {
  if (file.type === 'text') {
    fileName = file.name;
    let reader = new FileReader();
    reader.onload = function (e) {
      analyzeText(e.target.result);
      isFileLoaded = true;
      generateButton.show();
      analyzeButton.show();
      createParticleBurst(width / 2, 120);
    };
    reader.readAsText(file.file);
  } else {
    alert('Please upload a text file (.txt)!');
  }
}

function analyzeText(txt) {
  sourceText = txt;
  wordFrequency.clear();

  let words = txt
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);

  totalWords = words.length;

  for (let word of words) {
    wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
  }

  topWords = Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  wordCloudData = topWords.map(entry => ({
    word: entry[0],
    freq: entry[1],
    x: random(200, width - 200),
    y: random(250, height - 100),
    size: map(entry[1], topWords[topWords.length - 1][1], topWords[0][1], 16, 60),
    color: color(random(100, 255), random(100, 255), random(150, 255))
  }));
}

// === Module 2: Joke Generator ===
function generateJoke() {
  if (topWords.length === 0) {
    console.error('❌ No words available for joke generation');
    return;
  }

  showWordCloud = false;
  jokeState = 0;
  currentJoke = [];
  animationProgress = 0;

  let chosenWord = topWords[floor(random(min(10, topWords.length)))][0];
  let wordFreq = wordFrequency.get(chosenWord);
  let capitalizedWord = chosenWord.charAt(0).toUpperCase() + chosenWord.slice(1);

  currentJoke = [
    'Knock knock!',
    "Who's there?",
    capitalizedWord,
    `${capitalizedWord} who?`,
    `${capitalizedWord}... it appears ${wordFreq} times in your text! 😄`
  ];

  console.log('🎭 Joke generated:', currentJoke);
  setTimeout(() => advanceJoke(), 800);
}

function advanceJoke() {
  jokeState++;
  console.log('🎪 Joke state advanced to:', jokeState);
  if (jokeState <= 5) {
    createParticleBurst(width / 2, height / 2);
    if (jokeState < 5) {
      setTimeout(() => advanceJoke(), jokeState === 2 ? 1200 : 1500);
    }
  }
}

// === Module 3: Visualiser ===
function displayJoke() {
  if (!currentJoke || currentJoke.length === 0) {
    console.error('❌ No joke to display');
    return;
  }
  
  let yOffset = 280;
  for (let i = 0; i < jokeState && i < currentJoke.length; i++) {
    push();
    
    // Set colors and styles based on joke line
    if (i === 0 || i === 2) {
      fill(accentColor);
      textSize(32);
      if (typeof textStyle !== 'undefined') textStyle(BOLD);
    } else if (i === 4) {
      fill(255, 220, 100);
      textSize(28 * punchlineScale);
      if (typeof textStyle !== 'undefined') textStyle(BOLD);
    } else {
      fill(255);
      textSize(24);
      if (typeof textStyle !== 'undefined') textStyle(NORMAL);
    }
    
    // Draw text
    text(currentJoke[i], width / 2, yOffset);
    yOffset += i === 4 ? 80 : 60;
    pop();
  }

  if (jokeState >= 5) {
    push();
    fill(150);
    textSize(14);
    text('Click the button to generate another joke', width / 2, height - 40);
    pop();
  }
}

function displayWordCloud() {
  push();
  fill(255);
  textSize(28);
  textStyle(BOLD);
  text('📊 Most Frequent Words', width / 2, 180);
  pop();

  for (let data of wordCloudData) {
    push();
    fill(data.color);
    textSize(data.size);
    textStyle(BOLD);
    text(data.word, data.x, data.y);
    fill(200);
    textSize(12);
    text(`(${data.freq})`, data.x, data.y + data.size / 2 + 10);
    pop();
  }

  push();
  fill(150);
  textSize(14);
  text('Word size represents frequency in the text', width / 2, height - 40);
  pop();
}

function displayInstructions() {
  push();
  fill(200);
  textSize(20);
  text('Choose an option:', width / 2, 280);
  pop();
  
  push();
  fill(accentColor);
  textSize(18);
  textStyle(BOLD);
  text('📝 Load Demo Text', width / 2, 330);
  fill(200);
  textSize(14);
  textStyle(NORMAL);
  text('Quick start with food recommendations', width / 2, 360);
  pop();
  
  push();
  fill(150);
  textSize(18);
  text('OR', width / 2, 400);
  pop();
  
  push();
  fill(titleColor);
  textSize(18);
  textStyle(BOLD);
  text('📁 Upload Your Own Text File', width / 2, 440);
  fill(200);
  textSize(14);
  textStyle(NORMAL);
  text('Novels, articles, essays - any .txt file works!', width / 2, 470);
  pop();
  
  push();
  fill(accentColor);
  textSize(12);
  text('💡 Tip: Longer texts create more interesting jokes', width / 2, 520);
  pop();
}

function toggleWordCloud() {
  showWordCloud = !showWordCloud;
  jokeState = 0;
  analyzeButton.html(showWordCloud ? '🎭 Back to Jokes' : '📊 View Word Analysis');
}

function createParticleBurst(x, y) {
  for (let i = 0; i < 20; i++) {
    particles.push(new Particle(x, y));
  }
}

function styleButton(btn, bgColor, border = 'none') {
  btn.style('background-color', bgColor);
  btn.style('color', '#fff');
  btn.style('border', border);
  btn.style('padding', '12px 24px');
  btn.style('border-radius', '8px');
  btn.style('cursor', 'pointer');
  btn.style('font-size', '14px');
  btn.style('font-weight', 'bold');
}

// Register A1H project with ProjectManager
if (typeof projectManager !== 'undefined') {
  projectManager.registerProject(
    'a1h',
    'A1H - Corpus Comedian',
    setupA1H,
    drawA1H,
    {
      description: 'Text analysis and joke generator. Upload a text file to analyze word frequency and generate custom knock-knock jokes based on the most common words.',
      canvasSize: { width: 900, height: 700 }
    }
  );
  console.log('✅ A1H project registered successfully!');
  
  // Add button to UI
  if (typeof uiController !== 'undefined' && uiController.initialized) {
    uiController.addProjectButton('a1h');
  }
} else {
  console.error('❌ ProjectManager not found! A1H project not registered.');
}
