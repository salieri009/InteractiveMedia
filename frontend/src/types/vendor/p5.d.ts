/**
 * Ambient type declarations for p5.js loaded via CDN in global mode.
 *
 * WHY THIS FILE EXISTS:
 * p5.js is loaded via <script> tag (not npm/import) so it sets window.p5
 * as a global. Installing @types/p5 would conflict with this pattern because
 * that package expects p5 to be imported as an ES module.
 *
 * STRUCTURE:
 * Everything is inside `declare global {}` because this file has `export {}`
 * which makes it an ES module — without that, `interface Window` augmentation
 * would silently merge into the wrong scope.
 *
 * EXTEND THIS FILE when a new project (A1x) uses a p5 method not listed here.
 * Only methods actually used across the codebase are declared — keep it lean.
 */

export {};   // Makes this a module so `declare global` works correctly.

declare global {
  /* ================================================================
     p5 constructor class
     ================================================================ */
  class p5 {
    constructor(sketch: (p: p5) => void, container?: HTMLElement | string);

    // ----- Canvas -----
    createCanvas(w: number, h: number): p5.Element;
    resizeCanvas(w: number, h: number): void;
    remove(): void;

    // ----- State -----
    readonly width: number;
    readonly height: number;
    readonly frameCount: number;
    readonly mouseX: number;
    readonly mouseY: number;
    readonly pmouseX: number;
    readonly pmouseY: number;
    readonly mouseIsPressed: boolean;
    readonly key: string;
    readonly keyCode: number;

    // ----- Loop control -----
    noLoop(): void;
    loop(): void;
    redraw(): void;

    // ----- Drawing — fills & strokes -----
    background(v: number | string): void;
    background(r: number, g: number, b: number, a?: number): void;
    fill(v: number | string): void;
    fill(r: number, g: number, b: number, a?: number): void;
    noFill(): void;
    stroke(v: number | string): void;
    stroke(r: number, g: number, b: number, a?: number): void;
    noStroke(): void;
    strokeWeight(w: number): void;

    // ----- Shapes -----
    ellipse(x: number, y: number, w: number, h?: number): void;
    circle(x: number, y: number, d: number): void;
    rect(x: number, y: number, w: number, h: number, r?: number): void;
    square(x: number, y: number, s: number, r?: number): void;
    line(x1: number, y1: number, x2: number, y2: number): void;
    point(x: number, y: number): void;
    triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): void;
    beginShape(): void;
    endShape(mode?: string): void;
    vertex(x: number, y: number): void;
    arc(x: number, y: number, w: number, h: number, start: number, stop: number): void;
    quad(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): void;

    // ----- Transform -----
    push(): void;
    pop(): void;
    translate(x: number, y: number): void;
    rotate(angle: number): void;
    scale(x: number, y?: number): void;
    resetMatrix(): void;

    // ----- Alignment / mode -----
    rectMode(mode: string): void;
    imageMode(mode: string): void;
    textAlign(h: string, v?: string): void;

    // ----- Color -----
    color(v: number | string): p5.Color;
    color(r: number, g: number, b: number, a?: number): p5.Color;
    lerpColor(c1: p5.Color, c2: p5.Color, amt: number): p5.Color;
    red(c: p5.Color): number;
    green(c: p5.Color): number;
    blue(c: p5.Color): number;
    hue(c: p5.Color): number;
    saturation(c: p5.Color): number;
    brightness(c: p5.Color): number;
    alpha(c: p5.Color): number;
    colorMode(mode: string, max1?: number, max2?: number, max3?: number, maxA?: number): void;

    // ----- Math -----
    readonly PI: number;
    readonly TWO_PI: number;
    readonly HALF_PI: number;
    random(min?: number, max?: number): number;
    random(choices: unknown[]): unknown;
    randomGaussian(mean?: number, sd?: number): number;
    map(value: number, start1: number, stop1: number, start2: number, stop2: number, withinBounds?: boolean): number;
    constrain(n: number, low: number, high: number): number;
    dist(x1: number, y1: number, x2: number, y2: number): number;
    lerp(start: number, stop: number, amt: number): number;
    sin(angle: number): number;
    cos(angle: number): number;
    tan(angle: number): number;
    atan2(y: number, x: number): number;
    floor(n: number): number;
    ceil(n: number): number;
    round(n: number): number;
    abs(n: number): number;
    sqrt(n: number): number;
    pow(n: number, e: number): number;
    min(a: number, b: number): number;
    max(a: number, b: number): number;
    int(n: number | string | boolean): number;
    norm(value: number, start: number, stop: number): number;
    noise(x: number, y?: number, z?: number): number;
    noiseSeed(seed: number): void;
    radians(degrees: number): number;
    degrees(radians: number): number;

    // ----- Typography -----
    text(str: string | number, x: number, y: number, x2?: number, y2?: number): void;
    textSize(size: number): void;
    textStyle(style: string): void;
    textWidth(str: string): number;
    textAscent(): number;
    textDescent(): number;

    // ----- Constants -----
    readonly LEFT: string;
    readonly RIGHT: string;
    readonly CENTER: string;
    readonly TOP: string;
    readonly BOTTOM: string;
    readonly BASELINE: string;
    readonly CORNER: string;
    readonly CORNERS: string;
    readonly RGB: string;
    readonly HSB: string;
    readonly HSL: string;
    readonly NORMAL: string;
    readonly ITALIC: string;
    readonly BOLD: string;
    readonly BOLDITALIC: string;
    readonly VIDEO: string;
    readonly AUDIO: string;
    readonly CLOSE: string;
    readonly CHORD: string;
    readonly PIE: string;
    readonly LEFT_ARROW: number;
    readonly RIGHT_ARROW: number;
    readonly UP_ARROW: number;
    readonly DOWN_ARROW: number;
    readonly ENTER: number;
    readonly RETURN: number;
    readonly TAB: number;
    readonly ESCAPE: number;
    readonly BACKSPACE: number;
    readonly DELETE: number;
    readonly SHIFT: number;
    readonly CONTROL: number;
    readonly ALT: number;

    // ----- Event callbacks -----
    setup: () => void;
    draw: () => void;
    mousePressed: () => void;
    mouseReleased: () => void;
    mouseMoved: () => void;
    mouseDragged: () => void;
    keyPressed: () => void;
    keyReleased: () => void;
    windowResized: () => void;
    keyIsDown(code: number): boolean;

    // ----- DOM elements -----
    createGraphics(w: number, h: number): p5.Graphics;
    createButton(label: string, value?: string): p5.Element;
    createSlider(min: number, max: number, value?: number, step?: number): p5.Element;
    createInput(value?: string, type?: string): p5.Element;
    createDiv(html?: string): p5.Element;
    createP(html?: string): p5.Element;
    createSpan(html?: string): p5.Element;
    createSelect(multiple?: boolean): p5.Element;
    createFileInput(callback: (file: p5.File) => void, multiple?: boolean): p5.Element;
    createCapture(type: string, callback?: () => void): p5.Element;
    select(selector: string): p5.Element | null;
    selectAll(selector: string): p5.Element[];

    // ----- Images -----
    loadImage(path: string, successCallback?: (img: p5.Image) => void, failureCallback?: (event: Event) => void): p5.Image;
    image(img: p5.Image | p5.Graphics | p5.Element, x: number, y: number, w?: number, h?: number): void;
    get(x?: number, y?: number, w?: number, h?: number): p5.Color | p5.Image;
    set(x: number, y: number, c: number | p5.Color | p5.Image): void;
    loadPixels(): void;
    updatePixels(x?: number, y?: number, w?: number, h?: number): void;
    readonly pixels: number[];

    // ----- File I/O -----
    saveCanvas(canvas?: p5.Element | HTMLCanvasElement, filename?: string, extension?: string): void;
    save(data?: unknown, filename?: string): void;
    loadStrings(path: string, callback?: (strings: string[]) => void): string[];
    loadJSON(path: string, callback?: (json: object) => void): object;
  }

  /* ================================================================
     p5 namespace — nested classes
     ================================================================ */
  namespace p5 {
    /** Wraps a DOM element created by p5 (createButton, createDiv, etc.) */
    class Element {
      elt: HTMLElement;
      parent(node: string | HTMLElement | p5.Element): this;
      child(node?: string | HTMLElement | p5.Element): this | p5.Element[];
      html(html?: string, append?: boolean): string | this;
      show(): this;
      hide(): this;
      style(property: string, value?: string): string | this;
      attribute(attr: string, value?: string): string | this;
      removeAttribute(attr: string): this;
      value(value?: string | number): string | number | this;
      position(x?: number, y?: number, positionType?: string): { x: number; y: number } | this;
      size(w?: number, h?: number): { width: number; height: number } | this;
      remove(): void;
      changed(fxn: (event: Event) => void): this;
      input(fxn: (event: Event) => void): this;
      mousePressed(fxn: (event: MouseEvent) => void): this;
      id(id?: string): string | this;
      class(cls?: string): string | this;
      addClass(cls: string): this;
      removeClass(cls: string): this;
    }

    /** Off-screen graphics buffer — behaves like a mini p5 instance */
    class Graphics extends p5 {}

    /** Opaque colour object returned by color() */
    class Color {}

    /** Image loaded via loadImage() */
    class Image {
      width: number;
      height: number;
      pixels: number[];
      loadPixels(): void;
      updatePixels(): void;
      get(x?: number, y?: number, w?: number, h?: number): p5.Color | p5.Image;
      set(x: number, y: number, c: number | p5.Color): void;
      resize(w: number, h: number): void;
      copy(
        srcImage: p5.Image | p5.Element,
        sx: number, sy: number, sw: number, sh: number,
        dx: number, dy: number, dw: number, dh: number
      ): void;
    }

    /** File object passed to createFileInput callback */
    class File {
      file: globalThis.File;
      type: string;
      subtype: string;
      name: string;
      size: number;
      data: string;
    }

    /** p5.sound — microphone input (A1E project) */
    class AudioIn {
      start(successCallback?: () => void, errorCallback?: (err: unknown) => void): void;
      stop(): void;
      getLevel(smoothing?: number): number;
      amp(vol: number): void;
      connect(unit?: unknown): void;
      disconnect(): void;
    }
  }

  /* ================================================================
     Bare global functions
     Injected onto window by ProjectManager.exposeP5Globals() so project
     files can call fill() instead of window.fill().
     ================================================================ */
  var background:    (...args: unknown[]) => void;
  var fill:          (...args: unknown[]) => void;
  var stroke:        (...args: unknown[]) => void;
  var noFill:        () => void;
  var noStroke:      () => void;
  var strokeWeight:  (w: number) => void;
  var rectMode:      (mode: string) => void;
  var imageMode:     (mode: string) => void;
  var ellipse:       (x: number, y: number, w: number, h?: number) => void;
  var circle:        (x: number, y: number, d: number) => void;
  var rect:          (x: number, y: number, w: number, h: number, r?: number) => void;
  var square:        (x: number, y: number, s: number, r?: number) => void;
  var line:          (x1: number, y1: number, x2: number, y2: number) => void;
  var point:         (x: number, y: number) => void;
  var triangle:      (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => void;
  var beginShape:    () => void;
  var endShape:      (mode?: string) => void;
  var vertex:        (x: number, y: number) => void;
  var arc:           (x: number, y: number, w: number, h: number, start: number, stop: number) => void;
  var push:          () => void;
  var pop:           () => void;
  var translate:     (x: number, y: number) => void;
  var rotate:        (angle: number) => void;
  var scale:         (x: number, y?: number) => void;
  var resetMatrix:   () => void;
  var text:          (str: string | number, x: number, y: number, x2?: number, y2?: number) => void;
  var textSize:      (size: number) => void;
  var textAlign:     (h: string, v?: string) => void;
  var textStyle:     (style: string) => void;
  var textWidth:     (str: string) => number;
  var color:         (...args: unknown[]) => p5.Color;
  var lerpColor:     (c1: p5.Color, c2: p5.Color, amt: number) => p5.Color;
  var red:           (c: p5.Color) => number;
  var green:         (c: p5.Color) => number;
  var blue:          (c: p5.Color) => number;
  var hue:           (c: p5.Color) => number;
  var saturation:    (c: p5.Color) => number;
  var brightness:    (c: p5.Color) => number;
  var alpha:         (c: p5.Color) => number;
  var colorMode:     (mode: string, ...args: number[]) => void;
  var random:        (...args: unknown[]) => number;
  var randomGaussian:(mean?: number, sd?: number) => number;
  var map:           (value: number, start1: number, stop1: number, start2: number, stop2: number) => number;
  var constrain:     (n: number, low: number, high: number) => number;
  var dist:          (x1: number, y1: number, x2: number, y2: number) => number;
  var lerp:          (start: number, stop: number, amt: number) => number;
  var sin:           (angle: number) => number;
  var cos:           (angle: number) => number;
  var tan:           (angle: number) => number;
  var atan2:         (y: number, x: number) => number;
  var floor:         (n: number) => number;
  var ceil:          (n: number) => number;
  var round:         (n: number) => number;
  var abs:           (n: number) => number;
  var sqrt:          (n: number) => number;
  var pow:           (n: number, e: number) => number;
  var min:           (...args: unknown[]) => number;
  var max:           (...args: unknown[]) => number;
  var int:           (n: number | string | boolean) => number;
  var norm:          (value: number, start: number, stop: number) => number;
  var noise:         (x: number, y?: number, z?: number) => number;
  var noiseSeed:     (seed: number) => void;
  var radians:       (degrees: number) => number;
  var degrees:       (radians: number) => number;
  var noLoop:        () => void;
  var loop:          () => void;
  var redraw:        () => void;
  var resizeCanvas:  (w: number, h: number) => void;
  var keyIsDown:     (code: number) => boolean;
  var createGraphics:(w: number, h: number) => p5.Graphics;
  var createButton:  (label: string, value?: string) => p5.Element;
  var createSlider:  (min: number, max: number, value?: number, step?: number) => p5.Element;
  var createInput:   (value?: string, type?: string) => p5.Element;
  var createDiv:     (html?: string) => p5.Element;
  var createCapture: (type: string, callback?: () => void) => p5.Element;
  var createFileInput:(callback: (file: p5.File) => void, multiple?: boolean) => p5.Element;
  var loadImage:     (path: string, cb?: (img: p5.Image) => void, errCb?: (e: Event) => void) => p5.Image;
  var image:         (img: p5.Image | p5.Graphics | p5.Element, x: number, y: number, w?: number, h?: number) => void;
  var saveCanvas:    (canvas?: p5.Element | HTMLCanvasElement, filename?: string, ext?: string) => void;
  var loadPixels:    () => void;
  var updatePixels:  () => void;
  var get:           (x?: number, y?: number, w?: number, h?: number) => p5.Color | p5.Image;
  var set:           (x: number, y: number, c: number | p5.Color | p5.Image) => void;

  /** p5 state available as bare globals */
  var width:         number;
  var height:        number;
  var frameCount:    number;
  var mouseX:        number;
  var mouseY:        number;
  var pmouseX:       number;
  var pmouseY:       number;
  var mouseIsPressed: boolean;
  var key:           string;
  var keyCode:       number;
  var pixels:        number[];

  /** p5 constants */
  var PI:            number;
  var TWO_PI:        number;
  var HALF_PI:       number;
  var CENTER:        string;
  var LEFT:          string;
  var RIGHT:         string;
  var TOP:           string;
  var BOTTOM:        string;
  var CORNER:        string;
  var CORNERS:       string;
  var RGB:           string;
  var HSB:           string;
  var NORMAL:        string;
  var BOLD:          string;
  var ITALIC:        string;
  var VIDEO:         string;
  var AUDIO:         string;
  var CLOSE:         string;
  var LEFT_ARROW:    number;
  var RIGHT_ARROW:   number;
  var UP_ARROW:      number;
  var DOWN_ARROW:    number;
  var ENTER:         number;
  var RETURN:        number;
  var ESCAPE:        number;
  var BACKSPACE:     number;
  var SHIFT:         number;
  var CONTROL:       number;
  var ALT:           number;

  /* ================================================================
     Window augmentation
     ================================================================ */
  interface Window {
    /** p5 constructor — set by the CDN <script> load */
    p5: typeof p5;

    /** Core controllers assigned at the bottom of each core module */
    projectManager: import('../../core/ProjectManager').ProjectManager;
    uiController:   import('../../core/UIController').UIController;
    uxEnhancements: import('../../core/UXEnhancements').UXEnhancements;
    apiClient:      import('../../core/APIClient').APIClient;

    /* p5 drawing functions exposed by ProjectManager.exposeP5Globals() */
    background:   (...args: unknown[]) => void;
    fill:         (...args: unknown[]) => void;
    stroke:       (...args: unknown[]) => void;
    noFill:       () => void;
    noStroke:     () => void;
    strokeWeight: (w: number) => void;
    rectMode:     (mode: string) => void;
    imageMode:    (mode: string) => void;
    ellipse:      (x: number, y: number, w: number, h?: number) => void;
    circle:       (x: number, y: number, d: number) => void;
    rect:         (x: number, y: number, w: number, h: number, r?: number) => void;
    square:       (x: number, y: number, s: number, r?: number) => void;
    line:         (x1: number, y1: number, x2: number, y2: number) => void;
    point:        (x: number, y: number) => void;
    triangle:     (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => void;
    beginShape:   () => void;
    endShape:     (mode?: string) => void;
    vertex:       (x: number, y: number) => void;
    arc:          (x: number, y: number, w: number, h: number, start: number, stop: number) => void;
    push:         () => void;
    pop:          () => void;
    translate:    (x: number, y: number) => void;
    rotate:       (angle: number) => void;
    scale:        (x: number, y?: number) => void;
    resetMatrix:  () => void;
    text:         (str: string | number, x: number, y: number, x2?: number, y2?: number) => void;
    textSize:     (size: number) => void;
    textAlign:    (h: string, v?: string) => void;
    textStyle:    (style: string) => void;
    textWidth:    (str: string) => number;
    color:        (...args: unknown[]) => p5.Color;
    lerpColor:    (c1: p5.Color, c2: p5.Color, amt: number) => p5.Color;
    red:          (c: p5.Color) => number;
    green:        (c: p5.Color) => number;
    blue:         (c: p5.Color) => number;
    hue:          (c: p5.Color) => number;
    saturation:   (c: p5.Color) => number;
    brightness:   (c: p5.Color) => number;
    alpha:        (c: p5.Color) => number;
    colorMode:    (mode: string, ...args: number[]) => void;
    random:       (...args: unknown[]) => number;
    randomGaussian: (mean?: number, sd?: number) => number;
    map:          (value: number, start1: number, stop1: number, start2: number, stop2: number) => number;
    constrain:    (n: number, low: number, high: number) => number;
    dist:         (x1: number, y1: number, x2: number, y2: number) => number;
    lerp:         (start: number, stop: number, amt: number) => number;
    sin:          (angle: number) => number;
    cos:          (angle: number) => number;
    tan:          (angle: number) => number;
    atan2:        (y: number, x: number) => number;
    floor:        (n: number) => number;
    ceil:         (n: number) => number;
    round:        (n: number) => number;
    abs:          (n: number) => number;
    sqrt:         (n: number) => number;
    pow:          (n: number, e: number) => number;
    min:          (...args: unknown[]) => number;
    max:          (...args: unknown[]) => number;
    int:          (n: number | string | boolean) => number;
    norm:         (value: number, start: number, stop: number) => number;
    noise:        (x: number, y?: number, z?: number) => number;
    noiseSeed:    (seed: number) => void;
    radians:      (degrees: number) => number;
    degrees:      (radians: number) => number;
    noLoop:       () => void;
    loop:         () => void;
    redraw:       () => void;
    resizeCanvas: (w: number, h: number) => void;
    keyIsDown:    (code: number) => boolean;
    createGraphics: (w: number, h: number) => p5.Graphics;
    createButton:   (label: string, value?: string) => p5.Element;
    createSlider:   (min: number, max: number, value?: number, step?: number) => p5.Element;
    createInput:    (value?: string, type?: string) => p5.Element;
    createDiv:      (html?: string) => p5.Element;
    createCapture:  (type: string, callback?: () => void) => p5.Element;
    createFileInput: (callback: (file: p5.File) => void, multiple?: boolean) => p5.Element;
    loadImage:      (path: string, cb?: (img: p5.Image) => void) => p5.Image;
    image:          (img: p5.Image | p5.Graphics | p5.Element, x: number, y: number, w?: number, h?: number) => void;
    saveCanvas:     (canvas?: p5.Element | HTMLCanvasElement, filename?: string, ext?: string) => void;
    loadPixels:     () => void;
    updatePixels:   () => void;
    get:            (x?: number, y?: number, w?: number, h?: number) => p5.Color | p5.Image;
    set:            (x: number, y: number, c: number | p5.Color | p5.Image) => void;

    /* p5 state values */
    width:         number;
    height:        number;
    frameCount:    number;
    mouseX:        number;
    mouseY:        number;
    pmouseX:       number;
    pmouseY:       number;
    mouseIsPressed: boolean;
    key:           string;
    keyCode:       number;
    pixels:        number[];

    /* p5 constants */
    PI:            number;
    TWO_PI:        number;
    HALF_PI:       number;
    LEFT:          string;
    RIGHT:         string;
    CENTER:        string;
    TOP:           string;
    BOTTOM:        string;
    CORNER:        string;
    CORNERS:       string;
    BASELINE:      string;
    RGB:           string;
    HSB:           string;
    NORMAL:        string;
    ITALIC:        string;
    BOLD:          string;
    VIDEO:         string;
    AUDIO:         string;
    CLOSE:         string;
    LEFT_ARROW:    number;
    RIGHT_ARROW:   number;
    UP_ARROW:      number;
    DOWN_ARROW:    number;
    ENTER:         number;
    RETURN:        number;
    ESCAPE:        number;
    BACKSPACE:     number;
    SHIFT:         number;
    CONTROL:       number;
    ALT:           number;
  }
}
