// ===============================================
// A1D - Urban Glide - 2D Runner Game
// Interactive Media Assignment - A1D.js
// UTS 2025 Semester 2
// ===============================================

// A1D project variables
let buildings = [];
let player, game;

function setupA1D() {
  console.log("🎨 A1D - Urban Glide setup started!");
  
  // Check if p5.js functions are available
  if (typeof window.background === 'undefined') {
    console.error('❌ p5.js not loaded! background function not available.');
    return;
  }
  
  // ProjectManager already creates the canvas, so we don't need to call createCanvas
  
  // Reset game state
  buildings = [];
  
  // 플레이어 초기화
  player = {
    x: 100, y: 280, w: 30, h: 40,
    vy: 0, grounded: true, frame: 0
  };
  
  // 게임 상태
  game = { speed: 5, score: 0, groundY: 320 };
  
  // 초기 건물 생성
  for (let i = 0; i < 12; i++) {
    buildings.push(createBuilding(i * 70 + width));
  }
  
  console.log("✅ A1D project initialized successfully!");
}

// BUGFIX: Removed erroneous 'd' character
function createBuilding(x) {
  let w = window.random(30, 80);
  let h = window.random(80, 200);
  return {
    x: x, y: game.groundY - h, w: w, h: h,
    area: w * h,
    color: [window.random(50, 150), window.random(50, 150), window.random(100, 200)]
  };
}

function drawA1D() {
  // Check if p5.js functions are available
  if (typeof window.background === 'undefined') {
    console.error('❌ p5.js functions not available in drawA1D!');
    return;
  }

  // 배경
  window.background(25, 25, 50);
  
  // 별
  window.fill(255, 200);
  for (let i = 0; i < 30; i++) {
    let x = (i * 27 + game.score * 0.1) % width;
    let y = (i * 13) % 150;
    window.ellipse(x, y, 2);
  }
  
  // 건물 업데이트
  updateBuildings();
  
  // 건물 그리기
  buildings.forEach((b, i) => {
    window.fill(b.color[0], b.color[1], b.color[2]);
    window.stroke(255, 100);
    window.rect(b.x, b.y, b.w, b.h);
    
    // 창문
    window.fill(255, 255, 100, 150);
    for (let x = 10; x < b.w - 10; x += 15) {
      for (let y = 10; y < b.h - 10; y += 20) {
        if (window.random() > 0.6) window.rect(b.x + x, b.y + y, 6, 6);
      }
    }
    
    // 건물 정보
    window.fill(255, 150);
    window.textAlign(window.CENTER);
    // Use Math.floor as fallback if window.int is not available
    let areaInt = (typeof window.int === 'function') ? window.int(b.area) : Math.floor(b.area);
    window.text(`#${i+1}\n${areaInt}`, b.x + b.w/2, b.y + b.h/2);
  });
  
  // 플레이어 업데이트 & 그리기
  updatePlayer();
  drawPlayer();
  
  // 지면
  window.fill(60, 60, 60);
  window.rect(0, game.groundY, width, height);
  
  // UI
  window.fill(255);
  window.textAlign(window.LEFT);
  // Use Math.floor as fallback if window.int is not available
  let scoreInt = (typeof window.int === 'function') ? window.int(game.score) : Math.floor(game.score);
  let playerYInt = (typeof window.int === 'function') ? window.int(player.y) : Math.floor(player.y);
  window.text(`Score: ${scoreInt} | Speed: ${game.speed} | Buildings: ${buildings.length}`, 10, 20);
  window.text(`Player Y: ${playerYInt} | Grounded: ${player.grounded}`, 10, 40);
  window.text(`Controls: SPACE-Jump | R-Reverse | S-Sort | +/-Speed`, 10, height-20);
}

function updateBuildings() {
  // 건물 이동
  buildings.forEach(b => b.x -= game.speed);
  
  // 화면 밖 건물 제거 & 새 건물 추가
  if (buildings[0].x + buildings[0].w < 0) {
    buildings.shift(); // 첫 번째 건물 제거
    let lastB = buildings[buildings.length - 1];
    buildings.push(createBuilding(lastB.x + lastB.w + window.random(30, 80))); // 새 건물 추가
  }
}

function updatePlayer() {
  // 중력
  if (!player.grounded) {
    player.vy += 0.6;
    player.y += player.vy;
    
    // 지면 착지
    if (player.y + player.h >= game.groundY) {
      player.y = game.groundY - player.h;
      player.vy = 0;
      player.grounded = true;
    }
  }
  
  
  player.frame += 0.3;
  if (player.frame > 8) player.frame = 0;
  
  // 점수 증가
  game.score += game.speed * 0.1;
}

function drawPlayer() {
  window.push();
  window.translate(player.x + player.w/2, player.y + player.h/2);
  
  // 몸체 애니메이션
  let bob = player.grounded ? window.sin(player.frame) * 2 : 0;
  let legOffset = player.grounded ? window.sin(player.frame * 2) * 5 : 0;
  
  // 머리
  window.fill(255, 200, 150);
  window.ellipse(0, -15 + bob, 12, 12);
  
  // 몸체
  window.fill(0, 255, 136);
  window.ellipse(0, bob, 10, 16);
  
  // 팔
  window.stroke(255, 200, 150);
  window.strokeWeight(2);
  window.line(0, -5 + bob, -8, 5 + bob);
  window.line(0, -5 + bob, 8, 5 + bob);
  
  // 다리
  window.stroke(0, 255, 136);
  window.strokeWeight(3);
  if (player.grounded) {
    window.line(0, 8 + bob, -5 + legOffset, 18);
    window.line(0, 8 + bob, 5 - legOffset, 18);
  } else {
    window.line(0, 8, -3, 15); // 점프 자세
    window.line(0, 8, 3, 15);
  }
  
  window.noStroke();
  window.pop();
}

function keyPressedA1D() {
  if (key === ' ' && player.grounded) {
    // 점프
    player.vy = -12;
    player.grounded = false;
  } else if (key === 'r' || key === 'R') {
    // 배열 역순
    buildings.reverse();
    console.log("Buildings reversed!");
  } else if (key === 's' || key === 'S') {
    // 면적별 정렬
    buildings.sort((a, b) => a.area - b.area);
    console.log("Buildings sorted by area!");
  } else if (key === '+' || key === '=') {
    // 속도 증가
    game.speed = min(game.speed + 0.5, 8);
  } else if (key === '-') {
    // 속도 감소
    game.speed = max(game.speed - 0.5, 1);
  }
}

// 마우스 클릭으로도 점프 가능
function mousePressedA1D() {
  if (player.grounded) {
    player.vy = -12;
    player.grounded = false;
  }
}

// ===============================================
// Project Registration
// ===============================================

// Register A1D project with project manager
if (typeof projectManager !== 'undefined') {
  console.log('📝 Registering A1D project...');
  projectManager.registerProject(
    'a1d',
    'A1D - Urban Glide',
    setupA1D,
    drawA1D,
    {
      mousePressed: mousePressedA1D,
      keyPressed: keyPressedA1D,
      description: '2D runner game with buildings, jumping mechanics, and interactive controls. Use SPACE to jump, R to reverse, S to sort buildings.',
      canvasSize: { width: 800, height: 400 }
    }
  );
  console.log('✅ A1D project registered successfully!');
  
  // Ensure UI buttons update if UI already initialized
  if (typeof uiController !== 'undefined' && uiController.initialized) {
    uiController.addProjectButton('a1d');
  }
} else {
  console.error('❌ ProjectManager not found! A1D project not registered.');
}