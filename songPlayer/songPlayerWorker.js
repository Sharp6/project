"use strict";

const exec = require('child_process').exec;

var SongPlayerWorker = function() {

    this.play = function(song) {
        exec('aplay /home/pi/convertedFiles/' + song + ".wav", (e, stdout, stderr) => {
            if (e instanceof Error) {
                console.error(e);
            }
            console.log('stdout ', stdout);
            console.log('stderr ', stderr);
        });
    }

    this.handleCommand = function(command) {
        if(command === "volumeUp") {
            exec("amixer sset 'Master' 10%+", (e, stdout, stderr) => {
                if (e instanceof Error) {
                    console.error(e);
                }
                console.log('stdout ', stdout);
                console.log('stderr ', stderr);
            });
        }

        if(command === "volumeDown") {
            exec("amixer sset 'Master' 10%-", (e, stdout, stderr) => {
                if (e instanceof Error) {
                    console.error(e);
                }
                console.log('stdout ', stdout);
                console.log('stderr ', stderr);
            });
        }
    }    
}

module.exports = SongPlayerWorker;