function loadBlobInDom(blob) {
  var audio = document.querySelector('.audio');
  var audioURL = window.URL.createObjectURL(blob);
  audio.src = audioURL;

  return Promise.resolve();
}

var handleNewBlob = function(blob) {
  console.log(blob.size, blob.type);
  return Promise.all([loadBlobInDom(blob), firebaseSave(blob)]);
}

/*
var api = recorder()
  .then((api) => {
    console.log('recorder', api);
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
        .catch(err => console.log(err));
    };
  })
  .catch(function(err) {
    console.log("GOT AN ERROR", err);
  });
*/

var loginVm = {
  code: ko.observable(),
  login: function() {
    console.log(loginVm.code());
    // dirty... 
    firebase.database().ref('adressen')
      .orderByChild("code")
      .equalTo(loginVm.code())
      .once("value", snapshot => {
        console.log(snapshot.val());
      });
  }
};

ko.applyBindings(loginVm, document.getElementById('loginWrapper'));