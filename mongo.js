import mongoose from 'mongoose'

if (process.argv.length < 3) {
    console.log("Password is required! :)");
    process.exit()
}

const password = process.argv[2]

const url = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
    content: String,
    important: Boolean,
    date: Date
})

const Note = mongoose.model('Note', noteSchema);

let note = new Note({
    content: "My love for coding is just something else",
    important: true,
    date: new Date()
})

note.save().then(result => {
    console.log(result)
    mongoose.connection.close()
})

Note.find({important: false}).then(result => {
    result.forEach(note => {
        console.log(note);
    })
    mongoose.connection.close();
})
