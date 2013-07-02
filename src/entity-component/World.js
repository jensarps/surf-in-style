define([
  '../../lib/decoupled-input/InputController.js',
  '../../lib/decoupled-input/MouseHandler',
  '../../lib/decoupled-input/KeyboardHandler',
  '../bindings'
], function (InputController, MouseHandler, KeyboardHandler, bindings) {

  function World (setupOptions) {

    this.entities = {};

    if ({}.toString.call(setupOptions) == '[object Object]') {
      var entityIds = Object.keys(setupOptions);
      for (var i = 0, m = entityIds.length; i < m; i++) {
        var entityId = entityIds[i];
        var entityInfo = setupOptions[entityId];
        var entity = new entityInfo.entityClass(entityId);
        this.addEntity(entity);

        var components = entityInfo.components;
        var componentIds = Object.keys(components);
        componentIds.forEach(function(componentId){
          entity.addComponent(componentId, components[componentId]);
        }, this);
      }
    }

    var inputController = new InputController(bindings);
    inputController.registerDeviceHandler(MouseHandler, 'mouse');
    inputController.registerDeviceHandler(KeyboardHandler, 'keyboard');

    this.inputController = inputController;
    this.input = inputController.input;


    this.boundUpdate = this.update.bind(this);


    var container = document.createElement('div');
    document.body.appendChild(container);

    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.set(2, 2, 3);

    camera.useQuaternion = true;

    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap; //PCFShadowMap;

    container.appendChild(renderer.domElement);

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    window.addEventListener('resize', function onResize () {
      console.log('resize');
      var SCREEN_HEIGHT = window.innerHeight;
      var SCREEN_WIDTH = window.innerWidth;

      renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
      camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
      camera.updateProjectionMatrix();
    }, false);

  }

  World.prototype = {

    scene: null,

    renderer: null,

    camera: null,

    entities: null,

    addEntity: function (entity) {
      this.entities[entity.id] = entity;
    },

    removeEntity: function (id) {
      var entity = this.entities[id];
      entity.destroy();
      this.entities[id] = null;
      delete this.entities[id];
    },

    getEntityById: function (id) {
      return this.entities[id];
    },

    load: function (onWorldLoaded, onWorldProgress) {
      console.log('World loading');

      onWorldProgress = onWorldProgress || function(progress){
        console.log('Progress:', (progress * 100).toFixed(0) + '%');
      };

      var entities = this.entities;
      var queue = Object.keys(entities);
      var total = queue.length;
      var current = 0;
      var scene = this.scene;

      var next = function () {
        var entityId = queue[current];
        var entity = entities[entityId];

        console.log('Loading entity ' + (current + 1) + '/' + total + ' (' + entityId + ')...');
        entity.load(function (objectsToAddToScene) {
          if (objectsToAddToScene.length) {
            objectsToAddToScene.forEach(function (object) {
              scene.add(object);
            });
          }
          current++;

          if (current >= total) {
            console.log('World loading ended.');
            onWorldLoaded();
          } else {
            next();
          }
        }, function (entityProgress) {

          var percentagePerEntity = 1 / total;
          var reachedPercentage = current * percentagePerEntity;
          var relativeEntityPercentage = entityProgress * percentagePerEntity;
          var totalProgress = relativeEntityPercentage + reachedPercentage;

          onWorldProgress(totalProgress);
        });
      };

      next();
    },

    update: function () {

      requestAnimationFrame(this.boundUpdate);

      //console.log('World update');

      var entityIds = Object.keys(this.entities);
      for (var i = 0, m = entityIds.length; i < m; i++) {
        var entityId = entityIds[i];
        var entity = this.entities[entityId];
        entity.update(this.scene, this.camera, this.input);
      }

      this.renderer.render(this.scene, this.camera);
    },

    run: function () {
      requestAnimationFrame(this.boundUpdate);
    },

    pause: function () {
      cancelAnimationFrame(this.boundUpdate);
    }

  };

  return World;

});
