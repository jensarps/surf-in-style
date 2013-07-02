define(['./Component'], function (Component) {

  function DirectionalLight (hexColor, intensity) {
    Component.call(this);
    this.color = hexColor;
    this.intensity = intensity;
  }

  var proto = DirectionalLight.prototype = Object.create(Component.prototype);

  proto.load = function (onComponentLoaded) {
    var light = this.object = new THREE.DirectionalLight(this.color, this.intensity);

    light.castShadow = true;

    light.shadowCameraNear = 0;
    light.shadowCameraFar = 200;
    light.shadowCameraFov = 50;

    //light.shadowCameraVisible = true;

    light.shadowBias = -0.00022; //0.0001;
    light.shadowDarkness = 0.5;

    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;

    onComponentLoaded(light);
  };

  return DirectionalLight;

});
