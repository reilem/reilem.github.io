/**
 * TODO:
 * - Complete the mesh network
 * - Make code/tool icons clickable
 * - CSS animations of things appearing as you scroll down
 * - More content, timeline, etc.
 */
const POINT_COUNT = 200;
const LINE_COLOR = '#5c5c5c';
const MESH_MARGIN = 100;

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
 * @returns {{x: number, y: number}[]}
 */
function generateMeshPoints() {
    const myrng = new Math.seedrandom('223456780');
    const margin = MESH_MARGIN;
    return generatePoints(myrng, margin, margin, window.innerWidth - margin * 2, window.innerHeight - margin * 2, POINT_COUNT);
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
    const triangleCount = delaunay.triangles.length / 3;
    for (let i = 0; i < triangleCount; i++) {
        drawTriangle(ctx, points, delaunay, i);
    }
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
    trianglePoints.forEach((point, i) => {
        const isLastPoint = i === trianglePoints.length - 1;
        const nextPoint = isLastPoint ? trianglePoints[0] : trianglePoints[i + 1];
        const aPointOnHull = hull.includes(point.index) || hull.includes(nextPoint.index);
        if (!aPointOnHull) {
            drawLine(ctx, point, nextPoint);
        }
    });
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x: number, y: number}} point1
 * @param {{x: number, y: number}} point2
 */
function drawLine(ctx, { x: x0, y: y0 }, { x: x1, y: y1 }) {
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = '1';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}

function draw() {
    const ctx = initialiseCanvas();
    const points = generateMeshPoints();
    const delaunay = new Delaunator(pointsToArray(points));
    drawTriangles(ctx, points, delaunay);
}

window.onload = draw;
