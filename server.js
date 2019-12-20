let express = require("express");
let mongodb = require("mongodb");
let sanitizeHTML = require("sanitize-html");
let app = express();
let db;
app.use(express.static("public"));
// remote database
let connectionString = "mongodb+srv://webdevbro:J3nn1f3rLawr3nc3$@cluster0-mnxty.mongodb.net/todoapp2?retryWrites=true&w=majority";
// local database
// let connectionString = "mongodb://localhost:27017/todoapp2?readPreference=primary&appname=MongoDB%20Compass&ssl=false";
mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
  db = client.db();
  app.listen(3000);
});
app.use(express.json()); // adds submitted data from asynchronouse requests (JSON)
app.use(express.urlencoded({extended: false})); // adds submitted data from forms
// setup security
function passwordProtected(req, res, next) {
  res.set("WWW-Authenticate", "Basic realm= 'Simple Todo App'");
  console.log(req.headers.authorization);
  if (req.headers.authorization == "Basic Z3Vlc3Q6c2VjcmV0") {
    next();
  } else {
    res.status(401).send("Authentication required");
  }
}
app.use(passwordProtected);
app.get("/", function(req, res) {
  db.collection("items").find().toArray(function(err, items) {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
          integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <link rel="stylesheet" href="/style.css">
        <title>Simple ToDo App</title>
      </head>
      <body>
        <div class="container">
          <h1 class="display-4 text-center py-1">To Do App</h1>
          <div class="jumbotron p-3-shadow-sm">
            <form id="create-form" action="/create-item" method="POST">
              <div class="d-flex align-items-center">
                <input id="create-field" name="item" type="text" autofocus autocomplete="off" class="form-control mr-3" style="flex: 1;">
                <button class="btn btn-primary">Add New Iterm</button>
              </div>
            </form>
          </div>
          <ul id="item-list" class="list-group pb-5">

          </ul>
        </div><!-- class="container" -->
        <script src="https://code.jquery.com/jquery-3.4.1.slim.min.js"
          integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js"
          integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"
          integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>
        <script>
          let items = ${JSON.stringify(items)}
        </script>
        <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
        <script src="/browser.js"></script>
      </body>
      </html>
    `);
  });
});
// create item
app.post("/create-item", function(req, res) {
  let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
  db.collection("items").insertOne({text: safeText}, function(err, info) {
    res.json(info.ops[0]);
  })
});
// update item
app.post("/update-item", function(req, res) {
  let safeText = sanitizeHTML(req.body.text, { allowedTags: [], allowedAttributes: {} })
  db.collection("items").findOneAndUpdate({ _id: new mongodb.ObjectId(req.body.id) }, { $set: { text: safeText}}, function() {
    res.send("Success!");
  });
});
// delete item
app.post("/delete-item", function (req, res) {
  db.collection("items").deleteOne({ _id: new mongodb.ObjectId(req.body.id) }, function() {
    res.send("Success!");
  });
});

// create item old fashion way
/* app.post("/create-item", function (req, res) {
  db.collection("items").insertOne({ text: req.body.item }, function () {
    res.redirect("/");
  });
})
 */
// MAP FUNCTION TO LOOP OVER LI
/* ${
  items.map(function (item) {
    return `
                <li class="list-group-item list-group-item-action d-flex align-items center justify-content-between">
                  <span class="item-text">${item.text}</span>
                  <div>
                    <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
                    <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
                  </div>
                </li>
              `
  }).join("")
} */
