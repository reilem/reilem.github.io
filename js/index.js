/**
 * Called when window resizes
 */
function onResize() {
    startMesh();
}

/**
 * Called when window loads
 */
function onLoad() {
    wipeNoJsTags();
    observeIntersections();
    startMesh();
}

window.onresize = onResize;
window.onload = onLoad;
