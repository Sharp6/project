function checkGetUserMedia() {
  try {
    window.navigator.getUserMedia = ( navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia);
    if (window.navigator.getUserMedia && MediaRecorder) {
      return Promise.resolve();
    } else {
      return Promise.reject('getUserMedia not supported on your browser.');
    }
  } catch(e) {
    return Promise.reject("MediaRecorder not supported.");
  }
  
}

function getAudioStream() {
  // navigator is global
  return navigator.mediaDevices.getUserMedia({ audio: true, video: false })
}

function getStream() {
  return checkGetUserMedia()
    .then(getAudioStream);
}

function getMediaRecorder(stream) {
    var mediaRecorder = new MediaRecorder(stream); //, {mimeType: "audio/ogg;codecs=opus"});
    var chunks = ["hello"];

    mediaRecorder.onstart = function(e) {
      chunks = [];
    }

    mediaRecorder.ondataavailable = function(e) {
      console.log("Data is available!", e.data);
      chunks.push(e.data);
      //console.log(chunks);
    };

    var getBlob = function() {
      return new Promise((resolve, reject) => {
        mediaRecorder.onstop = function(e) {
          console.log("Stop is triggered.");
          var blob = new Blob(chunks, { 'type' : 'audio/webm' });
          resolve(blob);
        };

        /*
        if(mediaRecorder.state !== "inactive") {
          console.log("Mediarecorder is not inactive", mediaRecorder.state);
          // MediaRecorder is not yet ready, so subscribe to when it is.
          mediaRecorder.onstop = function(e) {
            var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
            resolve(blob);
          };
        } else {
          console.log("Mediarecorder is inactive", mediaRecorder.state, chunks);
          // MediaRecorder is ready
          var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
          resolve(blob);
        }
        */
      });
    }

    return {
      start: mediaRecorder.start.bind(mediaRecorder),
      stop: mediaRecorder.stop.bind(mediaRecorder),
      getBlob: getBlob
    }
}

var recorder = function() {
  return getStream()
    .then(getMediaRecorder);
}

/*
var recorder = function(cb) {
  window.navigator.getUserMedia = ( navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia);

   //main block for doing the audio recording
   if (window.navigator.getUserMedia && MediaRecorder) {
     console.log('getUserMedia supported.');
     var chunks = [];

     // returns a promise
     return navigator.mediaDevices.getUserMedia({ audio: true })
      .then(function(stream) {
        var mediaRecorder = new MediaRecorder(stream);
        var api = {};

        api.startRecording = function() {
          mediaRecorder.start();
          console.log(mediaRecorder.state);
          console.log("recorder started");
        }

        api.stopRecording = function() {
          mediaRecorder.stop();
          console.log(mediaRecorder.state);
          console.log("recorder stopped");
        }

        mediaRecorder.onstop = function(e) {
          console.log("data available after MediaRecorder.stop() called.");

          api.blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
          // use this to enable a preview
          // var blobUrl = window.URL.createObjectURL(blob);
          cb(api.blob);
          chunks = [];
          console.log("recorder stopped");
        };

        mediaRecorder.ondataavailable = function(e) {
          chunks.push(e.data);
        }

        return api;
      });
   } else {
      console.log('getUserMedia not supported on your browser!');
      return Promise.reject('getUserMedia not supported on your browser!');
   }
};
  */

//export default Recorder;
