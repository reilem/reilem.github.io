const VERTICAL_MESH_MARGIN = 80;
const HORIZONTAL_MESH_MARGIN = 20;
const SEED = '1111011101';
const MIN_TRIANGLE_SIZE = 30;
const LINE_WIDTH = 0.75;

let loadingAnimationYPosition = 0;
let currentAnimation = null;
let previousMousePosition = null;
const mousePosition = { x: 0, y: 0 };

/**
 * @param {MouseEvent} event
 */
function setMousePosition(event) {
    mousePosition.x = event.pageX;
    mousePosition.y = event.pageY;
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
        const scaledInner = toCanvasScale(getMouseInnerCircle(height));
        const scaledOuter = toCanvasScale(getMouseOuterCircle(height));
        grad = ctx.createRadialGradient(scaledX, scaledY, scaledInner, scaledX, scaledY, scaledOuter);
        grad.addColorStop(0, colors.meshHighlightColor);
        grad.addColorStop(1, colors.meshColor);
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
    const { width, height } = getCanvasSize();
    return (
        mousePosition.y < height + getMouseOuterCircle(width) &&
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
    updateMesh(ctx, lines);
}

window.onmousemove = setMousePosition;
window.onpointerdown = setMousePosition;
