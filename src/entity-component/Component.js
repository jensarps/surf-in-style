define([], function () {

  function Component () {
  }

  Component.prototype = {

    entity: null,

    object: null,

    needsUpdate: false,

    needsLoad: true,

    load: function (onComponentLoaded) {
      onComponentLoaded();
    },

    update: function (scene, camera, input) {
    },

    destroy: function () {
    }

  };

  return Component;

});
