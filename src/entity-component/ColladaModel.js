define(['./Model'], function (Mesh) {

  function ColladaModel (url, options) {
    Mesh.call(this);
    this.url = url;
  }

  var proto = ColladaModel.prototype = Object.create(Mesh.prototype);

  proto.needsLoad = true;

  proto.model = null;

  proto.load = function (callback) {

    console.log('  ColladaModel loading');

    var inst = this;
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;

    loader.load(this.url, function (collada) {

      console.log('  ColladaModel loading done.');

      var dae = inst.model = collada.scene;
      console.log(dae);

      dae.scale.x = dae.scale.y = dae.scale.z = 20;
      //dae.updateMatrix();

      callback(dae);

    });

  };

  return ColladaModel;

});
