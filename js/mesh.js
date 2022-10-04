const VERTICAL_MESH_MARGIN = 80;
const HORIZONTAL_MESH_MARGIN = 20;
const SEED = '1111011101';
const MIN_TRIANGLE_SIZE = 30;
const LINE_WIDTH = 0.75;
const TOUCH_ANIMATION_SPEED = 0.03;

// Has a mouse hover been detected on this screen
let mouseHoverDetected = false;
// Is this the first load
let firstLoad = true;
// Y coordinate position of the top-to-bottom mesh loading animation
// 0 = starting animation, null = animation inactive
let loadingAnimationYPosition = 0;
// The alpha of the touch glow when pressing on mobile
// 0 = starting, null = animation inactive
let touchAnimationIntensity = 1; // TODO: reverse glow if hovering
let touchAnimationDecrease = false;
// Reference to the current animation frame
let currentAnimation = null;
// Previous mouse position (used to throttle updates)
let previousMousePosition = null;
// Current mouse position
const mousePosition = { x: -100, y: -100 };

/**
 * @param {{x: number, y: number}} position
 * @param {boolean} hover
 */
function setMousePosition(position, hover) {
    const isHover = mouseHoverDetected || hover;
    if (isHover) {
        updateMouseHoverPosition(position);
    } else {
        startTouchAnimation(position);
    }
}

/**
 * @param {{x: number, y: number}} position : ;
 */
function updateMouseHoverPosition(position) {
    mouseHoverDetected = true;
    mousePosition.x = position.x;
    mousePosition.y = position.y;
}

/**
 * @param {{x: number, y: number}} position : ;
 */
function startTouchAnimation(position) {
    if (touchAnimationIntensity == null) {
        mousePosition.x = position.x;
        mousePosition.y = position.y;
        touchAnimationIntensity = 0;
    }
}

/**
 * @returns {CanvasRenderingContext2D}
 */
function initialiseCanvas() {
    const canvas = getCanvas();
    canvas.width = toCanvasScale(getWidth(canvas));
    canvas.height = toCanvasScale(getHeight(canvas));
    if (!canvas) {
        console.warn('Failed to get canvas');
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.warn('Failed to get canvas context');
        return;
    }
    return ctx;
}

/**
 * @param {() => number} random
 * @returns {{x: number, y: number}[]}
 */
function generateMeshPoints(random) {
    const { width: canvasWidth, height: canvasHeight } = getCanvasSize();
    const pointCount = getPointCount(canvasWidth);
    const width = canvasWidth - HORIZONTAL_MESH_MARGIN * 2;
    const height = canvasHeight - VERTICAL_MESH_MARGIN * 2;
    const points = generatePoints(random, HORIZONTAL_MESH_MARGIN, VERTICAL_MESH_MARGIN, width, height, pointCount);
    return prunePoints(points, MIN_TRIANGLE_SIZE);
}

/**
 * @param {{x: number, y: number}[]} points
 * @param {{ triangles: number[], hull: number[] }} delaunay
 * @returns {{p0: {x: number, y: number, index: number}, p1: {x: number, y: number, index: number}}[]}
 */
function getLinesToDraw(points, delaunay) {
    const triangleCount = delaunay.triangles.length / 3;
    const { triangles, hull } = delaunay;
    const lines = {};
    for (let index = 0; index < triangleCount; index++) {
        const offset = index * 3;
        const trianglePoints = makeArray(3).map((_, i) => {
            const pointIndex = triangles[i + offset];
            return { ...points[pointIndex], index: pointIndex };
        });
        const triangleIsOnHull = trianglePoints.some(({ index }) => hull.includes(index));
        if (triangleIsOnHull) {
            continue; // Do not draw triangles on the hull
        }
        trianglePoints.forEach((point, i) => {
            const isLastPoint = i === trianglePoints.length - 1;
            const nextPoint = isLastPoint ? trianglePoints[0] : trianglePoints[i + 1];
            const line = { p0: point, p1: nextPoint };
            const lineHash = getLineHash(line);
            if (!lines[lineHash]) {
                lines[lineHash] = line;
            }
        });
    }
    return Object.values(lines);
}

/**
 * @returns {boolean}
 */
function isShowingLoadingAnimation() {
    return loadingAnimationYPosition != null;
}

/**
 * Updates the loading animation position
 */
function updateLoadingAnimation() {
    if (loadingAnimationYPosition == null) {
        return;
    }
    const { height } = getCanvasSize();
    if (loadingAnimationYPosition >= height + getAnimationSpread(height)) {
        loadingAnimationYPosition = null;
        previousMousePosition = null;
    } else {
        loadingAnimationYPosition += getAnimationSpeed(height);
    }
}

