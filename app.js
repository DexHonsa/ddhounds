var express = require("express");
var app = express();
var path = require('path');
var bodyParser = require("body-parser");
var morgan = require("morgan");
var xlsx = require('node-xlsx').default;
var multer = require('multer');
var fs = require("fs-extra");
var sqlite3 = require('sqlite3').verbose();

const Storage = multer.diskStorage({
    destination(req, file, callback) {
      callback(null, './tmp/');
    },
    filename(req, file, callback) {
      callback(null, file.originalname);
    },
  });


const upload = multer({ storage: Storage });

let db = new sqlite3.Database('./db/USCO_WD.db', (err) => {
	if (err) {
	  console.error(err.message);
	}
	console.log('Connected to the database.');
	
  });



app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT,POST,PATCH,DELETE,GET");
    return res.status(200).json({});
  }
  next();
});
app.use('/api/static', express.static(path.join(__dirname + '/uploads')));

app.post('/api/upload', upload.single('file'),  async (req,res)=>{
	await fs.move("./tmp/" + req.file.filename, "./uploads/" + req.file.filename, { overwrite: true }, async function (err) {
		if (err) {
		await fs.remove("./tmp/" + req.file.filename);
		res.status(500).send({message:'error'})
		} 
	});
	res.status(200).send({message:'success'})
})

app.get('/api/overrides',(req, res)=>{
	const workSheetsFromFile = xlsx.parse(`${__dirname}/uploads/overrides.xlsx`);
	const items = workSheetsFromFile[0].data.slice(9, workSheetsFromFile[0].data.length);
	res.send({headers:workSheetsFromFile[0].data[8],items});
})

app.get('/api/editableTransferable', (req, res)=>{
	const workSheetsFromFile = xlsx.parse(`${__dirname}/uploads/editable_transferable.xlsx`);
	const items = workSheetsFromFile[0].data.slice(1, workSheetsFromFile[0].data.length);
	res.send({headers:workSheetsFromFile[0].data[0],items});
})

app.post('/api/db', (req,res)=>{
	
	let {query, page, limit,filters,selector} = req.body;
	let filterss = [];
	for (let i = 0; i < filters.length; i++) {
		var obj = {};
		switch (filters[i].type) {
		  case 'number':
			switch (filters[i].operator) {
			  case 'between':
				obj[filters[i].name] = `AND ${filters[i].name}>${filters[i].min} AND ${filters[i].name}<${filters[i].max} `//{ $gt: Number(filters[i].min), $lt: Number(filters[i].max) }
				break;
			  case 'greater than':
				obj[filters[i].name] = `AND ${filters[i].name}>${filters[i].min} `
				break;
			  case 'less than':
				obj[filters[i].name] = `AND ${filters[i].name}<${filters[i].max} `
				break;
			}
			break;
		  case 'string':
			switch (filters[i].operator) {
			  case 'contains':
				reg = `AND ${filters[i].name}='${filters[i].value}' `
				obj[filters[i].name] = reg;
				break;
			  case 'excludes':
				reg = `AND ${filters[i].name} != '${filters[i].value}' `
				obj[filters[i].name] = { $not: { $regex: reg } };
				break;
			}
			break;
		  
		}
		filterss.push(obj);
	  };
	  console.log(filterss);

	let offset = page - 1 * limit;
	
	let names = [];
	
	db.each(`SELECT * FROM Titles WHERE Headings LIKE '${query}' AND Heading_Type LIKE '%${selector}%' LIMIT ${offset}, ${limit} `, function(err, row) {
		names.push({name:row.Headings, titles:row.Titles, link:row.Link, heading_type:row.Heading_Type});
		
		
	},function(err, count2) {
		
		db.each(`SELECT COUNT(Headings) FROM Titles WHERE Headings LIKE '%${query}%' AND Heading_Type LIKE '%${selector}%'`,function(err, count){
			count = count['COUNT(Headings)'];
			if(names.length == 0){
				res.status(500).send({message:'failed'})
			}else{
				
				res.status(200).send({message:'success',items:names,total:count});
			}	
		});
		
		//db.close();

	});
	
	
})


app.use((req, res, next) => {
  const error = new Error("Not Found");
  res.status(404);
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});




// mongoose.connect(
//   "mongodb://dexhonsa:Awesomeo21!@hid-shard-00-00-6vaxg.mongodb.net:27017,hid-shard-00-01-6vaxg.mongodb.net:27017,hid-shard-00-02-6vaxg.mongodb.net:27017/test?ssl=true&replicaSet=HID-shard-0&authSource=admin&retryWrites=true"
// );

module.exports = app;
