import { Curtains } from 'curtainsjs';

export default class MouseEffect {
  constructor(params) {
    this.curtains = new Curtains({ container: params.webGLCanvasID });
    this.plane = null;

    // get our plane element
    this.planeElement = document.getElementById(params.planeElementID);

    this.pixelRatio = this.curtains.pixelRatio || 1;

    // mouse positions history
    this.mouse = {
      position: {
        x: 0,
        y: 0,
      },
      attributes: [],
    };

    // params
    this.params = {
      pointerSize: params.pointerSize || 0.25,
      opacitySpeed: params.opacitySpeed || 0.0125,
      velocityStrength: params.velocityStrength || 0.25,
      displacementStrength: params.displacementStrength || 0.25,
      canvasScale: params.canvasScale || 0.125,
    };

    this.canvas = null;
    this.canvasContext = null;

    if (!document.getElementById(params.webGLCanvasID) || !document.getElementById(params.planeElementID)) {
      console.warn("You must specify a valid ID for the WebGL canvas and the plane element");
      return false;
    }
  }

  resize() {
    if (this.canvas && this.canvasContext) {
      this.canvas.width = this.planeElement.clientWidth * this.pixelRatio * this.params.canvasScale;
      this.canvas.height = this.planeElement.clientHeight * this.pixelRatio * this.params.canvasScale;

      this.canvasContext.width = this.planeElement.clientWidth * this.pixelRatio * this.params.canvasScale;
      this.canvasContext.height = this.planeElement.clientHeight * this.pixelRatio * this.params.canvasScale;

      this.canvasContext.scale(this.pixelRatio * 1 / this.params.canvasScale, this.pixelRatio * 1 / this.params.canvasScale);
      //this.mouse.canvasContext.imageSmoothingEnabled = true;
    }
  }

  handleMovement(e) {
    this.mouse.position.x = e.clientX;
    this.mouse.position.y = e.clientY;

    // touch event
    if (e.targetTouches) {

      this.mouse.position.x = e.targetTouches[0].clientX;
      this.mouse.position.y = e.targetTouches[0].clientY;
    }

    // always check that the plane is still here
    if (this.planeElement && this.plane) {
      var mouseAttributes = {
        x: this.mouse.position.x * Math.pow(this.params.canvasScale, 2),
        y: this.mouse.position.y * Math.pow(this.params.canvasScale, 2),

        scale: 0.05,
        opacity: 1,
        velocity: {
          x: 0,
          y: 0,
        },
      }

      // keep tracks of the initial position of the mouse to calculate velocity
      mouseAttributes.initialPosition = {
        x: mouseAttributes.x,
        y: mouseAttributes.y
      }

      // handle velocity based on past values
      if (this.mouse.attributes.length > 0) {
        mouseAttributes.velocity = {
          x: Math.max(-this.params.canvasScale * 1.25, Math.min(this.params.canvasScale * 1.25, mouseAttributes.initialPosition.x - this.mouse.attributes[this.mouse.attributes.length - 1].initialPosition.x)),
          y: Math.max(-this.params.canvasScale * 1.25, Math.min(this.params.canvasScale * 1.25, mouseAttributes.initialPosition.y - this.mouse.attributes[this.mouse.attributes.length - 1].initialPosition.y)),
        };
      }

      // if this is our first mouse move, start drawing again
      if (this.mouse.attributes.length == 0) {
        this.curtains.enableDrawing();
      }

      // push our coords to our mouse coords array
      this.mouse.attributes.push(mouseAttributes);

      // convert our mouse/touch position to coordinates relative to the vertices of the plane
      var mouseCoords = this.plane.mouseToPlaneCoords(this.mouse.position.x, this.mouse.position.y);
      // update our mouse position uniform
      this.plane.uniforms.mousePosition.value = [mouseCoords.x, mouseCoords.y];
    }
  }

