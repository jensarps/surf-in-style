define([], function () {

  function Entity (id) {
    this.id = id;
    this.components = {};
  }

  Entity.prototype = {

    id: '',

    components: null,

    load: function (onEntityLoaded, onEntityProgress) {

      var entityId = this.id;
      console.log(' Entity "' + entityId + '" start loading');

      var objectsToAddToScene = [];
      var components = this.components;
      var queue = Object.keys(components);
      var total = queue.length;
      var current = 0;

      this._loaded = 0;

      for(;current < total; current++){

        var componentId = queue[current];
        var component = components[componentId];
        var handler = this._makeLoadHandler(objectsToAddToScene, component, total, onEntityLoaded, onEntityProgress);

        console.log(' Entity "' + entityId + '" loading component ' + (current + 1) + '/' + total + ' (' + componentId + ')...');

        if (component.needsLoad) {
          component.load(handler);
        } else {
          this._loaded++;

          onEntityProgress(this._loaded / total);

          if (this._loaded >= total) {
            onEntityLoaded(objectsToAddToScene);
          }

        }
      }

    },

    _makeLoadHandler: function (objectsToAddToScene, component, total, onEntityLoaded, onEntityProgress) {

      return function(objectToAddToScene){
        if (objectToAddToScene) {
          objectsToAddToScene.push(objectToAddToScene);
        }
        component.needsLoad = false;

        this._loaded++;

        onEntityProgress(this._loaded / total);

        if (this._loaded >= total) {
          onEntityLoaded(objectsToAddToScene);
        }
      }.bind(this);

    },

    addComponent: function (componentId, component) {
      this.components[componentId] = component;
      component.entity = this;
    },

    getComponentById: function (componentId) {
      return this.components[componentId];
    },

    removeComponent: function (componentId) {
      this.components[componentId].destroy();
      this.components[componentId] = null;
      delete this.components[componentId];
    },

    update: function (scene, camera, input) {
      var componentIds = Object.keys(this.components);
      for (var i = 0, m = componentIds.length; i < m; i++) {
        var componentId = componentIds[i];
        var component = this.components[componentId];
        component.needsUpdate && component.update(scene, camera, input);
      }
    },

    destroy: function () {
      Object.keys(this.components).forEach(this.removeComponent.bind(this));
    }

  };

  return Entity;

});
