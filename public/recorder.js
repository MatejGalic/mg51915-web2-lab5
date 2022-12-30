// const downloadLink = document.getElementById("download");
// const player = document.getElementById("player");
// const stopButton = document.getElementById("stop");
// const startButton = document.getElementById("start");

// const handleSuccess = function (stream) {
//   const options = { mimeType: "audio/webm" };
//   const recordedChunks = [];
//   const mediaRecorder = new MediaRecorder(stream, options);

//   if (window.URL) {
//     player.srcObject = stream;
//   } else {
//     player.src = stream;
//   }

//   mediaRecorder.addEventListener("dataavailable", function (e) {
//     if (e.data.size > 0) recordedChunks.push(e.data);
//   });

//   mediaRecorder.addEventListener("stop", function () {
//     const url = URL.createObjectURL(
//       new Blob(recordedChunks, { type: "audio/ogg; codecs=opus" })
//     );
//     downloadLink.href = url;
//     downloadLink.download = "acetest.wav";
//     player.src = url;

//     // stop recording
//     // player.srcObject.getAudioTracks().forEach(function (track) {
//     //   track.stop();
//     // });
//   });

//   stopButton.addEventListener("click", function () {
//     mediaRecorder.stop();
//   });

//   mediaRecorder.start();
// };

// startButton.addEventListener("click", function () {
//   navigator.mediaDevices
//     .getUserMedia({ audio: true, video: false })
//     .then(handleSuccess);
// });
