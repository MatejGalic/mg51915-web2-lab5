import { get, set } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

if (navigator.mediaDevices) {
  console.log("getUserMedia supported.");

  const stop = document.getElementById("stop");
  const record = document.getElementById("start");
  const uploadContainer = document.getElementById("afterAudio");
  const soundClips = document.getElementById("soundClips");
  const audio = document.createElement("audio");
  const constraints = { audio: true };
  let chunks = [];

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);

      record.onclick = () => {
        mediaRecorder.start();
        console.log(mediaRecorder.state);
        console.log("recorder started");
        record.classList.add("d-none");
        stop.classList.remove("d-none");
      };

      stop.onclick = () => {
        mediaRecorder.stop();
        console.log(mediaRecorder.state);
        console.log("recorder stopped");
        stop.classList.add("d-none");
      };

      mediaRecorder.onstop = (e) => {
        uploadContainer.classList.remove("d-none");

        const clipContainer = document.createElement("article");

        clipContainer.classList.add("clip");
        audio.setAttribute("controls", "");

        clipContainer.appendChild(audio);

        soundClips.appendChild(clipContainer);

        audio.controls = true;
        const blob = new Blob(chunks, { type: "audio/wav; codecs=opus" });
        chunks = [];
        const audioURL = URL.createObjectURL(blob);
        audio.src = audioURL;
      };

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };
    })
    .catch((err) => {
      console.error(`The following error occurred: ${err}`);
    });

  document
    .getElementById("btnUpload")
    .addEventListener("click", function (event) {
      event.preventDefault();
      if (!snapName.value.trim()) {
        alert("Give it a catchy name!");
        return false;
      }
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        let url = audio.src;
        fetch(url)
          .then((res) => res.blob())
          .then((blob) => {
            let ts = new Date().toISOString();
            let id = ts + snapName.value.replace(/\s/g, "_");
            set(id, {
              id,
              ts,
              title: snapName.value,
              audio: blob,
            });
            return navigator.serviceWorker.ready;
          })
          .then((swRegistration) => {
            return swRegistration.sync.register("sync-audio");
          })
          .then(() => {
            console.log("Queued for sync");
          })
          .catch((error) => {
            alert(error);
            console.log(error);
          });
      } else {
        alert("Background sync is not supported on your browser.");
      }
    });
}
