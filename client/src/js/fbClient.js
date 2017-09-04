// Initialize Firebase
var config = {
  apiKey: "AIzaSyDTJwtTfx8jIvNG7agggvIWIoIRhnP1flg",
  authDomain: "dirkje-88fea.firebaseapp.com",
  databaseURL: "https://dirkje-88fea.firebaseio.com",
  storageBucket: "dirkje-88fea.appspot.com",
  messagingSenderId: "948454586738"
};
firebase.initializeApp(config);

// Get a reference to the storage service, which is used to create references in your storage bucket
var storage = firebase.storage();
var storageRef = storage.ref();

var firebaseSave = function(file, name) {
  console.log("Writing to FB with name", name);
  // TODO: add timestamp
  var ref = storageRef.child(name.toString()); // This will normally be a string, but firebase complains if only numbers are provided
  return ref.put(file)
    .then(function(snapshot) {
      console.log('Uploaded a blob or file!');
      return ref.getDownloadURL();
    });
}
