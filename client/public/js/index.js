function loadBlobInDom(blob) {
  //var audio = document.querySelector('.audio');
  var audioURL = window.URL.createObjectURL(blob);
  //audio.src = audioURL;

  return loadAudioInDom(audioURL);
}

function loadAudioInDom(url) {
  var audio = document.querySelector('.audio');
  audio.src = url;
  recordVm.playerVisible(true);

  return Promise.resolve();
}

var handleNewBlob = function(blob) {
  console.log(blob.size, blob.type);
  return Promise.all([loadBlobInDom(blob), firebaseSave(blob, userVm.card())]);
}

var api = recorder()
  .then((api) => {
    var record = document.querySelector('.record');
    var stop = document.querySelector('.stop');
    var soundClip = document.querySelector('.sound-clip');

    record.onclick = function() {
      console.log('recorder', api);
      try {
        api.start();
      } catch(e) {
        statusVm.message(e);
      }
      
      record.style.background = "#ccc";
      record.style.color = "black";

      stop.style.background = "red";
      stop.style.color = "white";
    };

    stop.onclick = function() {
      try {
        api.stop();
      } catch(e) {
        statusVm.message(e);
      }
      
      record.style.background = "";
      record.style.color = "";
      stop.style.background = "";
      stop.style.color = "";

      api.getBlob()
        .then(handleNewBlob)
        .then((results) => {
          var url = results[1];
          return userVm.firebaseUserRef().update({ songUrl: url, songUploaded: true });
        })
        .then(() => {
          statusVm.message("Uw opname werd succesvol geüpload!");
        })
        .catch(err => {
          statusVm.message(err);
          console.log(err)
        });
    };
  })
  .catch(function(err) {
    console.log("GOT AN ERROR", err);
    statusVm.error(true);
    statusVm.message(err);
  });

var StatusVm = function(){
  this.message = ko.observable();
  this.error = ko.observable(false);
  this.statusVisible = ko.computed(() => {
    return !!this.message();
  });
};
var statusVm = new StatusVm();

var UserVm = function() {
  this.isReady = ko.observable(false);
  this.isNotReady = ko.computed(() => {
    return !this.isReady();
  });
  this.card = ko.observable();
  this.name = ko.observable();
  this.firebaseUserRef = ko.observable();
  this.userVisible = ko.computed(() => {
    return !!this.name() && this.isNotReady();
  });
  this.userInvisible = ko.computed(() => {
    return !this.name() || this.isReady();
  });
}
var userVm = new UserVm();

var LoginVm = function() {
  this.code = ko.observable();
  this.login = function() {
    if(!!this.code()) {
      // dirty tricks... 
      firebase
        .database()
        .ref('adressen')
        .orderByChild("code")
        .equalTo(this.code())
        .once("value")
        .then(snapshot => {
          console.log(snapshot.val());
          if(!snapshot.val()) {
            return Promise.reject("Invalid login");
          } else {
            statusVm.message("");
          }
          var fbUser = snapshot.val()[Object.keys(snapshot.val())[0]];
          userVm.card(fbUser.card);
          userVm.name(fbUser.Naam);
          userVm.firebaseUserRef(firebase.database().ref('adressen').child(Object.keys(snapshot.val())[0]));

          if(!!fbUser.songUrl) {
            loadAudioInDom(fbUser.songUrl);
          }
        })
        .catch(err => {
          console.log("Firebase error:", err);
          statusVm.message("Met deze code kan je niet inloggen. Probeer opnieuw!");
        });
    } else {
      statusVm.message("Vul een code in.");
    }
    
  }.bind(this);
  this.logoutVisible = ko.computed(() => {
    return userVm.userVisible();
  });
  this.loginVisible = ko.computed(() => {
    return !userVm.userVisible() && userVm.isNotReady() && !statusVm.error();
  })
  this.loginInvisible = ko.computed(() => {
    return !!userVm.userVisible() || userVm.isReady() || statusVm.error();
  })
} 
var loginVm = new LoginVm();

var recordVm = {
  recordVisible: ko.computed(function() {
    return !!userVm.userVisible();
  }),
  playerVisible: ko.observable(false)
}



/*
ko.applyBindings(loginVm, document.getElementById('loginWrapper'));
ko.applyBindings(userVm, document.getElementById('userWrapper'));
ko.applyBindings(recordVm, document.getElementById('recordWrapper'));
ko.applyBindings(statusVm, document.getElementById('statusWrapper'));
*/

ko.applyBindings({
  loginVm: loginVm,
  userVm: userVm,
  recordVm: recordVm,
  statusVm: statusVm
});