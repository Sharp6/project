var admin = require("firebase-admin");
//var path = require('path');
var fs = require('fs');
var download = require('download');
var serviceAccount = require(__dirname + "/dirkje-88fea-firebase-adminsdk-blp93-126124d325.json");

var SongDownloaderWorker = function(sender) {

    this.sender = sender;

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://dirkje-88fea.firebaseio.com"
    });

    var db = admin.database();
    var ref = db.ref("adressen");
    

    var handleRemoteFile = function(contact) {
        if(!contact.val().songUploaded) {
            console.log("No song is marked for uploading.");
            return;
        }
        if(!contact.val().card) {
            console.log("No card information for contact", contact.name);
            return;
        }
        if(!!contact.val().songShouldBeDownloaded) {
            downloadSong(contact)
                .then(() => {
                    return contact.ref.update({ songShouldBeDownloaded: false });
                })
                .then(() => {
                    this.sender.send('downloadComplete', contact.val().card);
                })
                .catch(err => console.log(err));
        }
        /*
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
        */
    }.bind(this);

    function downloadSong(contact) {
        // check if file exists already
        return backupExistingFile("/home/pi/downloadedFiles/" + contact.val().card)
            .then(() => {
                var url = contact.val().songUrl;
                if(!url) {
                    return Promise.reject("No valid URL found for " + contact.val().name);
                }
                return download(url, "/home/pi/downloadedFiles");
            });
    }

    function backupExistingFile(filepath) {
        return new Promise((resolve,reject) => {
            fs.stat(filepath, (err, stats) => {
                if(!err) { // file exists, let's copy it to the backup
                    console.log("Renaming file", filepath);
                    fs.rename(filepath, filepath + "_" + Date.now().toString(), (err) => {
                        if(err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });    
                } else { // file does not exist
                    resolve();
                }
            });
        });
    }

    ref.on("child_added", handleRemoteFile);
    ref.on("child_changed", handleRemoteFile);
}

module.exports = SongDownloaderWorker;