function updateTouchAnimation() {
    if (touchAnimationIntensity == null) {
        return;
    }
    // Update the intensity
    if (touchAnimationDecrease) {
        touchAnimationIntensity -= TOUCH_ANIMATION_SPEED;
    } else {
        touchAnimationIntensity += TOUCH_ANIMATION_SPEED;
    }
    // Flip around if it reaches 1, and stop if it drops below zero
    if (touchAnimationIntensity >= 1.0) {
        touchAnimationIntensity = 1.0;
        touchAnimationDecrease = true;
    } else if (touchAnimationIntensity <= 0) {
        touchAnimationIntensity = null;
        touchAnimationDecrease = false;
    }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{p0: {x: number, y: number, index: number}, p1: {x: number, y: number, index: number}}[]} lines
 */
function drawLines(ctx, lines) {
    const { x, y } = mousePosition;
    const colors = getColors();
    let grad;
    const { width, height } = getCanvasSize();
    if (isShowingLoadingAnimation()) {
        const scaledYPosition = toCanvasScale(loadingAnimationYPosition);
        const scaledSpread = toCanvasScale(getAnimationSpread(height));
        grad = ctx.createLinearGradient(0, scaledYPosition, 0, scaledYPosition + scaledSpread);
        grad.addColorStop(0, colors.meshColor);
        grad.addColorStop(0.5, colors.meshHighlightColor);
        grad.addColorStop(1, colors.backgroundColor);
    } else {
        const scaledX = toCanvasScale(x);
        const scaledY = toCanvasScale(y);
        const scaledInner = toCanvasScale(getMouseInnerCircle(width, height));
        const scaledOuter = toCanvasScale(getMouseOuterCircle(width, height));
        grad = ctx.createRadialGradient(scaledX, scaledY, scaledInner, scaledX, scaledY, scaledOuter);
        if (mouseHoverDetected) {
            grad.addColorStop(0, colors.meshHighlightColor);
            grad.addColorStop(1, colors.meshColor);
        } else {
            const touchColor = getGradient(colors.meshColor, colors.meshHighlightColor, touchAnimationIntensity);
            grad.addColorStop(0, touchColor);
            grad.addColorStop(1, colors.meshColor);
        }
    }
    ctx.strokeStyle = grad;
    ctx.lineWidth = toCanvasScale(LINE_WIDTH);
    ctx.clearRect(0, 0, toCanvasScale(width), toCanvasScale(height));
    ctx.beginPath();
    lines.forEach(({ p0, p1 }) => drawLine(ctx, p0, p1));
    ctx.stroke();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number}} p0
 * @param {{x: number, y: number}} p1
 */
function drawLine(ctx, p0, p1) {
    const { x: x0, y: y0 } = p0;
    const { x: x1, y: y1 } = p1;
    ctx.moveTo(toCanvasScale(x0), toCanvasScale(y0));
    ctx.lineTo(toCanvasScale(x1), toCanvasScale(y1));
}

/**
 * @returns {boolean}
 */
function isValidUpdate() {
    if (loadingAnimationYPosition != null) {
        return true;
    }
    if (touchAnimationIntensity != null) {
        return true;
    }
    const { width, height } = getCanvasSize();
    return (
        mousePosition.y < height + getMouseOuterCircle(width, height) &&
        (previousMousePosition == null || mousePosition.x !== previousMousePosition.x || mousePosition.y !== previousMousePosition.y)
    );
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{p0: {x: number, y: number, index: number}, p1: {x: number, y: number, index: number}}[]} lines
 */
function updateMesh(ctx, lines) {
    if (isValidUpdate()) {
        drawLines(ctx, lines);
        previousMousePosition = { ...mousePosition };
        updateLoadingAnimation();
        updateTouchAnimation();
    }
    currentAnimation = requestAnimationFrame(() => {
        updateMesh(ctx, lines);
    });
}

/**
 * Starts a new mesh animation
 */
function startMesh() {
    if (currentAnimation) {
        cancelAnimationFrame(currentAnimation);
        previousMousePosition = null;
    }
    const random = new Math.seedrandom(SEED);
    const ctx = initialiseCanvas();
    const points = generateMeshPoints(random);
    const delaunay = new Delaunator(pointsToArray(points));
    const lines = getLinesToDraw(points, delaunay);
    if (firstLoad) {
        firstLoad = false;
        setTimeout(() => updateMesh(ctx, lines), 200); // Give the time page to load before starting
    } else {
        updateMesh(ctx, lines);
    }
}
