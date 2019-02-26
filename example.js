// var s = function(sketch) {
//     let init = 0;

//     sketch.preload = function(){
//         createVRCanvas();
//     };


//     sketch.draw = function(){
//         if(init > 4) {
//             sketch.background(200,0,200);
//             //   rotateX(frameCount * 0.01);
//             //   rotateY(frameCount * 0.01);
//             sketch.fill(0,150,100);
//             sketch.translate(0,0,10);
//             //  noStroke();
//             sketch.strokeWeight(0.05);
//             sketch.rotateX(frameCount * 0.02);
//             sketch.rotateY(frameCount * 0.02);
//             sketch.box(5);
//         }
//     };

//     sketch.mousePressed = function(){
//         init++;
//         console.log(init);
//     };
// };

// var myp5Left = new p5(s);
// var myp5Right = new p5(s);

// createVRCanvas(myp5Left, myp5Right);
let init = 0;
let eyes = [null, null];


function setup() {
    // createCanvas(1000, 640);
    eyes[0] = createGraphics(window.innerWidth / 2, window.innerHeight, WEBGL);
    eyes[1] = createGraphics(window.innerWidth / 2, window.innerHeight, WEBGL);
    createVRCanvas(eyes[0], eyes[1]);
}

function draw() {
    fill(0,0,200);
    if(init < 4) return;

    for(let i=0; i<eyes.length; i++) {
        eyes[i].background(200 + i * 200, 0, 200);
        eyes[i].fill(0, 150, 100);
        eyes[i].translate(0, 0, 10);

        eyes[i].box(5);
    }


    // image(eyes[0], 0, 0);
    image(eyes[1], window.innerWidth/2, 0);
}

function mousePressed() {
    init++;
    console.log(init);
};
