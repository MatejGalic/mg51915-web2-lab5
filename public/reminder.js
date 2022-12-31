const uploadButton = document.getElementById("btnUpload");

uploadButton.addEventListener("click", async function (event) {
  event.preventDefault();
  if (!message.value.trim()) {
    alert("Give it a catchy name!");
    return false;
  }
  let reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();

  if (sub === null) {
    var publicKey =
      "BI-KYrU1a0s1NXHysrfkeyJ6FyhzyXEhdkJnMem5aU4d1woks9LnfwfQSyS2yYgEHvvJJHNrhg-LzEktK7gutEc";
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  fetch("/remindMe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sub: sub,
      message: message.value,
      timer: timer.value,
    }),
  })
    .then(function (res) {
      if (res.ok) {
        alert(
          `You will be notified about new updates in ${timer.value} seconds.`
        );
        uploadButton.disabled = true;
      } else {
        console.log(res);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
});

function urlBase64ToUint8Array(base64String) {
  var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  var base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}