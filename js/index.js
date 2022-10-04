let throttleResize = false;

/**
 * Called when window resizes
 */
function onResize() {
    if (throttleResize) {
        return;
    }
    throttleResize = true;
    startMesh();
    setTimeout(() => {
        throttleResize = false;
    }, 1000 / 30); // Only resize at 30 FPS
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
