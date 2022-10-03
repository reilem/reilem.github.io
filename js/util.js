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
 * @returns {number}
 */
function getPointCount() {
    return window.innerWidth / 3;
}
