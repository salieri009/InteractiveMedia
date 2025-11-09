Alright, I'll create a creative coding project that combines the two ideas you requested ("Shopping List" and "What Do You See?") using p5.js and ml5.js.알겠습니다. p5.js와 ml5.js를 사용하여 요청하신 두 가지 아이디어("Shopping List"와 "What Do You See?")를 결합한 창의적인 코딩 프로젝트를 만들어 보겠습니다.



This project recognizes objects through the webcam, announces newly discovered objects via voice, and displays a list of all unique discovered objects on the screen like a "shopping list".이 프로젝트는 웹캠을 통해 객체를 인식하고, 처음 발견된 객체는 음성으로 알려주며, 발견된 모든 고유한 객체의 목록을 화면에 "쇼핑 리스트"처럼 표시합니다.



## Project Idea: The Observant Shopper## 프로젝트 아이디어: 관찰하는 쇼핑객 (The Observant Shopper)



This project combines the two ideas you suggested into one. It uses the webcam to recognize objects in real-time (Classifier), announces the recognized object names via voice (Text-to-Speech), and accumulates a list of all unique recognized items on the screen to create a "shopping list" or "list of items in the fridge".이 프로젝트는 사용자가 제안한 두 가지 아이디어를 하나로 합칩니다. 웹캠을 사용하여 실시간으로 객체를 인식하고(Classifier), 인식된 객체의 이름을 음성으로 알려주며(Text-to-Speech), 인식된 모든 고유한 항목의 목록을 화면에 누적하여 "쇼핑 리스트" 또는 "냉장고 안의 물건 목록"을 만듭니다.



### Combined Exercises### 결합된 연습문제



  * **Machine Learning (p178-180):** "Shopping List" (object classification and list storage)  * **Machine Learning (p178-180):** "Shopping List" (객체 분류 및 목록 저장)

  * **Machine Learning (p178-180):** "What Do You See?" (object classification and Text-to-Speech)  * **Machine Learning (p178-180):** "What Do You See?" (객체 분류 및 Text-to-Speech)



### Concept Sketch### 개념 스케치



The screen is divided into two parts. The left side displays the webcam video in real-time. When ml5.js detects an object, a rectangular box and label appear around it. On the right side, there is a text list under the title "Shopping List". When the camera first detects an "apple", the voice says "Apple" once and "Apple" is added to the list on the right. When it next detects a "banana", the voice says "Banana" and "Banana" is added to the list. Even if it sees the "apple" again that is already in the list, the voice won't speak and the list won't add duplicates.화면은 두 부분으로 나뉩니다. 왼쪽에는 웹캠 비디오가 실시간으로 표시됩니다. ml5.js가 객체를 감지하면 해당 객체 주위에 사각형 상자와 레이블이 나타납니다. 오른쪽에는 "Shopping List"라는 제목 아래에 텍스트 목록이 있습니다. 카메라가 "사과"를 처음 감지하면 "Apple"이라는 음성이 한 번 나오고 "Apple"이 오른쪽 목록에 추가됩니다. 카메라가 "바나나"를 다음으로 감지하면 "Banana" 음성이 나오고 목록에 "Banana"가 추가됩니다. 이미 목록에 있는 "사과"를 다시 봐도 음성이 나오거나 목록이 중복 추가되지 않습니다.



----------



### p5.js Code### p5.js 코드



To run this code, you need two files: `index.html` and `sketch.js`, and you must load the p5.js, p5.sound.js, and ml5.js libraries.이 코드를 실행하려면 `index.html`, `sketch.js` 두 개의 파일이 필요하며, p5.js, p5.sound.js, ml5.js 라이브러리를 로드해야 합니다.



#### `index.html` (Required)#### `index.html` (필수)



Create this file first. It loads the p5.js and ml5.js libraries.이 파일을 먼저 만드세요. p5.js와 ml5.js 라이브러리를 로드합니다.



```html```html

<html><html>

  <head>  <head>

    <meta charset="UTF-8" />    <meta charset="UTF-8" />

    <title>Observant Shopper</title>    <title>Observant Shopper</title>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.js"></script>    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/addons/p5.sound.min.js"></script>    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/addons/p5.sound.min.js"></script>

    <script src="https://unpkg.com/ml5@0.12.2/dist/ml5.min.js"></script>    <script src="https://unpkg.com/ml5@0.12.2/dist/ml5.min.js"></script>

    <style>    <style>

      body {      body {

        margin: 0;        margin: 0;

        padding: 0;        padding: 0;

        overflow: hidden;        overflow: hidden;

      }      }

    </style>    </style>

  </head>  </head>

  <body>  <body>

    <script src="sketch.js"></script>    <script src="sketch.js"></script>

  </body>  </body>

