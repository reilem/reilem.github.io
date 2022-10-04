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

/**
 * Called when mouse hovers over screen (usually only mobile)
 * @param {MouseEvent} event
 */
function onMouseHover(event) {
    setMousePosition(getMousePosition(event), true);
}

/**
 * Called when mouse press or touch goes down
 * @param {MouseEvent} event
 */
function onMouseDown(event) {
    setMousePosition(getMousePosition(event), false);
}

window.onresize = onResize;
window.onload = onLoad;
window.onmousemove = onMouseHover;
window.onpointerdown = onMouseDown;
