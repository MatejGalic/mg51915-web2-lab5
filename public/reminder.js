const uploadButton = document.getElementById("btnUpload");

uploadButton.addEventListener("click", async function (event) {
  event.preventDefault();
  if (!message.value.trim()) {
    alert("Give it a catchy name!");
    return false;
  }
  let reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();

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
