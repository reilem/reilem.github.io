const CANVAS_ID = 'meshcanvas01';
const CANVAS_SCALE = 2;

/**
 * @param {MouseEvent} event
 * @returns {{x: number, y: number}}
 */
function getMousePosition(event) {
    return { x: event.pageX, y: event.pageY };
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
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} count
 * @returns {{x: number, y: number}[]}
 */
function generatePoints(random, x, y, width, height, count) {
    return makeArray(count).map(_ => ({ x: random() * width + x, y: random() * height + y }));
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
 * @param {{x: number, y: number}[]} points
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
 * @param {{p0: {index: number}, p1: {index: number}}} line
 * @return {string}
 */
function getLineHash({ p0, p1 }) {
    const lowerIndex = Math.min(p0.index, p1.index);
    const higherIndex = Math.max(p0.index, p1.index);
    return `(${lowerIndex},${higherIndex})`;
}

/**
 * Filters out points that are closer together than given limit.
 * @param {{x: number, y: number}[]} points
 * @param {number} limit
 * @returns {{x: number, y: number}[]}
 */
function prunePoints(points, limit) {
    const sortedPoints = [...points].sort((p1, p2) => p1.x - p2.x);
    return sortedPoints.filter((point, index) => {
        return !sortedPoints.slice(index + 1, index + 10).some(point2 => distance(point, point2) < limit);
    });
}

/**
 * @returns {{ meshColor: string, meshHighlightColor: string, backgroundColor: string }}
 */
function getColors() {
    const style = getComputedStyle(document.documentElement);
    return {
        meshColor: style.getPropertyValue('--mesh-color'),
        meshHighlightColor: style.getPropertyValue('--mesh-highlight-color'),
        backgroundColor: style.getPropertyValue('--background-color'),
    };
}

/**
 * @param {number} width
 * @returns {number}
 */
function getPointCount(width) {
    return width / 2.5;
}

/**
 * @returns {HTMLElement}
 */
function getCanvas() {
    return document.getElementById(CANVAS_ID);
}

function getCanvasSize() {
    const canvas = getCanvas();
    return { width: getWidth(canvas), height: getHeight(canvas) };
}

/**
 * @param {HTMLElement} htmlElement
 * @returns {number}
 */
function getWidth(htmlElement) {
    return htmlElement.offsetWidth;
}

/**
 * @param {HTMLElement} htmlElement
 * @returns {number}
 */
function getHeight(htmlElement) {
    return htmlElement.offsetHeight;
}

/**
 * @param {number} value
 * @returns {number}
 */
function toCanvasScale(value) {
    return value * CANVAS_SCALE;
}

/**
 * @param {number} width
 * @param {number} height
 * @returns {number}
 */
function getMouseInnerCircle(width, height) {
    return (3.5 * width * height) / 100000 + 15;
}

/**
 * @param {number} width
 * @param {number} height
 * @returns {number}
 */
function getMouseOuterCircle(width, height) {
    return (width * height) / 10000 + 45;
}

/**
 * @param {number} height
 * @returns {number}
 */
function getAnimationSpeed(height) {
    return height / 35;
}

/**
 * @param {number} height
 * @returns {number}
 */
function getAnimationSpread(height) {
    return height / 7;
}

/**
 * Get rgb components from hex string
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number }}
 */
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return { r, g, b };
}

/**
 * Applies color1 to color0 with a certain intensity
 * @param {string} color0
 * @param {string} color1
 * @param {number} intensity
 * @returns
 */
function getGradient(color0, color1, intensity) {
    const { r: r0, g: g0, b: b0 } = hexToRgb(color0);
    const { r: r1, g: g1, b: b1 } = hexToRgb(color1);

    const applyIntensity = (a0, a1) => a0 + (a1 - a0) * intensity;

    const { r, g, b } = { r: applyIntensity(r0, r1), g: applyIntensity(g0, g1), b: applyIntensity(b0, b1) };
    return `rgb(${r},${g},${b})`;
}
