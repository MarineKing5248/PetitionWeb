let signCanvas = $("#signcanvas");
let signInput = $("#sign");
let ctx = signCanvas[0].getContext("2d"); //this give me a DOM element
ctx.strokeStyle = "blue";
ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.lineWidth = 2;
let dataURL = "";
let mouseX = 0,
    mouseY = 0;

signCanvas.on("mousemove", function(e) {
    e.stopPropagation();
    mouseX = e.offsetX;
    mouseY = e.offsetY;
});

signCanvas.on("mousedown", function() {
    ctx.moveTo(mouseX, mouseY);
    signCanvas.on("mousemove", drawSign);
});

signCanvas.on("mouseup", function() {
    signCanvas.off("mousemove", drawSign);
});

function drawSign() {
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();
    dataURL = signCanvas[0].toDataURL();
    signInput.val(dataURL);
    console.log();
}