  drawGradientCircle(pointerSize, circleAttributes) {
    this.canvasContext.beginPath();

    var gradient = this.canvasContext.createRadialGradient(
      circleAttributes.x, circleAttributes.y, 0,
      circleAttributes.x, circleAttributes.y, pointerSize * circleAttributes.scale * this.params.canvasScale
    );

    // our gradient could go from opaque white to transparent white or from opaque white to transparent black
    // it changes the effect a bit
    gradient.addColorStop(0, 'rgba(255, 255, 255, ' + circleAttributes.opacity + ')');

    // use another gradient stop if we want to add more transparency
    //gradient.addColorStop(0.85, 'rgba(255, 255, 255, 0.05)');

    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    this.canvasContext.fillStyle = gradient;

    this.canvasContext.arc(
      circleAttributes.x, circleAttributes.y, pointerSize * circleAttributes.scale * this.params.canvasScale,
      0, 2 * Math.PI, false
    );
    this.canvasContext.fill();
    this.canvasContext.closePath();
  }

  animateCanvas() {
    // here we will handle our canvas texture animation
    var pointerSize = window.innerWidth > window.innerHeight ?
    Math.floor(this.canvas.height * this.params.pointerSize) :
    Math.floor(this.canvas.width * this.params.pointerSize);

    // clear scene
    this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // draw a background black rectangle
    this.canvasContext.beginPath();
    this.canvasContext.fillStyle = "black";

    this.canvasContext.rect(0, 0, this.canvas.width, this.canvas.height);
    this.canvasContext.fill();
    this.canvasContext.closePath();

    // draw all our mouse coords
    for (var i = 0; i < this.mouse.attributes.length; i++) {
      this.drawGradientCircle(pointerSize, this.mouse.attributes[i]);
    }
  }

  handlePlane() {
    var self = this;

    self.plane.onReady(function () {

      // on resize, update the resolution uniform
      window.addEventListener("resize", self.resize.bind(self), false);

      document.body.addEventListener("mousemove", self.handleMovement.bind(self), false);
      document.body.addEventListener("touchmove", self.handleMovement.bind(self), {
        passive: true
      });

      // for performance purpose, disable the drawing for now
      self.curtains.disableDrawing();
      // render the first frame only to display the picture
      self.curtains.needRender();

    }).onRender(function () {

      for (var i = 0; i < self.mouse.attributes.length; i++) {
        // decrease opacity
        self.mouse.attributes[i].opacity -= self.params.opacitySpeed;

        // apply velocity
        self.mouse.attributes[i].x += self.mouse.attributes[i].velocity.x * self.params.velocityStrength;
        self.mouse.attributes[i].y += self.mouse.attributes[i].velocity.y * self.params.velocityStrength;

        // change scale
        if (self.mouse.attributes[i].opacity >= 0.5) {
          self.mouse.attributes[i].scale += (self.params.opacitySpeed * 2);
        } else {
          self.mouse.attributes[i].scale -= self.params.opacitySpeed;
        }

        if (self.mouse.attributes[i].opacity <= 0) {
          // if element is fully transparent, remove it
          self.mouse.attributes.splice(i, 1);

          // if this was our last mouse move, disable drawing again
          if (self.mouse.attributes.length == 0) {
            self.curtains.disableDrawing();
          }
        }
      }

      // draw our mouse coords arrays
      self.animateCanvas();
    });
  }

  removePlane() {
    var self = this;

    // remove all events
    window.removeEventListener("resize", self.resize);
    document.body.removeEventListener("mousemove", self.handleMovement);
    document.body.removeEventListener("touchmove", self.handleMovement);

    // remove the plane
    self.curtains.removePlane(self.plane);

    self.plane = null;

    self.canvas = null;
    self.canvasContext = null;
  }

  addPlane() {
    // parameters to apply to our WebGL plane
    this.planeParams = {
      vertexShaderID: "mouse-displacement-vs",
      fragmentShaderID: "mouse-displacement-fs",
      imageCover: true,
      uniforms: {
        mousePosition: {
          name: "uMousePosition",
          type: "2f",
          value: [this.mouse.position.x, this.mouse.position.y],
        },
        mouseEffect: {
          name: "uDisplacementStrength",
          type: "1f",
          value: this.params.displacementStrength,
        },
      },
    };

    // create our plane
    this.plane = this.curtains.addPlane(this.planeElement, this.planeParams);

    // if the plane was created successfully we can go on
    if (this.plane) {
      this.canvas = document.createElement("canvas");
      this.canvas.setAttribute("data-sampler", "canvasTexture");
      this.canvasContext = this.canvas.getContext("2d", { alpha: false });

      // load our canvas texture
      this.plane.loadCanvases([this.canvas]);

      // first we resize our mouse canvas
      this.resize();

      // then we handle the plane
      this.handlePlane();
    }
  }
}


