/**
 * TODO:
 * - Complete the mesh network, ideas:
 *   - Passive random line glowing
 *   - Mouse over glow
 *   - Mouse over move, points try to move away from mouse for a certain max distance
 *   - Some animation on scroll?
 * - Make code/tool icons clickable
 * - CSS animations of things appearing as you scroll down
 * - More content, timeline, etc.
 */
const POINT_COUNT = 300; // TODO: dependent on window size?
const LINE_COLOR = '#464646';
const VERTICAL_MESH_MARGIN = 100;
const HORIZONTAL_MESH_MARGIN = 40;
const SEED = '223347780';
const MIN_TRIANGLE_SIZE = 30;

let previousMousePosition = null;
const mousePosition = { x: 0, y: 0 };

function scrollToSecond() {
    window.scroll({
        top: document.body.clientHeight,
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
 * @param {number} size
 * @param {string[]}
 */
function makeArray(size) {
    return Array.from('_'.repeat(size));
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
 * @param {{x: number, y: number}} p1
 * @param {{x: number, y: number}} p2
 * @returns {number}
 */
function distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
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
 * @param {{x: number, y: number}[]} pointsArray
 * @returns {number[]}
 */
function pointsToArray(points) {
    return points.reduce((acc, { x, y }) => {
        acc.push(x);
        acc.push(y);
        return acc;
    }, []);
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number}[]} points
 * @param {{ triangles: number[], hull: number[] }} delaunay
 */
function drawTriangles(ctx, points, delaunay) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const triangleCount = delaunay.triangles.length / 3;
    for (let i = 0; i < triangleCount; i++) {
        drawTriangle(ctx, points, delaunay, i);
    }
}

/**
 *
 * @param {{{x: number, y: number, index: number}[]} points} points
 */
function isTriangleTooThin(points) {
    const xCoords = points.map(({ x }) => x);
    const yCoords = points.map(({ y }) => y);
    const yMin = Math.min(...yCoords);
    const yMax = Math.max(...yCoords);
    const xMin = Math.min(...xCoords);
    const xMax = Math.max(...xCoords);
    if (xMax - xMin < MIN_TRIANGLE_SIZE || yMax - yMin < MIN_TRIANGLE_SIZE) {
        return true;
    }
    return false;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number}[]} points
 * @param {{ triangles: number[], hull: number[] }} delaunay
 * @param {number} index
 */
function drawTriangle(ctx, points, delaunay, index) {
    const { triangles, hull } = delaunay;
    const offset = index * 3;
    const trianglePoints = makeArray(3).map((_, i) => {
        const pointIndex = triangles[i + offset];
        return { ...points[pointIndex], index: pointIndex };
    });
    const triangleIsOnHull = trianglePoints.some(({ index }) => hull.includes(index));
    if (triangleIsOnHull || isTriangleTooThin(trianglePoints)) {
        return;
    }
    trianglePoints.forEach((point, i) => {
        const isLastPoint = i === trianglePoints.length - 1;
        const nextPoint = isLastPoint ? trianglePoints[0] : trianglePoints[i + 1];
        drawLine(ctx, point, nextPoint);
    });
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number}} point1
 * @param {{x: number, y: number}} point2
 */
function drawLine(ctx, { x: x0, y: y0 }, { x: x1, y: y1 }) {
    ctx.strokeStyle = LINE_COLOR;
    if (distance(mousePosition, { x: x0, y: y0 }) < 50) {
        ctx.strokeStyle = '#fff';
    }
    ctx.lineWidth = '1';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}

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
function updateMesh(ctx, points, delaunay, random) {
    if (isValidUpdate()) {
        console.log('UPDATE', mousePosition);
        drawTriangles(ctx, points, delaunay);
        previousMousePosition = { ...mousePosition };
    }
    requestAnimationFrame(() => {
        updateMesh(ctx, points, delaunay, random);
    });
}

function startMesh() {
    const random = new Math.seedrandom(SEED);
    const ctx = initialiseCanvas();
    const points = generateMeshPoints(random);
    const delaunay = new Delaunator(pointsToArray(points));
    updateMesh(ctx, points, delaunay, random);
}

/**
 * @param {MouseEvent} event
 */
function setMousePosition(event) {
    mousePosition.x = event.pageX;
    mousePosition.y = event.pageY;
}

window.onload = startMesh;
window.onmousemove = setMousePosition;
