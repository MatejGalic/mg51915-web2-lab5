const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const fse = require("fs-extra");
const httpPort = process.env.PORT || 3001;

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  console.log(new Date().toLocaleString() + " " + req.url);
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const UPLOAD_PATH_SNAPS = path.join(__dirname, "public", "uploads", "snaps");
const UPLOAD_PATH_AUDIO = path.join(
  __dirname,
  "public",
  "uploads",
  "audio"
);

var uploadSnaps = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOAD_PATH_SNAPS);
    },
    filename: function (req, file, cb) {
      let fn = file.originalname.replace(/:/g, "-");
      cb(null, fn);
    },
  }),
}).single("image");

var uploadAudio = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOAD_PATH_AUDIO);
    },
    filename: function (req, file, cb) {
      let fn = file.originalname.replace(/:/g, "-");
      cb(null, fn);
    },
  }),
}).single("audio");

//#region Controllers
app.post("/saveSnap", function (req, res) {
  uploadSnaps(req, res, async function (err) {
    if (err) {
      console.log(err);
      res.json({
        success: false,
        error: {
          message: "Upload failed:: " + JSON.stringify(err),
        },
      });
    } else {
      console.log(req.body);
      res.json({ success: true, id: req.body.id });
      await sendPushNotifications(req.body.title);
    }
  });
});

app.post("/saveAudio", function (req, res) {
  uploadAudio(req, res, async function (err) {
    if (err) {
      console.log(err);
      res.json({
        success: false,
        error: {
          message: "Upload failed:: " + JSON.stringify(err),
        },
      });
    } else {
      console.log(req.body);
      res.json({ success: true, id: req.body.id });
      await sendPushNotifications(req.body.title);
    }
  });
});

app.post("/saveSubscription", function (req, res) {
  console.log(req.body);
  let sub = req.body.sub;
  subscriptions.push(sub);
  fs.writeFileSync(SUBS_FILENAME, JSON.stringify(subscriptions));
  res.json({
    success: true,
  });
});

app.post("/remindMe", function (req, res) {
  console.log("Accepted reminder");
  console.log(req.body);
  setTimeout(async () => {
    console.log("Sending reminder");
    await sendReminderPushNotification(req.body.sub, "Delayed notif");
  }, 5000);
  res.json({ success: true, id: req.body.id });
});

app.get("/snaps", function (req, res) {
  let files = fse.readdirSync(UPLOAD_PATH_SNAPS);
  files = files.reverse().slice(0, 25);
  console.log("In", UPLOAD_PATH_SNAPS, "there are", files);
  res.json({
    files,
  });
});

app.get("/audio", function (req, res) {
  let files = fse.readdirSync(UPLOAD_PATH_AUDIO);
  files = files.reverse().slice(0, 25);
  console.log("In", UPLOAD_PATH_AUDIO, "there are", files);
  res.json({
    files,
  });
});

//#endregion Controllers

const webpush = require("web-push");

// Umjesto baze podataka, čuvam pretplate u datoteci:
let subscriptions = [];
const SUBS_FILENAME = "subscriptions.json";
try {
  subscriptions = JSON.parse(fs.readFileSync(SUBS_FILENAME));
} catch (error) {
  console.error(error);
}

async function sendPushNotifications(snapTitle) {
  webpush.setVapidDetails(
    "mailto:matej.galic@fer.hr",
    "BI-KYrU1a0s1NXHysrfkeyJ6FyhzyXEhdkJnMem5aU4d1woks9LnfwfQSyS2yYgEHvvJJHNrhg-LzEktK7gutEc",
    "fMSlCm3VGPm2AmiDszZOLq5zKjQRrKvbQTfz1RidzxM"
  );
  subscriptions.forEach(async (sub) => {
    try {
      console.log("Sending notif to", sub);
      await webpush.sendNotification(
        sub,
        JSON.stringify({
          title: "New snap!",
          body: "Somebody just snaped a new photo: " + snapTitle,
          redirectUrl: "/index.html",
        })
      );
    } catch (error) {
      console.error(error);
    }
  });
}

async function sendReminderPushNotification(subscription, message) {
  webpush.setVapidDetails(
    "mailto:matej.galic@fer.hr",
    "BI-KYrU1a0s1NXHysrfkeyJ6FyhzyXEhdkJnMem5aU4d1woks9LnfwfQSyS2yYgEHvvJJHNrhg-LzEktK7gutEc",
    "fMSlCm3VGPm2AmiDszZOLq5zKjQRrKvbQTfz1RidzxM"
  );
  try {
    console.log("Sending notif to", subscription);
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Reminder!",
        body: message,
        redirectUrl: "/index.html",
      })
    );
  } catch (error) {
    console.error(error);
  }
}

app.listen(httpPort, function () {
  console.log(`HTTP listening on port: ${httpPort}`);
});
