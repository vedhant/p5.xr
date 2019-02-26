let xrDevice = null;
let xrSession = null;
let xrFrameOfRef = null;
//     // WebGL scene globals.
let gls = [null, null];
let sketches = [null, null];
let canvii = [null, null];
let viewMat = [null, null];
let projMat = [null, null];


createVRCanvas = function (sketchLeft, sketchRight) {
    var polyfill = new WebXRPolyfill();
    var versionShim = new WebXRVersionShim();
    console.log(sketchLeft);
    // this.createCanvas(100, 100, WEBGL);
    // gl = this.renderer.GL;
    // console.log('MADE VR CANVAS');
    sketches[0] = sketchLeft;
    sketches[1] = sketchRight;
    initVR();
}

// Called when we've successfully acquired a XRSession. In response we
// will set up the necessary session state and kick off the frame loop.
function onVRSessionStarted(session) {

    xrSession = session;
    // Listen for the sessions 'end' event so we can respond if the user
    // or UA ends the session for any reason.
    session.addEventListener('end', onSessionEnded);
    // Create a WebGL context to render with, initialized to be compatible
    // with the XRDisplay we're presenting to.
    console.log('MADE VR CANVAS');

    canvii[0] = sketches[0].canvas;
    canvii[1] = sketches[1].canvas;

    gls[0] = canvii[0].getContext('webgl', {
        compatibleXRDevice: session.device
    });
    gls[1] = canvii[1].getContext('webgl', {
        compatibleXRDevice: session.device
    });
    // Use the new WebGL context to create a XRWebGLLayer and set it as the
    // sessions baseLayer. This allows any content rendered to the layer to
    // be displayed on the XRDevice.
    session.baseLayer = new XRWebGLLayer(session, gls[0]);
    session.baseLayer = new XRWebGLLayer(session, gls[1]);
    // Get a frame of reference, which is required for querying poses. In
    // this case an 'eye-level' frame of reference means that all poses will
    // be relative to the location where the XRDevice was first detected.
    session.requestFrameOfReference('eye-level').then((frameOfRef) => {
        xrFrameOfRef = frameOfRef;
        // Inform the session that we're ready to begin drawing.
        session.requestAnimationFrame(onXRFrame);
    });
}

function initVR() {
    // Is WebXR available on this UA?
    if (navigator.xr) {
        // Request an XRDevice connected to the system.
        let xrButton = document.getElementById('xr-button');
        navigator.xr.requestDevice().then((device) => {
            xrDevice = device;
            device.supportsSession({ immersive: true }).then(() => {
                xrButton.addEventListener('click', onVRButtonClicked);
                xrButton.innerHTML = 'Enter XR';
                xrButton.disabled = false;
                console.log('supported');
            });
        });
    }
}

function onVRButtonClicked() {
    console.log('clicked');
    if (!xrSession) {
        xrDevice.requestSession({ immersive: true }).then(onVRSessionStarted);
    } else {
        xrSession.end();
    }
}

function onXRFrame(t, frame) {
    let session = frame.session;
    // Inform the session that we're ready for the next frame.
    session.requestAnimationFrame(onXRFrame);
    // Get the XRDevice pose relative to the Frame of Reference we created
    // earlier.
    let pose = frame.getDevicePose(xrFrameOfRef);
    // Getting the pose may fail if, for example, tracking is lost. So we
    // have to check to make sure that we got a valid pose before attempting
    // to render with it. If not in this case we'll just leave the
    // framebuffer cleared, so tracking loss means the scene will simply
    // dissapear.
    if (pose) {
        // If we do have a valid pose, bind the WebGL layer's framebuffer,
        // which is where any content to be displayed on the XRDevice must be
        // rendered.
        gls[0].bindFramebuffer(gls[0].FRAMEBUFFER, session.baseLayer.framebuffer);
        gls[1].bindFramebuffer(gls[1].FRAMEBUFFER, session.baseLayer.framebuffer);
        // Update the clear color so that we can observe the color in the
        // headset changing over time.
        let time = Date.now();
        // Normally you'd loop through each of the views reported by the frame
        // and draw them into the corresponding viewport here, but we're
        // keeping this sample slim so we're not bothering to draw any
        // geometry.
        for(let i=0; i<frame.views.length; i++)
        {
            let viewport = session.baseLayer.getViewport(frame.views[i]);
            viewMat[i] = new p5.Matrix();
            viewMat[i] = pose.getViewMatrix(frame.views[i]);
            projMat[i] = new p5.Matrix();
            projMat[i] = frame.views[i].projectionMatrix
            sketches[i]._renderer.uMVMatrix.set(viewMat[i]);
    
            sketches[i]._renderer.uPMatrix.set(projMat[i]);
            gls[i].viewport(viewport.x, viewport.y,
                viewport.width, viewport.height);

        }
        // for (let view of frame.views) {
        //     let viewport = session.baseLayer.getViewport(view);
        //     viewMat = new p5.Matrix();
        //     viewMat = pose.getViewMatrix(view);

        //     projMat = new p5.Matrix();
        //     projMat = view.projectionMatrix
        //     // gl.viewport(viewport.x, viewport.y,
        //     //     viewport.width, viewport.height);
        //     // p5.instance._renderer.uMVMatrix.set(pose.getViewMatrix(view));
        //     // p5.instance._renderer.uPMatrix.set(view.projectionMatrix);
        //     // Draw something.
        //     //   drawScene(view.projectionMatrix, pose.getViewMatrix(view));
        // }

    }
}

