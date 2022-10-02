/**
 * @param {number} size
 * @param {string[]}
 */
function makeArray(size) {
    return Array.from('_'.repeat(size));
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
 * @param {{p0: {x: number, y: number}, p1: {x: number, y: number}}} point
 * @return {string}
 */
function getLineHash({ p0, p1 }) {
    const minX = Math.min(p0.x, p1.x);
    const minY = Math.min(p0.y, p1.y);
    const maxX = Math.max(p0.x, p1.x);
    const maxY = Math.max(p0.y, p1.y);
    return `${minX}${minY}${maxX}${maxY}`;
}