</html></html>

``````



#### `sketch.js`#### `sketch.js`



Save this file in the same folder as the above `index.html`.위 `index.html`과 같은 폴더에 이 파일을 저장하세요.



```javascript```javascript

// --- Setup Variables ---// --- 설정 변수 ---

let canvasWidth = 800;let canvasWidth = 800;

let canvasHeight = 500;let canvasHeight = 500;

let videoWidth = 640; // Video original widthlet videoWidth = 640; // 비디오 원본 너비

let listXPosition = videoWidth + 20; // X coordinate where shopping list startslet listXPosition = videoWidth + 20; // 쇼핑 리스트가 시작될 X 좌표

let confidenceThreshold = 0.5; // Minimum confidence for object recognitionlet confidenceThreshold = 0.5; // 객체 인식을 위한 최소 신뢰도

let listHeader = "🛒 Shopping List";let listHeader = "🛒 Shopping List";

let listTextSize = 18;let listTextSize = 18;

let labelTextSize = 16;let labelTextSize = 16;

let listLineHeight = 22;let listLineHeight = 22;



// --- State Variables ---// --- 상태 변수 ---

let detector;let detector;

let video;let video;

let detections = [];let detections = [];

let speech;let speech;

let shoppingListSet = new Set(); // Use Set to avoid duplicateslet shoppingListSet = new Set(); // 중복을 피하기 위해 Set 사용

let shoppingListDisplay = []; // Use Array to display in orderlet shoppingListDisplay = []; // 순서대로 표시하기 위해 Array 사용



// --- Load ml5 Model ---// --- ml5 모델 로드 ---

function preload() {function preload() {

  // 'cocossd' is a fast and lightweight model for detecting common objects.  // 'cocossd'는 일반적인 객체를 감지하는 빠르고 가벼운 모델입니다.

  detector = ml5.objectDetector('cocossd');  detector = ml5.objectDetector('cocossd');

}}



function setup() {function setup() {

  createCanvas(canvasWidth, canvasHeight);  createCanvas(canvasWidth, canvasHeight);

    

  // Create webcam video  // 웹캠 비디오 생성

  video = createCapture(VIDEO);  video = createCapture(VIDEO);

  video.size(videoWidth, canvasHeight);  video.size(videoWidth, canvasHeight);

  video.hide(); // Hide HTML <video> element so p5 can draw it  video.hide(); // p5가 그릴 수 있도록 HTML <video> 요소 숨기기



  // Initialize Text-to-Speech (TTS) engine  // Text-to-Speech (TTS) 엔진 초기화

  speech = new p5.Speech();  speech = new p5.Speech();

  speech.setLang('en-US'); // Set to English  speech.setLang('en-US'); // 영어로 설정



  // Start detection when model is ready  // 모델이 준비되면 감지 시작

  detector.detect(video, gotResults);  detector.detect(video, gotResults);

}}



function draw() {function draw() {

  // 1. Draw background and video  // 1. 배경 및 비디오 그리기

  background(20, 20, 40); // Dark background  background(20, 20, 40); // 어두운 배경

  image(video, 0, 0, videoWidth, canvasHeight); // Draw webcam screen  image(video, 0, 0, videoWidth, canvasHeight); // 웹캠 화면 그리기



  // 2. Draw detected objects  // 2. 감지된 객체 그리기

  for (let obj of detections) {  for (let obj of detections) {

    drawBox(obj);    drawBox(obj);

  }  }

    

  // 3. Draw shopping list  // 3. 쇼핑 리스트 그리기

  drawList();  drawList();

}}



// --- Core: ml5 Callback Function ---// --- 핵심: ml5 콜백 함수 ---

