define(['./Component'], function (Component) {

  function AmbientLight (hexColor) {
    Component.call(this);
    this.color = hexColor;
  }

  var proto = AmbientLight.prototype = Object.create(Component.prototype);

  proto.needsLoad = true;

  proto.load = function (onComponentLoaded) {
    var light = this.object = new THREE.AmbientLight(this.color);
    onComponentLoaded(light);
  };

  return AmbientLight;

});
