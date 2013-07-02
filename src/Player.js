define([
  'src/entity-component/Entity'
], function(Entity){

  function Player (id) {
    Entity.call(this, id);

    // an abstract object representing the player position:
    this.object = new THREE.Object3D();
  }

  Player.prototype = Object.create(Entity.prototype);

  Player.prototype.update = function (scene, camera, input) {
    Entity.prototype.update.call(this, scene, camera, input);

    // limit player position:
    // X: -63 ..  63
    // Y:  68 ..  68
    // Z:  40 .. 250

    var clamp = THREE.Math.clamp;
    var pos = this.object.position;

    pos.x = clamp(pos.x + ((input.strafeRight - input.strafeLeft) / 3), -63, 63);
    pos.y = 68;
    pos.z = clamp(pos.z + (input.backward - input.forward), 40, 250);

  };

  return Player;

});