function gotResults(error, results) {function gotResults(error, results) {

  if (error) {  if (error) {

    console.error(error);    console.error(error);

    return;    return;

  }  }

    

  // Update detected objects list  // 감지된 객체 목록 업데이트

  detections = results;  detections = results;

    

  // Check for new objects and add to list/voice  // 새 객체 확인 및 목록/음성 추가

  for (let obj of detections) {  for (let obj of detections) {

    let label = obj.label;    let label = obj.label;

        

    // Check if confidence is high enough and it's a new item not in the list    // 신뢰도가 충분히 높고, 목록에 *없는* 새 항목인지 확인

    if (obj.confidence > confidenceThreshold && !shoppingListSet.has(label)) {    if (obj.confidence > confidenceThreshold && !shoppingListSet.has(label)) {

      console.log('New item detected:', label);      console.log('New item detected:', label);

            

      // "What Do You See?" (voice)      // "What Do You See?" (음성)

      speech.speak(label);      speech.speak(label);

            

      // "Shopping List" (list)      // "Shopping List" (목록)

      shoppingListSet.add(label);      shoppingListSet.add(label);

      shoppingListDisplay.push(label); // Add to display array      shoppingListDisplay.push(label); // 표시용 배열에 추가

    }    }

  }  }



  // Continue detection for next frame  // 다음 프레임 감지 계속

  detector.detect(video, gotResults);  detector.detect(video, gotResults);

}}



// --- Helper Function: Draw Object Box ---// --- 헬퍼 함수: 객체 상자 그리기 ---

function drawBox(obj) {function drawBox(obj) {

  noStroke();  noStroke();

  fill(0, 255, 100, 150); // Semi-transparent green  fill(0, 255, 100, 150); // 반투명 녹색

    

  // Draw label text  // 레이블 텍스트 그리기

  textSize(labelTextSize);  textSize(labelTextSize);

  text(obj.label + " (" + nfc(obj.confidence * 100, 0) + "%)", obj.x + 10, obj.y + labelTextSize);  text(obj.label + " (" + nfc(obj.confidence * 100, 0) + "%)", obj.x + 10, obj.y + labelTextSize);

    

  // Draw bounding box  // 경계 상자 그리기

  noFill();  noFill();

  strokeWeight(3);  strokeWeight(3);

  stroke(0, 255, 100);  stroke(0, 255, 100);

  rect(obj.x, obj.y, obj.width, obj.height);  rect(obj.x, obj.y, obj.width, obj.height);

}}



// --- Helper Function: Draw Shopping List ---// --- 헬퍼 함수: 쇼핑 리스트 그리기 ---

function drawList() {function drawList() {

  fill(240); // Light text color  fill(240); // 밝은 텍스트 색상

  noStroke();  noStroke();

  textSize(listTextSize + 2);  textSize(listTextSize + 2);

  textFont('Helvetica');  textFont('Helvetica');

  textAlign(LEFT, TOP);  textAlign(LEFT, TOP);

    

  // List title  // 리스트 제목

  text(listHeader, listXPosition, 20);  text(listHeader, listXPosition, 20);

    

  // List items  // 리스트 항목

  textSize(listTextSize);  textSize(listTextSize);

  let y = 60;  let y = 60;

  for (let i = 0; i < shoppingListDisplay.length; i++) {  for (let i = 0; i < shoppingListDisplay.length; i++) {

    let item = shoppingListDisplay[i];    let item = shoppingListDisplay[i];

    text((i + 1) + ". " + item, listXPosition, y);    text((i + 1) + ". " + item, listXPosition, y);

    y += listLineHeight;    y += listLineHeight;

  }  }

}}



// --- Utility: Save Screenshot ---// --- 유틸리티: 스크린샷 저장 ---

function keyPressed() {function keyPressed() {

  if (key === 's' || key === 'S') {  if (key === 's' || key === 'S') {

    saveCanvas('observant-shopper', 'png');    saveCanvas('observant-shopper', 'png');

    console.log('Screenshot saved!');    console.log('Screenshot saved!');

  }  }

}}

``````



----------



### Parameter Variation Suggestions### 파라미터 변형 제안



1.  **Change `confidenceThreshold` (Confidence Threshold):**1.  **`confidenceThreshold` (신뢰도 임계값) 변경:**



      * **Effect:** Lowering this value to `0.3` makes the model recognize less certain objects, adding to the list faster and more often (sometimes including incorrect items). Raising it to `0.8` makes it "pickier" by only adding very certain objects.      * **효과:** 이 값을 `0.3`으로 낮추면 모델이 덜 확실한 객체도 인식하여 목록에 더 빨리, 더 많이 추가됩니다 (때로는 잘못된 항목 포함). `0.8`로 높이면 매우 확실할 때만 객체를 추가하여 "더 까다로운" 인식기가 됩니다.

      * **Code:** Modify the line `let confidenceThreshold = 0.5;`.      * **코드:** `let confidenceThreshold = 0.5;` 라인을 수정합니다.