function onEndSession(session) {
    session.end();
}
// Called either when the user has explicitly ended the session (like in
// onEndSession()) or when the UA has ended the session for any reason.
// At this point the session object is no longer usable and should be
// discarded.
function onSessionEnded(event) {
    xrSession = null;
    xrButton.innerHTML = 'Enter VR';
    // In this simple case discard the WebGL context too, since we're not
    // rendering anything else to the screen with it.
    gls = null;
}

p5.RendererGL.prototype._update = function() {
    // reset model view and apply initial camera transform
    // (containing only look at info; no projection).
    // this.uMVMatrix.set(
    //   this._curCamera.cameraMatrix.mat4[0],
    //   this._curCamera.cameraMatrix.mat4[1],
    //   this._curCamera.cameraMatrix.mat4[2],
    //   this._curCamera.cameraMatrix.mat4[3],
    //   this._curCamera.cameraMatrix.mat4[4],
    //   this._curCamera.cameraMatrix.mat4[5],
    //   this._curCamera.cameraMatrix.mat4[6],
    //   this._curCamera.cameraMatrix.mat4[7],
    //   this._curCamera.cameraMatrix.mat4[8],
    //   this._curCamera.cameraMatrix.mat4[9],
    //   this._curCamera.cameraMatrix.mat4[10],
    //   this._curCamera.cameraMatrix.mat4[11],
    //   this._curCamera.cameraMatrix.mat4[12],
    //   this._curCamera.cameraMatrix.mat4[13],
    //   this._curCamera.cameraMatrix.mat4[14],
    //   this._curCamera.cameraMatrix.mat4[15]
    // );
    // p5.instance._renderer.uMVMatrix.set(viewMat);
    // p5.instance._renderer.uPMatrix.set(projMat);
    // reset light data for new frame.
  
    this.ambientLightColors.length = 0;
    this.directionalLightDirections.length = 0;
    this.directionalLightColors.length = 0;
  
    this.pointLightPositions.length = 0;
    this.pointLightColors.length = 0;
  };

// p5.RendererGL.prototype.drawBuffers = function (gId) {
//      var gl = this.GL;
//     this._useColorShader();
//     var geometry = this.gHash[gId];

//     if (this._doStroke && geometry.lineVertexCount > 0) {
//         this.curStrokeShader.bindShader();

//         // bind the stroke shader's 'aPosition' buffer
//         if (geometry.lineVertexBuffer) {
//             this._bindBuffer(geometry.lineVertexBuffer, gl.ARRAY_BUFFER);
//             this.curStrokeShader.enableAttrib(
//                 this.curStrokeShader.attributes.aPosition.location,
//                 3,
//                 gls.FLOAT,
//                 false,
//                 0,
//                 0
//             );
//         }

//         // bind the stroke shader's 'aDirection' buffer
//         if (geometry.lineNormalBuffer) {
//             this._bindBuffer(geometry.lineNormalBuffer, gl.ARRAY_BUFFER);
//             this.curStrokeShader.enableAttrib(
//                 this.curStrokeShader.attributes.aDirection.location,
//                 4,
//                 gls.FLOAT,
//                 false,
//                 0,
//                 0
//             );
//         }

//         this._applyColorBlend(this.curStrokeColor);
//         this._drawArrays(gl.TRIANGLES, gId);
//         this.curStrokeShader.unbindShader();
//     }

//     if (this._doFill !== false) {
//         this.curFillShader.bindShader();

//         // bind the fill shader's 'aPosition' buffer
//         if (geometry.vertexBuffer) {
//             //vertex position buffer
//             this._bindBuffer(geometry.vertexBuffer, gl.ARRAY_BUFFER);
//             this.curFillShader.enableAttrib(
//                 this.curFillShader.attributes.aPosition.location,
//                 3,
//                 gls.FLOAT,
//                 false,
//                 0,
//                 0
//             );
//         }

//         if (geometry.indexBuffer) {
//             //vertex index buffer
//             this._bindBuffer(geometry.indexBuffer, gl.ELEMENT_ARRAY_BUFFER);
//         }

//         // bind the fill shader's 'aNormal' buffer
//         if (geometry.normalBuffer) {
//             this._bindBuffer(geometry.normalBuffer, gl.ARRAY_BUFFER);
//             this.curFillShader.enableAttrib(
//                 this.curFillShader.attributes.aNormal.location,
//                 3,
//                 gl.FLOAT,
//                 false,
//                 0,
//                 0
//             );
//         }

//         // bind the fill shader's 'aTexCoord' buffer
//         if (geometry.uvBuffer) {
//             // uv buffer
//             this._bindBuffer(geometry.uvBuffer, gl.ARRAY_BUFFER);
//             this.curFillShader.enableAttrib(
//                 this.curFillShader.attributes.aTexCoord.location,
//                 2,
//                 gl.FLOAT,
//                 false,
//                 0,
//                 0
//             );
//         }

//         this._applyColorBlend(this.curFillColor);
//         this._drawElements(gl.TRIANGLES, gId);
//         this.curFillShader.unbindShader();
//     }
//     return this;
// };