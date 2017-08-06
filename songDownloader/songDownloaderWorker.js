var admin = require("firebase-admin");
var path = require('path');
var fs = require('fs');

var serviceAccount = require("/Users/philiphuysmans/Workspace/projectf/sandbox/fbupdater/dirkje-88fea-firebase-adminsdk-blp93-126124d325.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dirkje-88fea.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("adressen");
ref.on("child_added", function(snapshot) {
    // check here for the initial load
    console.log("child_added", snapshot.key);
    handleRemoteFile(snapshot.val());
});

ref.on("child_changed", function(snapshot) {
    // check here for updates when the app is running
    console.log("child_changed", snapshot.key);
    handleRemoteFile(snapshot.val());
});

function handleRemoteFile(contact) {
    if(!contact.songUploaded) {
        console.log("No song is marked for uploading.");
        return;
    }
    if(!contact.card) {
        console.log("No card information for contact", contact.Naam);
        return;
    }
    console.log("I'm checking the file for contact", contact.Naam);
    console.log("The card code is", contact.card);
    // create expected path
    var expectedPath = path.join(__dirname, contact.card);
    console.log("Expected path is", expectedPath);
    // check if file is present on the file system
    fs.access(expectedPath, fs.constants.R_OK, (err) => {
        if(err) {
            console.log("No access to file, we should download!");
        } else {
            console.log("File is available, let's checksum it or leave it as is.");
        }
    });
}

function calculateChecksum() {

}

function downloadFile() {
    
}

