var width, height;

function loadCanvas() {
    console.log('loaded');
    height = window.innerHeight;
    width = window.innerWidth;
    var c = document.getElementById('drawCircuit');
    var ctx = c.getContext('2d');

    // Center
    //$("#drawCircuit").css({"width": width, "height": height, "border": "1px solid #fd0000"});
    ctx.translate(600, 400);

    // Add some lines
    ctx.beginPath();
    ctx.moveTo(480,288);
    ctx.lineTo(-96,288);
    ctx.strokestyle = '#ff0000';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-200,0);
    ctx.lineTo(200,0);
    ctx.stroke();
    ctx.moveTo(0,-200);
    ctx.lineTo(0, 200);
    ctx.stroke();     

    ctx.font = "12px Arial";
    ctx.fillText("+ x",180, -10);
    ctx.fillText("- y",10, 180);

    ctx.fillText("- x",-200, -10);
    ctx.fillText("+ y",10, -180);  

    // From the above I notice that -x coordinates behaves
    // as expected, but the y coordinates jumps on the '
    // wrong side of the line. 

    ctx.fillRect(-100, -100, 4, 4); 
    ctx.fillText("(-100,-100). Incorrect" ,-100, -100); 

    // From 'translate' this is correct, but only the x coordinate
    // looks like it should:
    // x = 200 - 100 = 100
    // y = 200 - 100 = 100

    // In order to draw correct cartesian coordinates we could make
    // a simple function like this 

    function drawCartesianPoint(ctx, x, y) {
        ctx.fillRect(x, -(y), 4, 4); 
    }

    // And for text:
    function drawCartesianText(ctx, x, y, text) {
        ctx.fillText(text , x, -(y));  
    }

    // Draw corrext:
    drawCartesianPoint(ctx, -100, -100);
    drawCartesianText(ctx, -100, -100, '(-100, -100) correct');

};  