const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();

const URI =
	'mongodb+srv://portfolioadmin:qwerty123456@portfoliodb.sfrdltp.mongodb.net/portfolioDB';

app.set('view engine', 'ejs');

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(express.static('public'));

mongoose.set('strictQuery', true);
mongoose.connect(URI, { useNewUrlParser: true });

//create new schema

const projectSchema = {
	name: String,
	description: String,
	technologys: Array,
	git_link: String,
};

const Project = mongoose.model('Project', projectSchema);

app.get('/', function () {
	Project.find(function (err, foundProjects) {
		if (!err) {
			console.log(foundProjects);
		}
	});
});

app.listen(3000, function () {
	console.log('Server started on port 3000');
});
