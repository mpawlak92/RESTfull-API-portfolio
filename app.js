require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use(express.static('public'));

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true });

//create new schema

const projectSchema = {
	name: String,
	description: String,
	technologys: Array,
	git_link: String,
};

const Project = mongoose.model('Project', projectSchema);

app
	.route('/projects')
	.get(function (req, res) {
		Project.find(function (err, foundProjects) {
			if (!err) {
				res.send(foundProjects);
			} else {
				res.send(err);
			}
		});
	})
	.post(function (req, res) {
		const newProject = new Project({
			name: req.body.name,
			description: req.body.description,
			technologys: req.body.technologys,
			git_link: req.body.git_link,
		});

		newProject.save(function (err) {
			if (!err) {
				res.send('Succesfully added new project');
			} else {
				res.send(err);
			}
		});
	})
	.delete(function (req, res) {
		Project.deleteMany(function (err) {
			if (!err) {
				res.send('Succesfully deleted all projects');
			} else {
				res.send(err);
			}
		});
	});

// request for specyfic project
app
	.route('/projects/:_id')
	.get(function (req, res) {
		Project.findOne({ _id: req.params._id }, function (err, foundProject) {
			if (foundProject) {
				res.send(foundProject);
			} else {
				res.send('No projests matching to that id was found');
			}
		});
	})
	.put(function (req, res) {
		Project.replaceOne(
			{ _id: req.params._id },
			{
				name: req.body.name,
				description: req.body.description,
				technologys: req.body.technologys,
				git_link: req.body.git_link,
			},
			function (err) {
				if (!err) {
					res.send('Succesfully updated project');
				} else {
					res.send(err);
				}
			}
		);
	})
	.patch(function (req, res) {
		Project.updateOne(
			{ _id: req.params._id },
			{ $set: req.body },
			function (err) {
				if (!err) {
					res.send('Succesfully updated project');
				} else {
					res.send(err);
				}
			}
		);
	})
	.delete(function (req, res) {
		Project.findOne({ _id: req.params._id }, function (err, foundProject) {
			if (foundProject) {
				Project.deleteOne({ _id: req.params._id }, function (err) {
					if (!err) {
						res.send('Succesfully deleted project ' + req.params._id);
					} else {
						res.send(err);
					}
				});
			} else {
				res.send('Project does not exist');
			}
		});
	});

//////////////////////////////////////////////////////////////////// about me endpoint /////////////////////////////////////////////////////////

const aboutmeSchema = {
	description: String,
	skills: Array,
	contact: {
		linkedin_link: String,
		email: String,
		phone: {
			type: Number,
			min: 9,
			max: 9,
		},
	},
	cv_link: String,
	github_link: String,
};

const AboutmeData = mongoose.model('AboutmeData', aboutmeSchema);

app
	.route('/aboutme')
	.get(function (req, res) {
		AboutmeData.find(function (err, foundData) {
			if (!err) {
				res.send(foundData);
			} else {
				res.send(err);
			}
		});
	})
	.patch(function (req, res) {
		AboutmeData.updateOne({ $set: req.body }, function (err) {
			if (!err) {
				res.send('Succesfully updated my datas');
			} else {
				res.send(err);
			}
		});
	});
//////////////////////////////////////////////////////////////////// user me endpoint /////////////////////////////////////////////////////////

const userSchema = {
	username: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
};

const User = mongoose.model('User', userSchema);

app
	.route('/user')
	.get(function (req, res) {
		User.find(function (err, foundData) {
			if (!err) {
				res.send(foundData);
			} else {
				res.send(err);
			}
		});
	})
	.post(function (req, res) {
		const username = req.body.username;
		const password = req.body.password;

		User.findOne({ username: username }, function (err, foundUser) {
			if (!err) {
				if (foundUser) {
					if (foundUser.password === password) {
						res.send(Boolean(true));
					} else {
						res.send({
							status: Boolean(false),
							message: 'Password or username is wrong!',
						});
					}
				} else {
					res.send('Password or username is wrong!');
				}
			} else {
				res.send(err);
			}
		});
	})
	.patch(function (req, res) {
		User.updateOne({ $set: req.body }, function (err) {
			if (!err) {
				res.send('Succesfully updated user datas');
			} else {
				res.send(err);
			}
		});
	});
app.listen(3000, function () {
	console.log('Server started on port 3000');
});
