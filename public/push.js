let btnNotif = document.getElementById("btnEnableNotifications");

if ("Notification" in window && "serviceWorker" in navigator) {
  btnNotif.addEventListener("click", function () {
    Notification.requestPermission(async function (res) {
      console.log("Request permission result:", res);
      if (res === "granted") {
        await setupPushSubscription();
      } else {
        console.log("User denied push notifs:", res);
      }

      // let sub = JSON.parse(localStorage.getItem("reminderSubscription"));
      // fetch("/remindMe", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Accept: "application/json",
      //   },
      //   body: JSON.stringify({ sub: sub, message: "Reminder placeholder" }),
      // });
    });
  });
} else {
  btnNotif.setAttribute("disabled", "");
  btnNotif.classList.add("btn-outline-danger");
}

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

async function setupPushSubscription() {
  try {
    let reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (sub === null) {
      var publicKey =
        "BI-KYrU1a0s1NXHysrfkeyJ6FyhzyXEhdkJnMem5aU4d1woks9LnfwfQSyS2yYgEHvvJJHNrhg-LzEktK7gutEc";
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      let res = await fetch("/saveSubscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ sub }),
      });
      if (res.ok) {
        console.log(sub);
        alert("Subscription generated and saved!\n");
      }
    } else {
      console.log(sub);
      alert("You are already subscribed!\n");
    }
  } catch (error) {
    console.log(error);
  }
}
