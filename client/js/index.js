function loadBlobInDom(blob) {
  var audio = document.querySelector('.audio');
  var audioURL = window.URL.createObjectURL(blob);
  audio.src = audioURL;

  return Promise.resolve();
}

function loadAudioInDom(url) {
  var audio = document.querySelector('.audio');
  audio.src = url;

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
      api.start();
      record.style.background = "red";
      record.style.color = "black";
    };

    stop.onclick = function() {
      api.stop();
      record.style.background = "";
      record.style.color = "";

      api.getBlob()
        .then(handleNewBlob)
        .then((results) => {
          var url = results[1];
          return userVm.firebaseUserRef().update({ songUrl: url, songUploaded: true });
        })
        .then(() => {
          statusVm.message("Uw opname werd succesvol geüpload!");
        })
        .catch(err => console.log(err));
    };
  })
  .catch(function(err) {
    console.log("GOT AN ERROR", err);
    statusVm.error(true);
    statusVm.message(err);
  });

var UserVm = function() {
  this.card = ko.observable();
  this.name = ko.observable();
  this.firebaseUserRef = ko.observable();
  this.userVisible = ko.computed(() => {
    return !!this.name();
  });
  this.userInvisible = ko.computed(() => {
    return !this.name();
  });
}
var userVm = new UserVm();

var LoginVm = function() {
  this.code = ko.observable();
  this.login = function() {
    // dirty tricks... 
    firebase.database().ref('adressen')
      .orderByChild("code")
      .equalTo(this.code())
      .once("value", snapshot => {
        var fbUser = snapshot.val()[Object.keys(snapshot.val())[0]];
        userVm.card(fbUser.card);
        userVm.name(fbUser.Naam);
        userVm.firebaseUserRef(firebase.database().ref('adressen').child(Object.keys(snapshot.val())[0]));

        if(!!fbUser.songUrl) {
          loadAudioInDom(fbUser.songUrl);
        }
        statusVm.message("Welcome player one!");
      })
      .catch(err => {
        console.log("Firebase error:", err);
        statusVm.message("Er ging iets mis met Firebase login. Reload the page, try again!");
      });
  }.bind(this);
  this.logoutVisible = ko.computed(() => {
    return userVm.userVisible();
  });
  this.loginVisible = ko.computed(() => {
    return !userVm.userVisible();
  })
  this.loginInvisible = ko.computed(() => {
    return !!userVm.userVisible();
  })
} 
var loginVm = new LoginVm();

var recordVm = {
  recordVisible: ko.computed(function() {
    return !!userVm.userVisible();
  })
}

var statusVm = {
  message: ko.observable(),
  error: ko.observable(false),
  statusVisible: ko.observable(true)
};

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