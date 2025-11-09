// Urban Glide - 2D Runner Game (p5.js)
let buildings = [];
let player, game;

function setup() {
  createCanvas(800, 400);
  
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
}

function createBuilding(x) {d
  let w = random(30, 80);
  let h = random(80, 200);
  return {
    x: x, y: game.groundY - h, w: w, h: h,
    area: w * h,
    color: [random(50, 150), random(50, 150), random(100, 200)]
  };
}

function draw() {
  // 배경
  background(25, 25, 50);
  
  // 별
  fill(255, 200);
  for (let i = 0; i < 30; i++) {
    let x = (i * 27 + game.score * 0.1) % width;
    let y = (i * 13) % 150;
    ellipse(x, y, 2);
  }
  
  // 건물 업데이트
  updateBuildings();
  
  // 건물 그리기
  buildings.forEach((b, i) => {
    fill(b.color[0], b.color[1], b.color[2]);
    stroke(255, 100);
    rect(b.x, b.y, b.w, b.h);
    
    // 창문
    fill(255, 255, 100, 150);
    for (let x = 10; x < b.w - 10; x += 15) {
      for (let y = 10; y < b.h - 10; y += 20) {
        if (random() > 0.6) rect(b.x + x, b.y + y, 6, 6);
      }
    }
    
    // 건물 정보
    fill(255, 150);
    textAlign(CENTER);
    text(`#${i+1}\n${int(b.area)}`, b.x + b.w/2, b.y + b.h/2);
  });
  
  // 플레이어 업데이트 & 그리기
  updatePlayer();
  drawPlayer();
  
  // 지면
  fill(60, 60, 60);
  rect(0, game.groundY, width, height);
  
  // UI
  fill(255);
  textAlign(LEFT);
  text(`Score: ${int(game.score)} | Speed: ${game.speed} | Buildings: ${buildings.length}`, 10, 20);
  text(`Player Y: ${int(player.y)} | Grounded: ${player.grounded}`, 10, 40);
  text(`Controls: SPACE-Jump | R-Reverse | S-Sort | +/-Speed`, 10, height-20);
}

function updateBuildings() {
  // 건물 이동
  buildings.forEach(b => b.x -= game.speed);
  
  // 화면 밖 건물 제거 & 새 건물 추가
  if (buildings[0].x + buildings[0].w < 0) {
    buildings.shift(); // 첫 번째 건물 제거
    let lastB = buildings[buildings.length - 1];
    buildings.push(createBuilding(lastB.x + lastB.w + random(30, 80))); // 새 건물 추가
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
  push();
  translate(player.x + player.w/2, player.y + player.h/2);
  
  // 몸체 애니메이션
  let bob = player.grounded ? sin(player.frame) * 2 : 0;
  let legOffset = player.grounded ? sin(player.frame * 2) * 5 : 0;
  
  // 머리
  fill(255, 200, 150);
  ellipse(0, -15 + bob, 12, 12);
  
  // 몸체
  fill(0, 255, 136);
  ellipse(0, bob, 10, 16);
  
  // 팔
  stroke(255, 200, 150);
  strokeWeight(2);
  line(0, -5 + bob, -8, 5 + bob);
  line(0, -5 + bob, 8, 5 + bob);
  
  // 다리
  stroke(0, 255, 136);
  strokeWeight(3);
  if (player.grounded) {
    line(0, 8 + bob, -5 + legOffset, 18);
    line(0, 8 + bob, 5 - legOffset, 18);
  } else {
    line(0, 8, -3, 15); // 점프 자세
    line(0, 8, 3, 15);
  }
  
  noStroke();
  pop();
}

function keyPressed() {
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
function mousePressed() {
  if (player.grounded) {
    player.vy = -12;
    player.grounded = false;
  }
}