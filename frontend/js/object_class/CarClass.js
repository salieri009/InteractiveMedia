class Car {
    constructor(make, model, year, speed, x = 100, y = 200) {
        this.make = make;
        this.model = model;
        this.year = year;
        this.speed = speed;
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 40;
        this.color = color(random(255), random(255), random(255));
        this.direction = 1; // 1 for right, -1 for left
    }

    // 자동차 그리기
    display() {
        push();
        translate(this.x, this.y);

        // 자동차 몸체
        fill(this.color);
        stroke(0);
        strokeWeight(2);
        rect(0, 0, this.width, this.height, 5);

        // 자동차 지붕
        fill(red(this.color) * 0.8, green(this.color) * 0.8, blue(this.color) * 0.8);
        rect(15, -15, this.width - 30, 15, 3);

        // 바퀴
        fill(50);
        circle(15, this.height + 5, 15);
        circle(this.width - 15, this.height + 5, 15);

        // 바퀴 림
        fill(200);
        circle(15, this.height + 5, 8);
        circle(this.width - 15, this.height + 5, 8);

        // 창문
        fill(150, 200, 255, 150);
        rect(20, -12, 15, 10);
        rect(this.width - 35, -12, 15, 10);

        // 헤드라이트
        fill(255, 255, 200);
        if (this.direction > 0) {
            circle(this.width - 5, 10, 8);
        } else {
            circle(5, 10, 8);
        }

        pop();
    }

    // 자동차 이동
    move() {
        this.x += this.speed * this.direction;

        // 화면 경계에서 방향 전환
        if (this.x > width - this.width || this.x < 0) {
            this.direction *= -1;
        }

        // 화면 경계 제한
        this.x = constrain(this.x, 0, width - this.width);
    }

    // 속도 조절
    setSpeed(newSpeed) {
        this.speed = newSpeed;
    }

    // 위치 설정
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    // 색상 변경
    setColor(r, g, b) {
        this.color = color(r, g, b);
    }

    // 자동차 정보 출력
    getInfo() {
        return `${this.year} ${this.make} ${this.model} - Speed: ${this.speed}`;
    }

    // 충돌 감지
    checkCollision(other) {
        return (this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y);
    }

    // 키보드 조작
    handleInput() {
        if (keyIsDown(LEFT_ARROW)) {
            this.x -= this.speed;
            this.direction = -1;
        }
        if (keyIsDown(RIGHT_ARROW)) {
            this.x += this.speed;
            this.direction = 1;
        }
        if (keyIsDown(UP_ARROW)) {
            this.y -= this.speed;
        }
        if (keyIsDown(DOWN_ARROW)) {
            this.y += this.speed;
        }

        // 화면 경계 제한
        this.x = constrain(this.x, 0, width - this.width);
        this.y = constrain(this.y, 0, height - this.height);
    }

    // 자동차 업데이트 (매 프레임마다 호출)
    update() {
        this.move();
        this.display();
    }
}