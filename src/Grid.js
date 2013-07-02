define(['src/entity-component/Model'], function (Model) {

  function Grid () {
    Model.call(this);
  }

  var proto = Grid.prototype = Object.create(Model.prototype);

  proto.load = function (callback) {

    var size = 14, step = 1;

    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial({ color: 0x303030 });

    for (var i = -size; i <= size; i += step) {

      geometry.vertices.push(new THREE.Vector3(-size, -0.04, i));
      geometry.vertices.push(new THREE.Vector3(size, -0.04, i));

      geometry.vertices.push(new THREE.Vector3(i, -0.04, -size));
      geometry.vertices.push(new THREE.Vector3(i, -0.04, size));

    }

    var line = this.object = new THREE.Line(geometry, material, THREE.LinePieces);

    callback(line);

  };

  return Grid;

});
