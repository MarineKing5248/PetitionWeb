const canvas = document.getElementById("signcanvas");
if (canvas) {
    const context = canvas.getContext("2d");
    // const dataURL = canvas.toDataURL();

    let inCanvas = false;

    // mousedown

    canvas.addEventListener("mousedown", () => {
        context.beginPath();
        inCanvas = true;
        // mousemove
        canvas.addEventListener("mousemove", e => {
            if (inCanvas) {
                context.lineTo(e.offsetX, e.offsetY);
                context.stroke();
            }
        });
    });

    // mouseup
    canvas.addEventListener("mouseup", () => {
        if (!inCanvas) {
            return;
        }
        const dataURL = canvas.toDataURL();
        $('input[name="sign"]').val(dataURL);
        inCanvas = false;
    });
}
