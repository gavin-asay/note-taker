const express = require('express');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid'); //nanoid generates unique ids
let db = require('./db/db.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/notes', (req, res) => {
	res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/api/notes', (req, res) => {
	res.json(db);
});

app.post('/api/notes', (req, res) => {
	const savedNote = req.body;
	if (!savedNote.title || !savedNote.text) return res.sendStatus(400);

	// I wrote this if-block expecting that editing existing notes would be supported by the front end. Call it anticipating a new feature.
	if (savedNote.id) {
		let editedNote = db.find(note => note.id === savedNote.id);
		const index = db.findIndex(note => note.id === savedNote.id);

		editedNote.title = savedNote.title;
		editedNote.text = savedNote.text;
		db.splice(index, 1, editedNote);
		fs.writeFile(
			path.join(__dirname, '/db/db.json'),
			JSON.stringify(db, null, 2),
			err => {
				if (err) throw err;
			}
		);
		res.json(db);
	} else {
		savedNote.id = nanoid(10);
		console.log(savedNote);

		// accounts for the possibility that a new note is assigned a duplicate id, though it's unlikely
		while (db.find(note => note.id === savedNote.id) !== undefined) {
			savedNote.id = nanoid(10);
		}

		db.push(savedNote);
		fs.writeFileSync(
			path.join(__dirname, '/db/db.json'),
			JSON.stringify(db, null, 2),
			err => {
				if (err) throw err;
			}
		);
		res.json(db);
	}
});

app.delete('/api/notes/:id', (req, res) => {
	const index = db.findIndex(note => note.id === req.params.id);

	db.splice(index, 1); // removes selected note from db
	fs.writeFile(
		path.join(__dirname, '/db/db.json'),
		JSON.stringify(db, null, 2),
		err => {
			if (err) throw err;
		}
	);
	res.json(db);
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}.`);
});
