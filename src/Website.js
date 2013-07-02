define(['src/entity-component/Component'], function (Component) {

  function Website () {
    Component.call(this);

    var renderer = this.renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = 0;

    document.body.appendChild(renderer.domElement);

    this.scene = new THREE.Scene();

    window.addEventListener('resize', function onResize () {
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);
  }

  var proto = Website.prototype = Object.create(Component.prototype);

  proto.needsUpdate = true;

  proto.load = function (onComponentLoaded) {

    var iframe = this.object = document.createElement('iframe');
    var loadFired = false;

    // onload will fire twice, for making the element available in the DOM
    // and for loading the src.
    iframe.onload = function () {

      iframe.style.opacity = 1;

      // event handlers will only attach during the second run, so no need
      // to check.

      /* pass through mouse movement to input controller */

      var mouseDiffX = 0;
      var mouseDiffY = 0;

      window.addEventListener('mousemove', function (evt) {
        mouseDiffX = evt.screenX - evt.pageX;
        mouseDiffY = evt.screenY - evt.pageY;
      }, false);

      iframe.contentWindow.addEventListener('mousemove', function (evt) {
        world.inputController.deviceHandlers.mouse.onMouseMove({
          pageX: evt.screenX - mouseDiffX,
          pageY: evt.screenY - mouseDiffY
        });
      }, false);

      /* pass through keyboard events to input controller */

      iframe.contentWindow.addEventListener('keyup', function (evt) {
        world.inputController.deviceHandlers.keyboard.onKeyUp(evt);
      }, false);

      iframe.contentWindow.addEventListener('keydown', function (evt) {
        world.inputController.deviceHandlers.keyboard.onKeyDown(evt);
      }, false);

      // can safely fire callback on first run.

      if (loadFired) {
        return;
      }
      loadFired = true;
      onComponentLoaded();
    };

    iframe.src = '/';
    iframe.style.background = 'white';
    var ratio = 10 / 16.2;
    var width = window.innerWidth;
    var height = width * ratio;
    iframe.style.width = width + 'px';
    iframe.style.height = height + 'px';
    iframe.style.opacity = 0;
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    var CSSObject = new THREE.CSS3DObject(iframe);
    this.scene.add(CSSObject);

    /* position and scale the object */

    CSSObject.position.x = 0;
    CSSObject.position.y = 68.3;
    CSSObject.position.z = 2.5;

    var scale = 1 / ( window.innerWidth / 61.7 );

    CSSObject.scale.x = scale;
    CSSObject.scale.y = scale;
    CSSObject.scale.z = scale;

  };

  proto.update = function (scene, camera, input) {
    this.renderer.render(this.scene, camera);
  };

  return Website;

});
