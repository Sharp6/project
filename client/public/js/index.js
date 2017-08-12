function loadBlobInDom(blob) {
  var audioURL = window.URL.createObjectURL(blob);
  return loadAudioInDom(audioURL);
}

function loadAudioInDom(url) {
  var audio = document.querySelector('.audio');
  audio.src = url;
  recordVm.playerVisible(true);

  return Promise.resolve();
}

var handleNewBlob = function(blob) {
  return Promise.all([loadBlobInDom(blob), firebaseSave(blob, userVm.card())]);
}

function initRecorder() {
  recorder()
  .then((api) => {
    var record = document.querySelector('.record');
    var stop = document.querySelector('.stop');
    var soundClip = document.querySelector('.sound-clip');

    record.onclick = function() {
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
          return userVm.firebaseUserRef().update({ songUrl: url, songUploaded: true, songShouldBeDownloaded: true });
        })
        .then(() => {
          statusVm.message("Uw opname werd succesvol geüpload!");
        })
        .catch(err => {
          statusVm.message(err);
        });
    };
  })
  .catch(function(err) {
    statusVm.error(true);
    //statusVm.message("Uw browser lijkt jammer genoeg niet ondersteund te zijn! Download Chrome of Firefox en probeer het nog eens.");
  });
}

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
}
var userVm = new UserVm();

var LoginVm = function() {
  this.code = ko.observable();
  this.login = function() {
    if(!!this.code()) {
      userVm.name(undefined);
      userVm.card(undefined);
      userVm.firebaseUserRef(undefined);
      userVm.isReady(false);
      // dirty tricks... 
      firebase
        .database()
        .ref('adressen')
        .orderByChild("code")
        .equalTo(this.code())
        .once("value")
        .then(snapshot => {
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
          statusVm.message("Met deze code kan je niet inloggen. Probeer opnieuw!");
        });
    } else {
      statusVm.message("Vul een code in.");
    }
    
  }.bind(this);
} 
var loginVm = new LoginVm();

var recordVm = {
  playerVisible: ko.observable(false)
}

var PageVm = function(){
  this.initial = ko.observable(true);

  this.selectedPage = ko.observable("imgPage");

  /*
  this.radioPage = ko.computed(() => { return this.currentPage() === "radio" });
  this.imgPage = ko.computed(() => { return this.currentPage() === "img" });
  this.giftPage = ko.computed(() => { return this.currentPage() === "gift" });

  this.loginVisible = ko.computed(() => {
    if(!!userVm.name()) {
      this.initial(false);
    }
    return !userVm.name() && userVm.isNotReady() && this.radioPage();
  });
  this.recordVisible = ko.computed(() => {
    return !!userVm.name() && userVm.isNotReady() && !statusVm.error() && this.radioPage();
  });
  this.finalVisible = ko.computed(() => {
    return !!userVm.isReady() && !statusVm.error() && this.radioPage();
  });
  this.errorVisible = ko.computed(() => {
    return statusVm.error() && !!userVm.name();
  });
  */

  this.currentPage = ko.observable("imgPage");
  this.previousPage = ko.observable("");

  this.showPage = function(pageName) {
    if(pageName === "page2") {
      initRecorder();
    }
    this.previousPage(this.currentPage());
    this.currentPage(pageName);
  }.bind(this);

  this.selectedPage.subscribe(newPage => {
    this.showPage(newPage);
  });

  userVm.name.subscribe(newName => {
    if(!!newName) {
      this.showPage("page2");
    }
  });

  userVm.isReady.subscribe(readyState => {
    if(!!readyState) {
      this.showPage("page3");
    }
  });

  statusVm.error.subscribe(errorState => {
    if(!!errorState) {
      this.showPage("errorPage");
    }
  });
}
var pageVm = new PageVm();

ko.applyBindings({
  loginVm: loginVm,
  userVm: userVm,
  recordVm: recordVm,
  statusVm: statusVm
});

// Add file upload. This is done outside KO because KO complicates this, and I currently don't see any downside to this other than it being dirty
var fileButton = document.getElementById('fileButton');
fileButton.addEventListener('change', e => {
  firebaseSave(e.target.files[0], userVm.card())
  // COPY PASTED CODE, AAAAAARGH
    .then((url) => {
          return userVm.firebaseUserRef().update({ songUrl: url, songUploaded: true });
        })
        .then(() => {
          statusVm.message("Uw opname werd succesvol geüpload!");
        })
        .catch(err => {
          statusVm.message(err);
        });
});
