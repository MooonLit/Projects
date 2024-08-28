// Raul Morfin and Angel Caballero 
// Sources: 
//www.ChatGPT.com
//www.w3Schools.com
//www.stackoverflow.com


// Loading the Modules and frameworks needed
var express = require('express');
var app = express();
const bodyParser = require('body-parser');


// required module to make calls to API
const axios = require('axios');

app.use(bodyParser.urlencoded());

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page 
app.get('/', function(req, res) {
     res.render("pages/index.ejs", {});
     //res.render("pages/alias.ejs", {}); No longer needed
});
//Login Page
app.post("/login_page", function (req, res) {
    const { username, password } = req.body;
  
    if (username === "username" && password === "password") {
      res.redirect("/room");
    } else {
      res.redirect("/");
    }
  });
  // View

// alias page 
app.get('/alias', function(req, res) {
     res.render("pages/alias.ejs", {});
});

// Forgot Password page 
app.get('/forgot-password', function(req, res) {
    res.render("pages/forgot-password.ejs", {}); 
});

// Forgot Username page 
app.get('/forgot-username', function(req, res) {
    res.render("pages/forgot-username.ejs", {}); 
});
app.get('/room', function(req, res) {
    axios.get('http://127.0.0.1:5000/api/room')
        .then(response => {
            // Here response.data should be the array of rooms
            res.render("pages/room.ejs", { rooms: response.data });
        })
        .catch(error => {
            // Handle errors here
            console.error(error);
            res.status(500).send("Error fetching data");
        });
});

// POST route to add a new room
app.post('/add-room', function(req, res) {
    axios.post('http://127.0.0.1:5000/api/room', req.body)
        .then(response => {
            console.log(response.data);
            res.redirect('/room'); // Redirect back to the room management page
        })
        .catch(error => {
            console.error(error);
            res.status(500).send("Error adding room");
        });
});

// POST route to delete a room
app.post('/delete-room', function(req, res) {
    axios.delete('http://127.0.0.1:5000/api/room', { data: req.body })
        .then(response => {
            console.log(response.data);
            res.redirect('/room'); // Redirect back to the room management page
        })
        .catch(error => {
            console.error(error);
            res.status(500).send("Error deleting room");
        });
});

// POST route to update a room
app.post('/update-room', function(req, res) {
    const roomId = req.body.id;
    axios.put(`http://127.0.0.1:5000/api/room/${roomId}`, req.body)
        .then(response => {
            console.log(response.data);
            res.redirect('/room'); // Redirect back to the room management page
        })
        .catch(error => {
            console.error(error);
            res.status(500).send("Error updating room");
        });
});
//-----------------------------------------------------------
app.get('/floor', function(req, res) {
    axios.get('http://127.0.0.1:5000/api/floor')
        .then(response => {
            // Here response.data should be the array of floors
            res.render("pages/floor.ejs", { floors: response.data });
        })
        .catch(error => {
            // Handle errors here
            console.error(error);
            res.status(500).send("Error fetching data");
        });
});

// POST route to add a new room
app.post('/add-floor', function(req, res) {
    axios.post('http://127.0.0.1:5000/api/floor', req.body)
        .then(response => {
            console.log(response.data);
            res.redirect('/floor'); // Redirect back to the floor management page
        })
        .catch(error => {
            console.error(error);
            res.status(500).send("Error adding room");
        });
});

// POST route to delete a room
app.post('/delete-floor', function(req, res) {
    axios.delete('http://127.0.0.1:5000/api/floor', { data: req.body })
        .then(response => {
            console.log(response.data);
            res.redirect('/floor'); // Redirect back to the floor management page
        })
        .catch(error => {
            console.error(error);
            res.status(500).send("Error deleting floor");
        });
});

// POST route to update a room
app.post('/update-floor', function(req, res) {
    const floorId = req.body.id;
    axios.put(`http://127.0.0.1:5000/api/floor/${floorId}`, req.body)
        .then(response => {
            console.log(response.data);
            res.redirect('/floor'); // Redirect back to the floor management page
        })
        .catch(error => {
            console.error(error);
            res.status(500).send("Error updating floor");
        });
});
//-----------------------------------------------------

app.get('/resident', function(req, res) {
    axios.get('http://127.0.0.1:5000/api/resident')
        .then(response => {
            // Here response.data should be the array of residents
            res.render("pages/resident.ejs", { residents: response.data });
        })
        .catch(error => {
            // Handle errors here
            console.error(error);
            res.status(500).send("Error fetching data");
        });
});

// POST route to add a new room
app.post('/add-resident', function(req, res) {
    axios.post('http://127.0.0.1:5000/api/resident', req.body)
        .then(response => {
            console.log(response.data);
            res.redirect('/resident'); // Redirect back to the resident management page
        })
        .catch(error => {
            console.error(error);
            res.status(500).send("Error adding resident");
        });
});

// POST route to delete a room
app.post('/delete-resident', function(req, res) {
    axios.delete('http://127.0.0.1:5000/api/resident', { data: req.body })
        .then(response => {
            console.log(response.data);
            res.redirect('/resident'); // Redirect back to the resident management page
        })
        .catch(error => {
            console.error(error);
            res.status(500).send("Error deleting resident");
        });
});

// POST route to update a room
app.post('/update-resident', function(req, res) {
    const residentId = req.body.id;
    axios.put(`http://127.0.0.1:5000/api/resident/${residentId}`, req.body)
        .then(response => {
            console.log(response.data);
            res.redirect('/resident'); // Redirect back to the resident management page
        })
        .catch(error => {
            console.error(error);
            res.status(500).send("Error updating resident");
        });
});


app.post('/process_form', function(req, res){
    var hero = req.body.hero;
    var url = "https://www.superheroapi.com/api.php/10221405381743383/search/" + hero;
    axios.get(url)
        .then((response)=>{
            let myHeroArray = response.data.results;
            let hero = myHeroArray[0];
            let aliases = hero.biography.aliases;
            
            res.render('pages/thanks.ejs', {
                aliases: aliases
            });
        });
  
  })

  app.post('/process_login', function(req, res){
    var user = req.body.username;
    var password = req.body.password;

    if(user === 'admin' && password === 'password')
    {
        res.render('pages/main.ejs', {
            user: user,
            auth: true
        });
    }
    else
    {
        res.render('pages/main.ejs', {
            user: 'UNAUTHORIZED',
            auth: false
        });
    }
  })



app.listen(8080);
console.log('8080 is the magic port');
