const cors = require('cors');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, './img/');
	},
	filename: (req, file, cb) => {
		// console.log(req);
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

const upload = multer({ storage: storage });

const bcrypt = require('bcrypt');
const saltRounds = 10;

const corsOptions = {
	origin: 'http://localhost:3000',
	credentials: true, //access-control-allow-credentials:true
	optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use('/img', express.static('img'));
app.use(
	bodyParser.json({
		extended: true,
	})
	// bodyParser.urlencoded({
	// extended: true,
	// })
);

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DATABASE_URI, { useNewUrlParser: true });

const projectSchema = {
	name: String,
	description: String,
	technologys: Array,
	git_link: String,
	projectCover: String,
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
	.post(upload.single('cover'), function (req, res) {
		if (req.file === undefined) {
			const newProject = new Project({
				name: req.body.name,
				description: req.body.description,
				technologys: req.body.technologys,
				git_link: req.body.git_link,
				projectCover: 'null',
			});

			newProject.save(function (err, requestResult) {
				if (!err) {
					const objectId = requestResult._id.toString();
					res.status(201);
					res.send({
						message: 'Succesfully added new project',
						_id: objectId,
						projectCover: 'null',
					});
				} else {
					res.send(err);
				}
			});
		} else {
			const newProject = new Project({
				name: req.body.name,
				description: req.body.description,
				technologys: req.body.technologys,
				git_link: req.body.git_link,
				projectCover: path.normalize(req.file.path),
			});

			newProject.save(function (err, requestResult) {
				if (!err) {
					const objectId = requestResult._id.toString();
					res.status(201);
					res.send({
						message: 'Succesfully added new project',
						_id: objectId,
						projectCover: path.normalize(req.file.path),
					});
				} else {
					res.send(err);
				}
			});
		}
	})
	.delete(function (req, res) {
		Project.deleteMany(function (err) {
			if (!err) {
				res.status(201);
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
					res.status(201);
					res.send('Succesfully updated project');
				} else {
					res.send(err);
				}
			}
		);
	})

	.patch(upload.single('cover'), function (req, res) {
		Project.findOne({ _id: req.params._id }, function (err, foundProject) {
			if (err) {
				res.send(err);
			} else {
				if (req.body.cover == 'null') {
					const newObjectBody = {
						...req.body,
						projectCover: foundProject.projectCover,
					};
					Project.updateOne(
						{ _id: req.params._id },
						{ $set: newObjectBody },
						function (err) {
							if (!err) {
								res.status(201);
								res.send({
									message: 'Succesfully updated project',
									updatedProject: newObjectBody,
								});
							} else {
								res.send(err);
							}
						}
					);
				} else if (req.file.path !== undefined) {
					if (foundProject.projectCover === 'null') {
						const newObjectBody = {
							...req.body,
							projectCover: path.normalize(req.file.path),
						};
						Project.updateOne(
							{ _id: req.params._id },
							{ $set: newObjectBody },
							function (err) {
								if (!err) {
									res.status(201);
									res.send({
										message: 'Succesfully updated project',
										updatedProject: newObjectBody,
									});
								} else {
									res.send(err);
								}
							}
						);
					} else {
						fs.unlink(foundProject.projectCover, function (error) {
							if (error) {
								res.send(error);
							} else {
								const newObjectBody = {
									...req.body,
									projectCover: path.normalize(req.file.path),
								};
								Project.updateOne(
									{ _id: req.params._id },
									{ $set: newObjectBody },
									function (err) {
										if (!err) {
											res.status(201);
											res.send({
												message: 'Succesfully updated project',
												updatedProject: newObjectBody,
											});
										} else {
											res.send(err);
										}
									}
								);
							}
						});
					}
				}
			}
		});
	})

	.delete(function (req, res) {
		Project.findOne({ _id: req.params._id }, function (err, foundProject) {
			if (!err) {
				Project.deleteOne({ _id: req.params._id }, function (err) {
					if (!err) {
						if (foundProject.projectCover !== 'null') {
							fs.unlink(foundProject.projectCover, function (error) {
								if (error) {
									res.send(error);
								} else {
									res.status(201);
									res.send('Project succesfuly deleted ');
								}
							});
						} else {
							res.status(201);
							res.send('Project succesfuly deleted ');
						}
					} else {
						res.send(err);
					}
				});
			} else {
				res.send('Project does not exist');
			}
		});
	});

////////////////////////////////// about me endpoint //////////////////////////////////

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
				res.send(...foundData);
			} else {
				res.send(err);
			}
		});
	})
	.patch(function (req, res) {
		AboutmeData.updateOne({ $set: req.body }, function (err) {
			if (!err) {
				res.status(201);
				res.send('Succesfully updated my data');
			} else {
				res.send(err);
			}
		});
	});
///////////////////////////// user me endpoint /////////////////////////////////////

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
				res.send(...foundData);
			} else {
				res.send(err);
			}
		});
	})
	.post(function (req, res) {
		const username = req.body.username;
		const password = req.body.password;

		User.findOne({ username: username }, function (err, foundUser) {
			console.debug(foundUser);

			if (!err) {
				if (foundUser) {
					bcrypt.compare(password, foundUser.password, function (err, result) {
						// result == true
						if (!result) {
							res.send({
								status: Boolean(false),
								message: 'Provided cridentials are incorect!',
							});
						} else {
							res.status(200);
							res.send({
								status: Boolean(true),
								message: 'All correct',
							});
						}
					});
				} else {
					res.send('Provided cridentials are incorect!');
				}
			} else {
				res.send(err);
			}
		});
	})
	.patch(function (req, res) {
		User.updateOne({ $set: req.body }, function (err) {
			if (!err) {
				res.send('Succesfully updated user data');
			} else {
				res.send(err);
			}
		});
	});

app.delete('/user/:_id', function (req, res) {
	User.findOne({ _id: req.params._id }, function (err, foundUser) {
		if (foundUser) {
			User.deleteOne({ _id: req.params._id }, function (err) {
				if (!err) {
					res.send('Succesfully deleted user ' + req.params._id);
				} else {
					res.send(err);
				}
			});
		} else {
			res.send('User does not exist');
		}
	});
});
app.post('/register', function (req, res) {
	bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
		const username = req.body.username;

		User.findOne({ username: username }, function (err, foundUser) {
			if (!err) {
				if (!foundUser) {
					const newUser = new User({
						username: req.body.username,
						password: hash,
					});
					newUser.save(function (err) {
						if (err) {
							res.send(err);
						} else {
							res.send('New user is succesfully added');
						}
					});
				} else {
					res.send('User with this name alredy exist');
				}
			} else {
				res.send(err);
			}
		});
	});
});
app.listen(process.env.PORT || 3001, function () {
	console.log('Server started on port 3001');
});
