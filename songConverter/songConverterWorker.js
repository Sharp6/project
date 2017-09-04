const exec = require('child_process').exec;

var SongConverterWorker = function() {
    this.convertSong = function(card) {
	var command = 'avconv -y -i ' + '/home/pi/downloadedFiles/' + card + ' /home/pi/convertedFiles/' + card + '.wav';
	console.log("SongCovertorWorker", command);
	exec(command, (e, stdout, stderr) => {
            if (e instanceof Error) {
                console.error(e);
            }
            console.log('stdout ', stdout);
            console.log('stderr ', stderr);
        });
    }
}

module.exports = SongConverterWorker;
