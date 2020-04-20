var express = require("express");
var mysql = require("mysql");
var app = express();

/* Configure our server to read public folder and ejs files */
app.set('view engine', 'ejs');
app.use(express.static('public'));

//Config MySQL DMBS
const connection = mysql.createConnection({
    host : 'localhost',
    user : 'mguijarro',
    password : 'mguijarro',
    database : 'quotes_db'
});

connection.connect();

app.get("/", function(req, res) {
    console.log("Root Page Opened");
    res.render("home");
});

app.get("/searching", function(req, res) {
    console.log(req.query);
    var stmt = 'select * from l9_quotes, l9_author where ';
    if (req.query.searchType === 'category'){
        var searchTerm = req.query.searchTerm;
        stmt += "category='" + searchTerm + "' and l9_quotes.authorId=l9_author.authorId";
    } else if(req.query.searchType === 'name') {
        var searchTerm = req.query.searchTerm;
        searchTerm = searchTerm.split(' ');
        console.log("searchTerm = ", searchTerm);
        searchTerm.forEach((name, index) => {
            if(index != 0){
                stmt += " or ";
            }
            stmt += "("
            stmt += "(l9_author.firstName='" + name + "' or l9_author.lastName='" + name + "')";
            stmt += " and l9_author.authorId=l9_quotes.authorId)";
        })
    } else if(req.query.searchType === 'keyword'){
        searchTerm = req.query.searchTerm;
        stmt += "l9_quotes.quote like '%" + searchTerm +  "%' and l9_quotes.authorId=l9_author.authorId"; 
    } else {
        searchTerm = req.query.searchTerm.toLowerCase();
        if(searchTerm === "m" || searchTerm === "male" || searchTerm === "f" || searchTerm == "female"){
            if(searchTerm === "m" || searchTerm === "male"){
                stmt += "l9_author.sex='M'";
            } else if(searchTerm === "f" || searchTerm == "female") {
                stmt += "l9_author.sex='F'";
            }
        } else {
            stmt += "l9_author.sex='M' and l9_author.sex='F'";
        }
        
        stmt += " and l9_quotes.authorId=l9_author.authorId";
    }
    
    console.log("stmt = ", stmt);

     connection.query(stmt, function(error, found) {
        var quotes = null;
        if(error) throw error;
        if(found.length){
            quotes = found;
        }
        
        console.log(quotes);
        res.render("results", {quotes: quotes});
     });
    
});

app.get("/*", function(req, res){
    console.log("Error Page Loaded");
   res.render("error");
});

app.listen(process.env.PORT || 3000, function(){
    console.log('Server has been started');
})