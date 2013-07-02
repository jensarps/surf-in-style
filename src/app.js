require([
  'src/entity-component/Component',
  'src/entity-component/Entity',
  'src/entity-component/World',
  'src/entity-component/ObjModel',
  'src/entity-component/AmbientLight',
  'src/entity-component/DirectionalLight',
  'src/Website',
  'src/Player'
], function (
  Component, Entity, World,
  ObjModel, AmbientLight, DirectionalLight,
  Website, Player) {

  // need refs to those later, so assign them
  var desk = new ObjModel('model/desk/pc_obj.obj', 'model/desk/pc_obj.mtl');
  var directionalLight = new DirectionalLight(0xffffff, 0.7);

  window.world = new World({
    player: {
      entityClass: Player,
      components: {}
    },
    environment: {
      entityClass: Entity,
      components: {
        'desk': desk,
        'ambientLight': new AmbientLight(0x202020),
        'website': new Website(),
        'directionalLight': directionalLight
      }
    }
  });

  /* audio */

  var audio = new Component();
  var audioContext, musicBuffer, musicSource, musicTime;
  audio.load = function(cb){
    audioContext = new webkitAudioContext();

    var request = new XMLHttpRequest();
    request.open('GET', 'audio/flex_blur-understep.mp3', true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
      audioContext.decodeAudioData(request.response, function (buffer) {

        musicBuffer = buffer;

        musicSource = audioContext.createBufferSource();
        musicSource.buffer = buffer;
        musicSource.loop = true;
        musicSource.connect(audioContext.destination);

        cb();
      }, function () {
        console.log('ERR:', arguments);
        cb();
      });
    };
    request.send();
  };

  if(typeof webkitAudioContext != 'undefined') {
    world.getEntityById('environment').addComponent('audio', audio);
  }

  /* camera path */

  var cameraPathInAction = true;
  var cameraPath = new Component();
  cameraPath.needsUpdate = true;
  cameraPath.load = function(cb){
    var points = [
      new THREE.Vector3(200,500,1000),
      new THREE.Vector3(100,80,800),
      new THREE.Vector3(-20,68,200),
      new THREE.Vector3(0,68,60)
    ];
    this.path = new THREE.SplineCurve3(points);
    cb();
  };
  cameraPath.update = function(scene, camera, input){
    if(!this.currentPos){
      this.currentPos = 0;
    }
    var spline = this.path;
    var u = this.currentPos++ / (60 * 15);

    if(u > 1){
      this.needsUpdate = false;
      cameraPathInAction = false;
      return;
    }

    camera.position = spline.getPointAt(u);
    camera.rotation = spline.getTangentAt(u);
  };
  world.getEntityById('environment').addComponent('cameraPath', cameraPath);

  /* camera */

  var eyes = new Component();
  eyes.needsUpdate = true;
  eyes.update = function (scene, camera, input) {

    if (cameraPathInAction) {
      //return;
    }

    // apply rotation:
    camera.quaternion.y = input.turn / 4;
    camera.quaternion.x = input.look / 4;
    camera.quaternion.normalize();
    camera.matrix.makeRotationFromQuaternion(camera.quaternion);

    if (cameraPathInAction) {
      return;
    }

    // copy the player position:
    camera.position.copy(this.entity.object.position);

  };
  world.getEntityById('player').addComponent('eyes', eyes);


  /* lights */

  var spotLight = new Component();
  spotLight.load = function (cb) {
    var light = this.object =new THREE.SpotLight(0x52DF9D, 0.9);
    cb(light);
  };
  world.getEntityById('environment').addComponent('spotLight', spotLight);

  /* debug output */

  var positionDisplay = new Component();
  positionDisplay.needsUpdate = true;
  positionDisplay.update = function (scene, camera, input) {

    if (!this.domNode) {
      this.domNode = document.createElement('div');
      this.domNode.style.position = 'absolute';
      this.domNode.style.top = '0';
      this.domNode.style.padding = '5px';
      this.domNode.style.color = 'red';
      document.body.appendChild(this.domNode);
    }
    this.domNode.innerHTML = ['x', 'y', 'z'].map(function(axis){
      return axis + ': ' + camera.position[axis].toFixed(2);
    }).join(' | ');
  };
  //world.getEntityById('environment').addComponent('positionDisplay', positionDisplay);

  /* loading overlay */

  var hasProgress = document.createElement('progress').max != undefined;
  var progressNode;
  if(hasProgress){
    progressNode = document.getElementById('progressMeter');
    progressNode.style.display = 'inline-block';
  } else {
    progressNode = document.getElementById('progressInner');
    document.getElementById('progress').style.display = 'block';
  }

  /* start button click handler */
  function onStartButtonClick () {

  }


  // Start loading
  var started = false;
  world.load(function () {

    // set initial player position
    var player = world.getEntityById('player');
    player.object.position.y = 68.0;
    player.object.position.z = 60;

    // set cast/receive shadow for desk children
    desk.object.children.forEach(function(obj){
      if (obj instanceof THREE.Mesh && typeof obj.geometry !== 'undefined') {
        obj.castShadow = true;
        if (obj.name == 'Object01') {
          obj.receiveShadow = true;
        }
      }
    });

    // position lights
    spotLight.object.target = desk.object;
    spotLight.object.position.set(-30,110,80);

    directionalLight.object.target = desk.object;
    directionalLight.object.position.set(-30,110,80);


    // handle tab change
    document.addEventListener("webkitvisibilitychange", function () {
      if (!started) {
        return;
      }
      if (document.webkitHidden) {
        musicTime = audioContext.currentTime;
        musicSource.noteOff(0);
      } else {
        musicSource = audioContext.createBufferSource();
        musicSource.buffer = musicBuffer;
        musicSource.loop = true;
        musicSource.connect(audioContext.destination);
        musicSource.noteGrainOn(0, musicTime, musicBuffer.duration - musicTime);
      }
    }, false);

    // hide loading overlay
    document.getElementById('progressWrapper').style.display = 'none';

    // show start button
    var button = document.getElementById('go');
    button.style.display = 'inline-block';
    button.addEventListener('click', function(){
      started = true;
      musicSource.noteOn(0);
      world.run();
      document.body.removeChild(document.getElementById('overlay'));
    }, false);

  }, function (progress) {
    // update overlay
    if(hasProgress){
      progressNode.value = progress;
    } else {
      progressNode.style.width = (progress * 100).toFixed(0) + '%';
    }
  });

});

