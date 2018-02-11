var express=require('express');
var app=express();
var PORT=process.env.PORT || 3000;

var todos=[{
	id:1,
	description:'wake up in morning',
	completed: false
},{
	id:2,
	description: 'get ready for college',
	completed: false
},{
	id:3,
	description:'do the breakfast',
	completed: true
}];

//GET /todos

app.get('/todos',function(req,res){
	res.json(todos);
});

// GET /todos/:id

app.get('/todos/:id',function(req,res){
	//res.send('asking for todo whose id is:'+req.params.id);

	var todoId= parseInt(req.params.id,10);
	var matchedTodo;

	todos.forEach(function(todo){

		if(todo.id === todoId)
		{
			matchedTodo = todo;
		}
	});

	if(matchedTodo)
	{
		res.json(matchedTodo);
	}
	else
	{
		res.status(404).send();
	}
});

app.get('/',function(req ,res){
	res.send('Todo API root');
});

app.listen(PORT,function(req, res){
	console.log('Express Listening on port '+PORT+ '!');
});