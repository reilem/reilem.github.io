/**
 * TODO:
 * - CSS animations of things appearing as you scroll down
 * - More content, timeline, etc.
 */

function onResize() {
    startMesh();
}

function onLoad() {
    observeIntersections();
    startMesh();
}

window.onresize = onResize;
window.onload = onLoad;
