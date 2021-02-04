const express = require("express");
const bodyParser = require("body-parser");
const db = require("./queries");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true,}));

app.use(express.static(__dirname + "/upload/images"));

var multer = require("multer");
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./upload/images");
  },
  filename: (req, file, cb) => {
    var filetype = "";
    if (file.mimetype === "image/gif") {
      filetype = "gif";
    }
    if (file.mimetype === "image/png") {
      filetype = "png";
    }
    if (file.mimetype === "image/jpeg") {
      filetype = "jpg";
    }
    cb(null, "image-" + Date.now() + "." + filetype);
  },
});
var upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), function (req, res, next) {
    const carid = req.body.id;
  const imgpath = "http://localhost:3000/" + req.file.filename;
  const createdDate = new Date();
    if (!req.file) {
        res.status(500);
        return next(err);
    }
  db.uploadImage(carid, imgpath, createdDate, res);

  res.json({ fileUrl: 'http://localhost:3000/images/' + req.file.filename });

    // res.setHeader('Content-Type', 'application/json');
//   res.writeHead(301, {'Content-Type' : 'multipart/form-data, boundary=<calculated when request is sent>'})
  res.end();
}); 


app.get('/', (req, res) => {
    res.json({info: "Node.js, Express and Postgres API"});
});


app.get('/car', db.getCars);
app.get('/car/:id', db.getCarById);
app.post('/car', db.createCar);
app.put('/car/:id', db.updateCar);
app.delete('/car/:id', db.deleteCar);

app.listen(port, ()=>{
    console.log(`App is running on post ${port}.`);
});
