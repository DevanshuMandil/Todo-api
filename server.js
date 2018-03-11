var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;
app.use(bodyParser.json());

//GET /todos

app.get('/todos', function(req, res) {

	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	})
});

// GET /todos/:id

app.get('/todos/:id', function(req, res) {
	//res.send('asking for todo whose id is:'+req.params.id);

	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function(todo) {

		if (todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}

	}).catch(function(e) {
		res.status(500).send();
	});

});

// POST /todos

app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create({
		description: body.description.trim(),
		completed: body.completed
	}).then(function(todo) {
		res.json(todo.toJSON());
	}).catch(function(e) {
		res.status(400).json(e);
	});
});

// DELETE /todos/id
app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowDeleted) {
		if (rowDeleted === 0) {
			res.status(404).json({
				error: 'no todo with us'
			})
		} else {
			res.status(204).send();
		}
	}, function(e) {
		res.status(500).send();
	})
});

//PUT /todos/:id

app.put('/todos/:id', function(req, res) {

	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findById(todoId).then(function(todo) {
		if (todo) {
			todo.update(attributes).then(function(todo) {
				res.json(todo.toJSON());
			}, function(e) {
				res.status(400).json(e);
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	});
});

app.get('/', function(req, res) {
	res.send('Todo API root');
});

// POST /users
app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.create({
		email: body.email.trim(),
		password: body.password
	}).then(function(user) {
		res.json(user.toPublicJSON());
	}).catch(function(e) {
		res.status(400).json(e);
	});
});

//POST /users/login
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');

	db.user.authenticate(body).then(function(user) {

		var token = user.generateToken('authentication');

		if (token) {
			res.header('Auth', token).json(user.toPublicJSON());
		} else {
			res.status(401).send();
		}
	}, function() {
		res.status(401).send();
	});
});

db.sequelize.sync({
	force: true
}).then(function() {
	app.listen(PORT, function(req, res) {
		console.log('Express Listening on port ' + PORT + '!');
	});
});