2.  **Change `speech` Properties (Voice Modulation):**2.  **`speech` 속성 변경 (음성 변조):**



      * **Effect:** Change the narrator's voice tone or speed to give a different feel.      * **효과:** 내레이터의 목소리 톤이나 속도를 변경하여 다른 느낌을 줍니다.

      * **Code:** Add lines like `speech.setPitch(1.5);` (higher voice) or `speech.setRate(0.7);` (slower speed) inside the `setup()` function.      * **코드:** `setup()` 함수 내부에 `speech.setPitch(1.5);` (더 높은 목소리) 또는 `speech.setRate(0.7);` (더 느린 속도)와 같은 라인을 추가합니다.



3.  **Change Layout:**3.  **레이아웃 변경:**



      * **Effect:** Change the positions of video and list. Change `listXPosition` to `20`, and change the `image()` function's starting position to `canvasWidth - videoWidth, 0` to move the list to the left and video to the right.      * **효과:** 비디오와 목록의 위치를 변경합니다. `listXPosition` 값을 `20`으로, `image()` 함수의 시작 위치를 `canvasWidth - videoWidth, 0`으로 변경하면 목록이 왼쪽, 비디오가 오른쪽으로 이동합니다.

      * **Code:** Modify the `let listXPosition` value and the `image()` call in `draw()`.      * **코드:** `let listXPosition` 값과 `draw()` 안의 `image()` 호출을 수정합니다.



----------



### Visual Results### 시각적 결과물



  * **Description:** Run the sketch and show various objects (e.g., coffee cup, phone, apple) to the webcam. Green rectangles will appear around the objects in the real-time video screen. At the same time, text like "cup", "cell phone", "apple" will be added sequentially to the "Shopping List" area on the right, and voice will speak each time an item is first added.  * **설명:** 스케치를 실행하고 웹캠에 여러 물체(예: 커피잔, 휴대폰, 사과)를 보여주면, 실시간 비디오 화면에 해당 물체 주위로 녹색 사각형이 그려집니다. 동시에 오른쪽 "Shopping List" 영역에 "cup", "cell phone", "apple"과 같은 텍스트가 차례로 추가되며, 항목이 처음 추가될 때마다 음성이 나옵니다.

  * **Capture Method:** While the sketch is running, press the **'s' key** to download the current screen as a `.png` file.  * **캡처 방법:** 스케치가 실행 중일 때 **'s' 키**를 누르면 현재 화면이 `.png` 파일로 다운로드됩니다.



----------



### Explanation### 설명



#### a) Concept#### a) 컨셉



This program uses machine learning (object recognition) as a creative input tool. It goes beyond just "seeing" by **remembering** (storing in a list) and **communicating** (speaking aloud). This creates an "observer" agent that actively observes and catalogs the user's environment.이 프로그램은 기계 학습(객체 인식)을 창의적인 입력 도구로 사용합니다. 단순히 '보는 것'을 넘어, 본 것을 **기억**(목록에 저장)하고 **소통**(음성으로 말하기)합니다. 이는 사용자의 환경을 능동적으로 관찰하고 카탈로그화하는 '관찰자' 에이전트를 만듭니다.



#### b) Code Structure and Key Variables#### b) 코드 구조 및 주요 변수



  * **`preload()`:** Asynchronously loads the model using `ml5.objectDetector('cocossd')`.  * **`preload()`:** `ml5.objectDetector('cocossd')`를 사용하여 모델을 비동기식으로 로드합니다.

  * **`setup()`:** Initializes canvas, webcam video (`createCapture`), TTS engine (`p5.Speech`), and lists to store items: `shoppingListSet` (for duplicate prevention) and `shoppingListDisplay` (for display).  * **`setup()`:** 캔버스, 웹캠 비디오(`createCapture`), TTS 엔진(`p5.Speech`), 그리고 목록을 저장할 `shoppingListSet` (중복 방지용)과 `shoppingListDisplay` (표시용)를 초기화합니다.

  * **`detector.detect(video, gotResults)`:** This function is key. Called once in `setup`, it creates an infinite loop by calling itself in the `gotResults` callback.  * **`detector.detect(video, gotResults)`:** 이 함수가 핵심입니다. `setup`에서 한 번 호출되면, `gotResults` 콜백 함수 내에서 스스로를 계속 호출하며 무한 루프를 만듭니다.

  * **`gotResults(error, results)`:** This runs every time ml5 detects objects. It iterates through the `results` array, checking each object's `label` and `confidence`.  * **`gotResults(error, results)`:** ml5가 객체를 감지할 때마다 이 함수가 실행됩니다. `results` 배열을 순회하며 각 객체의 `label`과 `confidence`를 확인합니다.

  * **`shoppingListSet.has(label)`:** Uses the `Set` data structure to quickly check (O(1) time complexity) if the object is *already* in the list. This is why voice speaks only once and no duplicates appear in the list.  * **`shoppingListSet.has(label)`:** `Set` 자료구조를 사용하여 해당 객체가 *이미* 목록에 있는지 O(1) 시간 복잡도로 빠르게 확인합니다. 이것이 음성이 한 번만 나오고 목록에 중복이 없는 이유입니다.

  * **`speech.speak(label)`:** Uses the `p5.sound` library to speak the detected object's `label` aloud.  * **`speech.speak(label)`:** `p5.sound` 라이브러리를 사용하여 감지된 객체의 `label`을 소리내어 말합니다.

  * **`drawList()` / `drawBox()`:** Helper functions called in the `draw()` loop, responsible for drawing the text list and detection boxes on the screen.  * **`drawList()` / `drawBox()`:** `draw()` 루프에서 호출되는 헬퍼 함수로, 각각 화면에 텍스트 목록과 감지 상자를 그리는 역할을 합니다.



