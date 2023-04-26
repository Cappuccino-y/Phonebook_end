require('dotenv').config()
const Person= require('./models/person')

const express = require('express')
const {request, response} = require("express");
const app = express()
const cors = require('cors')
app.use(cors())

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}
const morgan = require('morgan')
morgan.token('type', function (req, res) {
    return JSON.stringify(req.body)
})

app.use(express.json())
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :type"))
app.use(requestLogger)
let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons=>{
        response.json(persons)
    })
})
app.get('/info', (request, response) => {
    const now = new Date();
    response.send(`<p>
                        Phonebook has info for ${persons.length} people
                        </p>
                         <p>
                          ${now}
                         </p>`)
})
app.get('/api/persons/:id', (request, response,next) => {
    Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res,next) => {
    const body = req.body
    const person= {
    name: body.name,
    number: body.number,
    date:new Date()
    }
    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedNote => {
          res.json(updatedNote)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response,next) => {
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name) return response.status(400).json({error: "name missing"})
    if (!body.number) return response.status(400).json({error: "number missing"})
    Person.find({name:body.name}).then(person=>{
        if (!person) response.status(400).json({error: 'name must be unique'})
    })

    const person =new Person({
        name: body.name,
        number: body.number,
        date: new Date()
    }
    )
    person.save().then(person=> response.json(person))
})
const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
