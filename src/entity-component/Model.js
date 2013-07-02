define(['./Component'], function (Component) {

  function Model () {
  }

  Model.prototype = Object.create(Component.prototype);

  return Model;

});
