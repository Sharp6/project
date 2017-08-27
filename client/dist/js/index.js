"use strict";function loadBlobInDom(a){var b=window.URL.createObjectURL(a);return loadAudioInDom(b)}function loadAudioInDom(a){var b=document.querySelector(".audio");return b.src=a,recordVm.playerVisible(!0),Promise.resolve()}var handleNewBlob=function(a){return Promise.all([loadBlobInDom(a),firebaseSave(a,userVm.card())])};function initRecorder(){recorder().then(function(a){recordVm.record=function(){try{a.start(),recordVm.isRecording(!0)}catch(a){statusVm.message(a)}},recordVm.stop=function(){try{a.stop(),recordVm.isRecording(!1)}catch(a){statusVm.message(a)}recordVm.loading(!0),a.getBlob().then(handleNewBlob).then(function(a){var b=a[1];return userVm.firebaseUserRef().update({songUrl:b,songUploaded:!0,songShouldBeDownloaded:!0})}).then(function(){recordVm.loading(!1),statusVm.message("Uw opname werd succesvol ge\xFCpload!")}).catch(function(a){statusVm.message(a)})}}).catch(function(){statusVm.error(!0)})}var StatusVm=function(){var a=this;this.message=ko.observable(),this.error=ko.observable(!1),this.statusVisible=ko.computed(function(){return!!a.message()})},statusVm=new StatusVm,UserVm=function(){var a=this;this.isReady=ko.observable(!1),this.isNotReady=ko.computed(function(){return!a.isReady()}),this.card=ko.observable(),this.name=ko.observable(),this.displayName=ko.observable(),this.firebaseUserRef=ko.observable()},userVm=new UserVm,LoginVm=function(){this.code=ko.observable(),this.loading=ko.observable(!1),this.login=function(){var a=this;!this.code()?statusVm.message("Vul een code in."):(console.log("Attempting to log in using code",this.code()),this.loading(!0),userVm.name(void 0),userVm.card(void 0),userVm.firebaseUserRef(void 0),userVm.isReady(!1),firebase.database().ref("adressen").orderByChild("code").equalTo(this.code().toLowerCase()).once("value").then(function(b){if(a.loading(!1),!b.val())return Promise.reject("Invalid login");statusVm.message("");var c=b.val()[Object.keys(b.val())[0]];userVm.card(c.card),userVm.name(c.name);var d=c.displayName?c.displayName:c.name;userVm.displayName(d),userVm.firebaseUserRef(firebase.database().ref("adressen").child(Object.keys(b.val())[0])),!c.songUrl||loadAudioInDom(c.songUrl)}).catch(function(a){console.log("Error:",a),statusVm.message("Met deze code kan je niet inloggen. Probeer opnieuw!")}))}.bind(this)},loginVm=new LoginVm,RecordVm=function(){this.loading=ko.observable(!1),this.playerVisible=ko.observable(!1),this.isRecording=ko.observable(!1),this.record=function(){statusVm.message("De opnemer is nog niet geladen")},this.stop=function(){statusVm.message("De opnemer is nog niet geladen")}}.bind(void 0),recordVm=new RecordVm,PageVm=function(){var a=this;this.initial=ko.observable(!0),this.selectedPage=ko.observable("imgPage"),this.currentPage=ko.observable("imgPage"),this.previousPage=ko.observable(""),this.showPage=function(a){"page2"===a&&initRecorder(),this.previousPage(this.currentPage()),this.currentPage(a)}.bind(this),this.selectedPage.subscribe(function(b){a.showPage(b)}),userVm.name.subscribe(function(b){!b||a.showPage("page2")}),userVm.isReady.subscribe(function(b){!b||a.showPage("page3")}),statusVm.error.subscribe(function(b){!b||a.showPage("errorPage")})},pageVm=new PageVm,ImgVm=function(){var a=this;this.modalImgSrc=ko.observable(""),this.modalVisible=ko.computed(function(){return 0<a.modalImgSrc().length})},imgVm=new ImgVm,errorPageVm={fileUploadLoading:ko.observable(!1),fileUploadDone:ko.observable(!1)};ko.applyBindings({errorPageVm:errorPageVm,imgVm:imgVm,loginVm:loginVm,userVm:userVm,recordVm:recordVm,statusVm:statusVm,pageVm:pageVm});var fileButton=document.getElementById("fileButton");fileButton.addEventListener("change",function(a){errorPageVm.fileUploadLoading(!0),firebaseSave(a.target.files[0],userVm.card()).then(function(a){return userVm.firebaseUserRef().update({songUrl:a,songUploaded:!0,songShouldBeDownloaded:!0})}).then(function(){errorPageVm.fileUploadLoading(!1),errorPageVm.fileUploadDone(!0),statusVm.message("Uw opname werd succesvol ge\xFCpload!")}).catch(function(a){errorPageVm.fileUploadLoading(!1),statusVm.message(a)})});