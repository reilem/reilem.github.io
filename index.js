function scrollToSecond () {
    window.scroll({
        top: document.body.clientHeight,
        left: 0,
        behavior: "smooth",
    });
}

function draw() {
    const canvas = document.getElementById('meshcanvas01');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (!canvas) {
        console.warn('Failed to get canvas');
        return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.warn('Failed to get canvas context');
        return;
    }
    ctx.strokeStyle = "#DEDEDE";
    ctx.lineWidth = "1";

    const points = [
        [100, 100],
        [100, 200],
        [200, 150],
    ]

    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(point => {
        ctx.lineTo(point[0], point[1])
        ctx.stroke();
    })
    ctx.lineTo(points[0][0], points[0][1]);
    ctx.stroke();

}

window.onload = draw;
