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
    //var record = document.querySelector('.record');
    //var stop = document.querySelector('.stop');

    recordVm.record = function() {
      try {
        api.start();
        recordVm.isRecording(true);
      } catch(e) {
        statusVm.message(e);
      }
    };

    recordVm.stop = function() {
      try {
        api.stop();
        recordVm.isRecording(false);
      } catch(e) {
        statusVm.message(e);
      }

      recordVm.loading(true);

      api.getBlob()
        .then(handleNewBlob)
        .then((results) => {
          var url = results[1];
          return userVm.firebaseUserRef().update({ songUrl: url, songUploaded: true, songShouldBeDownloaded: true });
        })
        .then(() => {
          recordVm.loading(false);
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
  this.loading = ko.observable(false);
  this.login = function() {
    if(!!this.code()) {
      console.log("Attempting to log in using code", this.code());
      this.loading(true);
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
          this.loading(false);
          if(!snapshot.val()) {
            return Promise.reject("Invalid login");
          } else {
            statusVm.message("");
          }
          var fbUser = snapshot.val()[Object.keys(snapshot.val())[0]];
          userVm.card(fbUser.card);
          userVm.name(fbUser.name);
          userVm.firebaseUserRef(firebase.database().ref('adressen').child(Object.keys(snapshot.val())[0]));

          if(!!fbUser.songUrl) {
            loadAudioInDom(fbUser.songUrl);
          }
        })
        .catch(err => {
          console.log("Error:", err);
          statusVm.message("Met deze code kan je niet inloggen. Probeer opnieuw!");
        });
    } else {
      statusVm.message("Vul een code in.");
    }
    
  }.bind(this);
} 
var loginVm = new LoginVm();

var RecordVm = function() {
  this.loading = ko.observable(false);
  this.playerVisible = ko.observable(false);
  this.isRecording = ko.observable(false);
  this.record = function() {
    statusVm.message("De opnemer is nog niet geladen");
  }
  this.stop = function() {
    statusVm.message("De opnemer is nog niet geladen");
  }
}.bind(this);
var recordVm = new RecordVm();

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

var ImgVm = function(){
  this.modalImgSrc = ko.observable('');
  this.modalVisible = ko.computed(() => {
    return this.modalImgSrc().length > 0;
  });
};
var imgVm = new ImgVm();

var errorPageVm = {
  fileUploadLoading: ko.observable(false),
  fileUploadDone: ko.observable(false)
}

ko.applyBindings({
  errorPageVm: errorPageVm,
  imgVm: imgVm,
  loginVm: loginVm,
  userVm: userVm,
  recordVm: recordVm,
  statusVm: statusVm,
  pageVm: pageVm
});

// Add file upload. This is done outside KO because KO complicates this, and I currently don't see any downside to this other than it being dirty
var fileButton = document.getElementById('fileButton');
fileButton.addEventListener('change', e => {
  errorPageVm.fileUploadLoading(true);
  firebaseSave(e.target.files[0], userVm.card())
  // COPY PASTED CODE, AAAAAARGH
    .then((url) => {
          return userVm.firebaseUserRef().update({ songUrl: url, songUploaded: true, songShouldBeDownloaded: true });
        })
        .then(() => {
          errorPageVm.fileUploadLoading(false);
          errorPageVm.fileUploadDone(true);
          statusVm.message("Uw opname werd succesvol geüpload!");
        })
        .catch(err => {
          errorPageVm.fileUploadLoading(false);
          statusVm.message(err);
        });
});