#### c) How Parameter Changes Affect Visual/Audio#### c) 파라미터 변경이 시각/청각에 미치는 영향



  * **`confidenceThreshold`:** This is the program's "sensitivity". Lower values (e.g., `0.3`) create more visual noise (incorrect boxes), fill the list faster, and produce more voice. Higher values (e.g., `0.8`) make the program more "cautious", only drawing and speaking for clear objects.  * **`confidenceThreshold`:** 이 값은 프로그램의 "민감도"입니다. 값이 낮으면(e.g., `0.3`) 더 많은 시각적 노이즈(잘못된 상자)가 생기고 목록이 빠르게 채워지며 더 많은 음성이 나옵니다. 값이 높으면(e.g., `0.8`) 프로그램이 더 "신중해져" 명확한 객체만 그리고 말합니다.

  * **`listTextSize` / `listLineHeight`:** These are purely visual/aesthetic elements. They control the readability and layout of the list.  * **`listTextSize` / `listLineHeight`:** 이 값들은 순전히 시각적/미적 요소입니다. 목록의 가독성과 레이아웃을 제어합니다.

  * **`speech.setPitch()` / `speech.setRate()`:** These create no visual changes but dramatically alter the program's "personality". `setPitch(0.1)` creates a slow, deep voice; `setPitch(2.0)` and `setRate(1.5)` create a fast, high voice, making it feel like a different character is speaking.  * **`speech.setPitch()` / `speech.setRate()`:** 이 값들은 시각적인 변화는 없지만, 프로그램의 "성격"을 극적으로 바꿉니다. `setPitch(0.1)`은 느리고 깊은 목소리를, `setPitch(2.0)`와 `setRate(1.5)`는 빠르고 높은 목소리를 만들어 마치 다른 캐릭터가 말하는 듯한 느낌을 줍니다.



------

### Original Sources### 원본 출처



Shopping List Use an object recognition library or a classifier to store a list of all the objects it sees. Use it to make a shopping list of everything in your fridge.1Shopping List Use an object recognition library or a classifier to store a list of all the objects it sees. Use it to make a shopping list of everything in your fridge.1



Levin, Golan, and Tega Brain. Code As Creative Medium : A Handbook for Computational Art and Design, MIT Press, 2021. ProQuest Ebook Central, http://ebookcentral.proquest.com/lib/uts/detail.action?docID=6454626.Levin, Golan, and Tega Brain. Code As Creative Medium : A Handbook for Computational Art and Design, MIT Press, 2021. ProQuest Ebook Central, http://ebookcentral.proquest.com/lib/uts/detail.action?docID=6454626.



Created from uts on 2025-10-19 05:02:29.Created from uts on 2025-10-19 05:02:29.



------



What Do You See? Combine an object recognition classifier with a text-to-speech library. Write a computer program that narrates what it sees through the webcam.What Do You See? Combine an object recognition classifier with a text-to-speech library. Write a computer program that narrates what it sees through the webcam.



Levin, Golan, and Tega Brain. Code As Creative Medium : A Handbook for Computational Art and Design, MIT Press, 2021. ProQuest Ebook Central, http://ebookcentral.proquest.com/lib/uts/detail.action?docID=6454626.Levin, Golan, and Tega Brain. Code As Creative Medium : A Handbook for Computational Art and Design, MIT Press, 2021. ProQuest Ebook Central, http://ebookcentral.proquest.com/lib/uts/detail.action?docID=6454626.



Created from uts on 2025-10-19 05:02:49.Created from uts on 2025-10-19 05:02:49.
