/**
 * TODO:
 * - Complete the mesh network, ideas:
 *   - On load, do a reveal of the mesh (use gradient) from top to bottom
 *   - Mouse over move, points try to move away from mouse for a certain max distance
 * - CSS animations of things appearing as you scroll down
 * - More content, timeline, etc.
 */
const VERTICAL_MESH_MARGIN = 60;
const HORIZONTAL_MESH_MARGIN = 20;
const SEED = '223347780';
const MIN_TRIANGLE_SIZE = 30;

let previousMousePosition = null;
const mousePosition = { x: 0, y: 0 };

/**
 * Scrolls down one page
 */
function scrollToSecondPage() {
    window.scroll({
        top: window.innerHeight,
        left: 0,
        behavior: 'smooth',
    });
}

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
    const canvas = document.getElementById('meshcanvas01');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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
    const pointCount = getPointCount();
    const width = window.innerWidth - HORIZONTAL_MESH_MARGIN * 2;
    const height = window.innerHeight - VERTICAL_MESH_MARGIN * 2;
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
 * @param {CanvasRenderingContext2D} ctx
 * @param {{p0: {x: number, y: number, index: number}, p1: {x: number, y: number, index: number}}[]} lines
 */
function drawLines(ctx, lines) {
    const { x, y } = mousePosition;
    const grad = ctx.createRadialGradient(x, y, 50, x, y, 150);
    const colors = getColors();
    grad.addColorStop(0, colors.meshHighlightColor);
    grad.addColorStop(1, colors.meshColor);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 0.5;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    lines.forEach(({ p0, p1 }) => drawLine(ctx, p0, p1));
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number}} p0
 * @param {{x: number, y: number}} p1
 */
function drawLine(ctx, p0, p1) {
    const { x: x0, y: y0 } = p0;
    const { x: x1, y: y1 } = p1;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}

/**
 * @returns {boolean}
 */
function isValidUpdate() {
    return (
        mousePosition.y < window.innerHeight &&
        (previousMousePosition == null || mousePosition.x !== previousMousePosition.x || mousePosition.y !== previousMousePosition.y)
    );
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{p0: {x: number, y: number, index: number}, p1: {x: number, y: number, index: number}}[]} lines
 */
function updateMesh(ctx, lines) {
    if (isValidUpdate()) {
        drawLines(ctx, lines);
        previousMousePosition = { ...mousePosition };
    }
    requestAnimationFrame(() => {
        updateMesh(ctx, lines);
    });
}

function startMesh() {
    const random = new Math.seedrandom(SEED);
    const ctx = initialiseCanvas();
    const points = generateMeshPoints(random);
    const delaunay = new Delaunator(pointsToArray(points));
    const lines = getLinesToDraw(points, delaunay);
    updateMesh(ctx, lines);
}

window.onload = startMesh;
window.onmousemove = setMousePosition;
