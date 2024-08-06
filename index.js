import express from 'express'
import morgan from 'morgan'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use(express.static('dist'))

let notes = [
	{
    	id: "1",
    	content: "HTML is easy",
    	important: true
  	},
	  {
	    id: "2",
	    content: "Browser can execute only JavaScript",
	    important: false
	  },
	  {
	    id: "3",
	    content: "GET and POST are the most important methods of HTTP protocol",
	    important: true
	  }
	]

const generateId = () => {
	const maxId = notes.length > 0 ? Math.max(...notes.map(note => note.id )) : 0
	return maxId + 1
}

const unKnownEndpoint = (request, response) => {
	return response.status(404).send({error: 'unknown endpoint'})
}

app.get('/', (request, response) => {
	response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
	response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
	const id = request.params.id
	const note = notes.find(note => note.id === id)
	if (note) {
		response.json(note)
	} else {
		response.status(404).end()
	}
})

app.delete('/api/notes/:id', (request, response) => {
	const id = request.params.id
	notes = notes.filter(note => note.id !== id)

	response.status(204).end()
})
app.put("/api/notes/:id", (request, response) => {
	const body = request.body;
	if (!body) return response.status(400).json({error: "Content Missing"});


	const id = request.params.id;
	if(!id) return response.status(400).json({error: "Id missing"});

	const noteIndex = notes.findIndex(note => note.id === id);
	if (noteIndex === -1) return response.status(404).json({error: `Note with id ${id} is missing`});

	notes[noteIndex] = body
	return response.status(200).json(body)
})

app.post('/api/notes', (request, response) => {

	const body = request.body
	if (!body.content) {
		return response.status(400).json({
			error: 'Content missing'
		})
	}
	const existingContent = notes.find(note => note.content === body.content)
	if (existingContent)
		return response.status(400).json({
			error: 'Content already exists'
		})
	const note = {
		content: body.content,
		important: Boolean(body.important) || false,
		id: String(generateId())
	}
	notes = notes.concat(note)
	response.status(201).json(note)
})

app.use(unKnownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
	console.log(`My server running on port ${PORT}`)
})
