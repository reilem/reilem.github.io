/**
 * TODO:
 * - Complete the mesh network, ideas:
 *   - Passive random line glowing
 *   - Mouse over move, points try to move away from mouse for a certain max distance
 * - Make code/tool icons clickable
 * - CSS animations of things appearing as you scroll down
 * - More content, timeline, etc.
 */
const POINT_COUNT = window.innerWidth / 3;
const HIGHLIGHT_COLOR = '#fff';
const LINE_COLOR = '#565656';
const VERTICAL_MESH_MARGIN = 100;
const HORIZONTAL_MESH_MARGIN = 40;
const SEED = '223347780';
const MIN_TRIANGLE_SIZE = 30;

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
    const width = window.innerWidth - HORIZONTAL_MESH_MARGIN * 2;
    const height = window.innerHeight - VERTICAL_MESH_MARGIN * 2;
    const points = generatePoints(random, HORIZONTAL_MESH_MARGIN, VERTICAL_MESH_MARGIN, width, height, POINT_COUNT);
    return removePointsTooCloseTogether(points);
}

/**
 *
 * @param {{x: number, y: number}[]} points
 * @param {{ triangles: number[], hull: number[] }} delaunay
 * @returns {{p0: {x: number, y: number}, p1: {x: number, y: number}}[]}
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
 * @param {{x: number, y: number}[]} points
 * @returns {{x: number, y: number}[]}
 */
function removePointsTooCloseTogether(points) {
    const sortedPoints = [...points].sort((p1, p2) => p1.x - p2.x);
    return sortedPoints.filter((point, index) => {
        return !sortedPoints.slice(index + 1, index + 10).some(point2 => distance(point, point2) < MIN_TRIANGLE_SIZE);
    });
}

/**
 * @param {() => number} random
 * @param {number} width
 * @param {number} height
 * @param {number} count
 * @returns {{x: number, y: number}[]}
 */
function generatePoints(random, x, y, width, height, count) {
    return makeArray(count).map(_ => ({ x: random() * width + x, y: random() * height + y }));
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{p0: {x: number, y: number}, p1: {x: number, y: number}}[]} lines
 */
function drawLines(ctx, lines) {
    const { x, y } = mousePosition;
    const grad = ctx.createRadialGradient(x, y, 50, x, y, 150);
    grad.addColorStop(0, HIGHLIGHT_COLOR);
    grad.addColorStop(1, LINE_COLOR);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 0.5;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    lines.forEach(({ p0, p1 }) => drawLine(ctx, p0, p1));
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number}} point1
 * @param {{x: number, y: number}} point2
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
 * @param {{x: number, y: number}[]} points
 * @param {{ triangles: number[], hull: number[] }} delaunay
 * @param {() => number} random
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
