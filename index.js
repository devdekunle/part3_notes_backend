import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import  Note  from './models/notes.js'

dotenv.config()
const app = express()
app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use(express.static('dist'))

mongoose.set('strictQuery', false);
const uri = process.env.MONGODB_URI
mongoose.connect(uri)
	.then(result => {
		console.log("Connected to MONGODB")
	})
	.catch(error => {
		console.log("Error connecting to MongoDB", error.message);
	})

const unKnownEndpoint = (request, response) => {
	return response.status(404).send({error: 'unknown endpoint'})
}

const errorHandler = (error, request, response, next) => {
	console.log(error.message)
	if (error.name == "CastError") {
		response.status(400).send({error: "Malformatted Id"})
	} else if (error.name === "ValidationError") {
		response.status(400).send({error: error.messge})
	}
	next(error);
}

app.get('/', (request, response) => {
	response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
	Note.find({})
	.then(result => {
		response.status(200).json(result);
	}).catch(error => {
		console.log("Error fetching data", error.message);
		response.status(500).end();
	})
})

app.get('/api/notes/:id', (request, response, next) => {
	const _id = request.params.id
	if (!_id) response.status(400).json({error: "id missing"});
	Note.findOne({_id}).then(note => {
		if (note) {
			response.status(200).json(note)
		} else {
			response.status(404).json({error: "Note not found"})
		}
	})
	.catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
	const _id = request.params.id
	if (!_id) {
		response.status(400).end()
	}
	Note.deleteOne(_id).then(result => {
		response.status(204).end()
	})
	.catch(error => next(error))
})
app.put("/api/notes/:id", (request, response, next) => {
	const body = request.body;
	if (!body) return response.status(400).json({error: "Content Missing"});

	const _id = request.params.id;
	if(!_id) return response.status(400).json({error: "Id missing"});
	
	Note.findByIdAndUpdate(
		_id,
		{ content: body.content, important: body.important  },
		{ new: true, runValidators: true, context: "query"})
	.then(updatedNote => {
		response.status(200).json(updatedNote)
	})
	.catch(error => next(error));
})

app.post('/api/notes', async (request, response, next) => {

	const body = request.body
	if (!body.content) {
		return response.status(400).json({
			error: 'Content missing'
		})
	}
	try {
		const existingNote = await Note.findOne({content: body.content}).exec()
		if (existingNote) {
			response.status(400).json({error: "Note already exists"})
		} else {
			const newNote = new Note({
				content: body.content,
				important: body.important
			})
			const returnedNote = await newNote.save()
			response.status(201).json(returnedNote)
		}
	} catch(error) {
		next(error)
	}

	
})

app.use(unKnownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
