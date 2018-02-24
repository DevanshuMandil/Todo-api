var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;
app.use(bodyParser.json());

//GET /todos

app.get('/todos', function(req, res) {
	var queryParams = req.query;
	var filteredTodos = todos;

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, {
			completed: true
		});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, {
			completed: false
		});
	}

	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			return todo.description.indexOf(queryParams.q) > -1;
		});
	}

	res.json(filteredTodos);
});

// GET /todos/:id

app.get('/todos/:id', function(req, res) {
	//res.send('asking for todo whose id is:'+req.params.id);

	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	//var matchedTodo;
	// todos.forEach(function(todo){

	// 	if(todo.id === todoId)
	// 	{
	// 		matchedTodo = todo;
	// 	}
	// });

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}
});

// POST /todos

app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body).then(function(todo){
		res.json(todo.toJSON());
	}).catch(function(e){
		res.status(400).json(e);
	});

	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {

	// 	return res.status(400).send();
	// }

	// body.description = body.description.trim();

	// body.id = todoNextId;
	// todoNextId++;
	// todos.push(body);

	// // console.log('description:'+ body.description);
	// res.json(todos);
});

// DELETE /todos/id
app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});

	if (!matchedTodo) {
		res.send(400).json({
			"error": "no todo found with that id"
		});
	} else {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}

});

//PUT /todos/:id

app.put('/todos/:id', function(req, res) {

	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {
		id: todoId
	});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		res.status(400).send();
	}

	_.extend(matchedTodo, validAttributes);

	res.json(matchedTodo);
});

app.get('/', function(req, res) {
	res.send('Todo API root');
});

db.sequelize.sync({force: false}).then(function(){
	app.listen(PORT, function(req, res) {
	console.log('Express Listening on port ' + PORT + '!');
});
});

