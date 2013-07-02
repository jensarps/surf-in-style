define(['./Model'], function (Model) {

  function ObjModel (OBJUrl, MTLUrl) {
    Model.call(this);
    this.OBJUrl = OBJUrl;
    this.MTLUrl = MTLUrl;
  }

  var proto = ObjModel.prototype = Object.create(Model.prototype);

  proto.load = function (callback) {

    var inst = this;
    var loader = new THREE.OBJMTLLoader();

    loader.addEventListener('load', function (event) {
      var object = inst.object = event.content;

      object.children.forEach(function(obj){
        if (obj instanceof THREE.Mesh && typeof obj.geometry !== 'undefined') {
          obj.castShadow = true;
          if (obj.name == 'Object01') {
            obj.receiveShadow = true;
          }
        }
      });

      callback(object);

    });

    loader.load(this.OBJUrl, this.MTLUrl);

  };

  return ObjModel;

});
