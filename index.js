const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const bodyParser = require("body-parser");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var querystring = require("querystring");
const request = require("request");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".webm");
  },
});
let upload = multer({ storage });

// backend
var redirect_uri = "http://localhost:5001/callback";
var client_id = "936503747c944132bf576fcd6b9e6b0d";
var client_secret = "b435ae501a6c44f1baf23b6767d36e0c";

app.get("/", async (req, res) => {
  res.redirect("/login");
});
app.get("/public/token", async (req, res) => {
  axios
    .get(
      "https://open.spotify.com/get_access_token?reason=transport&productType=web-player"
    )
    .then((d) => {
      const { clientId, accessToken } = d.data;
      res.json({ clientId, accessToken });
    })
    .catch((e) => {
      console.log(e);
    });
});

app.get("/extract/colors/", async (req, res) => {
  const token = req.headers.authorization;
  const uri = req.headers.uri;
  try {
    const r = await axios.get(
      `https://api-partner.spotify.com/pathfinder/v1/query?operationName=fetchExtractedColors&variables={"uris":["${uri}"]}&extensions={"persistedQuery":{"version":1,"sha256Hash":"d7696dd106f3c84a1f3ca37225a1de292e66a2d5aced37a66632585eeb3bbbfa"}}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    res.json(r.data);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
});

app.get("/public/data", async (req, res) => {
  const token = req.headers.authorization;

  axios
    .get(
      "https://api-partner.spotify.com/pathfinder/v1/query?operationName=home&variables=%7B%22timeZone%22%3A%22Asia%2FCalcutta%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%223a67ee0ea6abad2ebad2e588a9aa130fc98d6b553f5b05ac6467503d02133bdc%22%7D%7D",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((d) => {
      res.json(d.data);
    })
    .catch((e) => {
      console.log(e);
    });
});

app.get("/home/data", async (req, res) => {
  const token = req.headers.authorization;

  axios
    .get(
      `https://api-partner.spotify.com/pathfinder/v1/query?operationName=home&variables=%7B%22timeZone%22%3A%22Asia%2FCalcutta%22%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%223a67ee0ea6abad2ebad2e588a9aa130fc98d6b553f5b05ac6467503d02133bdc%22%7D%7D`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "client-token":
            "AADzhSknfPMt2iBQc7YINfQq8VziyN+DR3zUlVxVVWER24/iGB3ybfj7m9DvSZC3AiecdGaWoXdktTttUYk/oXS4CdhyYwvu2uCLXBPgyehNKLiBwbK9iYLYSgG53VINc/TM1ueexJX3NTIyMBntvNybo7SMgTpbbc+01fM/9CLxU3ywld+B0FyfTWGDsTR/6cnZQFftjK8JCxkdosQSBqlhp0YikXQ2c2M1i7FbPqjmBMLhA7EytwrhOF8BID1N/CUjFqEpb12lg8jbULPIaqdD4+Mxvxw9yAOSP6WFSPnYJ5rCfAORMXeQKeXQN2cCvieEQXgAxpdC",
        },
      }
    )
    .then((d) => {
      res.json(d.data);
    })
    .catch((e) => {
      console.log(e);
    });
});
app.get("/callback", function (req, res) {
  var code = req.query.code || null;

  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      const { access_token, refresh_token } = body;
      res.redirect(
        `http://localhost:3000/authorize?access_token=${access_token}&refresh_token=${refresh_token}`
      );
    }
  });
});

app.get("/login", function (req, res) {
  var scope =
    "user-read-private user-read-email user-read-currently-playing streaming user-read-recently-played user-top-read user-read-playback-state playlist-modify-public playlist-modify-private playlist-read-private playlist-read-collaborative";

  res.redirect(
    "https://accounts.spotify.com/authorize?" +
      querystring.stringify({
        response_type: "code",
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
      })
  );
});

// var server_port = process.env.YOUR_PORT || process.env.PORT || 80;
// var server_host = process.env.YOUR_HOST || '0.0.0.0';
// app.listen(server_port, server_host, function() {
//     console.log('Listening on port %d', server_port);
// });

app.post("/refresh_token", function (req, res) {
  var { refresh_token } = req.body;
  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    headers: {
      Authorization:
        "Basic " +
        new Buffer(client_id + ":" + client_secret).toString("base64"),
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    },
    json: true,
  };

  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;

      res.send({
        access_token: access_token,
      });
    }
  });
});

const defaultOptions = {
  secure: true,
  data_type: "audio",
  signature_version: "1",
  endpoint: "/v1/identify",
  host: "identify-eu-west-1.acrcloud.com",
  access_key: "30ad9146d1617f8b797a5871ed03dd1c",
  access_secret: "8T5o3UPdVt6I8Rx2LzdT8Z16y099g9BFusAacbJ1",
};

app.post("/audioSearch", upload.single("audio"), (req, res) => {
  const bitmap = fs.readFileSync(req.file.path);
  identify(Buffer.from(bitmap), defaultOptions, (err, httpResponse, body) => {
    if (err) res.send(err).status(500);
    fs.unlinkSync(req.file.path);
    res.send(body).status(200);
  });
});

function buildStringToSign(
  method,
  uri,
  accessKey,
  dataType,
  signatureVersion,
  timestamp
) {
  return [method, uri, accessKey, dataType, signatureVersion, timestamp].join(
    "\n"
  );
}

function sign(signString, accessSecret) {
  return crypto
    .createHmac("sha1", accessSecret)
    .update(new Buffer(signString, "utf-8"))
    .digest()
    .toString("base64");
}

/*Identifies a sample of bytes*/
function identify(data, options, callback) {
  let current_data = new Date();
  let timestamp = current_data.getTime() / 1000;

  let stringToSign = buildStringToSign(
    "POST",
    options.endpoint,
    options.access_key,
    options.data_type,
    options.signature_version,
    timestamp
  );

  let signature = sign(stringToSign, options.access_secret);

  let formData = {
    sample: data,
    timestamp: timestamp,
    signature: signature,
    sample_bytes: data.length,
    data_type: options.data_type,
    access_key: options.access_key,
    signature_version: options.signature_version,
  };
  request.post(
    {
      method: "POST",
      formData: formData,
      url: "http://" + options.host + options.endpoint,
    },
    callback
  );
}

app.listen(process.env.PORT || 5001, () => {
  console.log(`Listening at ${process.env.PORT || 5001}`);
});
