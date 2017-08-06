var SongConverterWorker = function() {
    this.convertSong = function(card) {
        exec('avconv ' + '/home/pi/downloadedFiles/' + card + ' -o ' + '/home/pi/convertedFiles/' + card + '.wav', (e, stdout, stderr) => {
            if (e instanceof Error) {
                console.error(e);
            }
            console.log('stdout ', stdout);
            console.log('stderr ', stderr);
        });
    }
}

module.exports = SongConverterWorker;