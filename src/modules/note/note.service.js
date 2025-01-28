import mongoose from "mongoose";
import noteModel from "../../DB/Models/note.model.js";

export const addNote = async (req, res) => {
    const userId = req.id;
    const { title, content } = req.body;
    try {
        if (!title || !content) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        const note = await noteModel.create({ title, content, userId });
        return res.status(201).json({ message: 'Note added successfully', note });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
export const updateNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const userId = req.id;
        const { title, content } = req.body;

        const updatedNote = await noteModel.findOneAndUpdate(
            { _id: noteId, userId },
            { title, content },
            { new: true }
        );

        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found or access denied.' });
        }

        res.status(200).json(updatedNote);
    } catch (error) {
        console.error(error);


        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid note ID format.' });
        }

        res.status(500).json({ message: 'An error occurred while updating the note.' });
    }
}

export const replaceNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const userId = req.id;
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const updatedNote = await noteModel.findOneAndReplace({ _id: noteId, userId }, { title, content }, { new: true });

        if (!updatedNote) {
            return res.status(404).json({ message: 'Note not found or access denied.' });
        }

        res.status(200).json({ message: 'Note replaced successfully', updatedNote });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while replacing the note.' });
    }
}

export const updateAllNotesTitle = async (req, res) => {
    try {
        const userId = req.id;
        console.log(userId);

        const { title } = req.body; // Get the new title from the request body

        // Validate inputs
        if (!title) {
            return res.status(400).json({ message: 'Title is required.' });
        }

        // Update all notes created by the user
        const updatedNotes = await noteModel.updateMany(
            { userId: userId },
            { $set: { title } } // Update the title
        );
        console.log(updatedNotes);
        // Check if any notes were updated
        if (updatedNotes.matchedCount === 0) {
            return res.status(404).json({ message: 'No notes found for the given userId.' });
        }

        res.status(200).json({
            message: 'All notes titles updated successfully.',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating notes.' });
    }
};


export const deleteNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const userId = req.id;
        console.log(userId);
        console.log(noteId);
        const deletedNote = await noteModel.findOneAndDelete({ _id: noteId, userId });

        if (!deletedNote) {
            return res.status(404).json({ message: 'Note not found or access denied.' });
        }

        res.status(200).json({ message: 'Note deleted successfully', deletedNote });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the note.' });
    }
}

export const getPaginatedNotes = async (req, res) => {
    try {
        const userId = req.id;
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
            return res.status(400).json({ message: 'Invalid page or limit parameters.' });
        }

        const notes = await noteModel.find({ userId })
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        res.status(200).json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving notes.' });
    }
};


export const getNoteById = async (req, res) => {
    try {
        const noteId = req.params.id;
        const userId = req.id;

        const note = await noteModel.findOne({ _id: noteId, userId });

        if (!note) {
            return res.status(404).json({ message: 'Note not found or access denied.' });
        }

        res.status(200).json(note);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving the note.' });
    }
}

export const getNoteByContent = async (req, res) => {
    try {
        const { content } = req.query;
        const userId = req.id;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const note = await noteModel.findOne({ content, userId });

        if (!note) {
            return res.status(404).json({ message: 'Note not found or access denied.' });
        }

        res.status(200).json(note);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving the note.' });
    }
}

export const getNoteWithUserInfo = async (req, res) => {
    try {
        const userId = req.id;

        const notes = await noteModel.find({ userId })
            .select('title userId createdAt')
            .populate({
                path: 'userId',
                select: 'email -_id',
            });

        res.status(200).json(notes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while retrieving notes.' });
    }
}

export const getNoteWithAggregation = async (req, res) => {
    const userId = req.id;
    const searchTitle = req.query.title || '';
    console.log('userId:', userId);
    console.log('searchTitle:', searchTitle);

    try {
        const notes = await noteModel.aggregate([
            { $match: { userId } },
            ...(searchTitle
                ? [{ $match: { title: { $regex: new RegExp(searchTitle, 'i') } } }]
                : []),
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    createdAt: 1,
                    userName: '$user.name',
                    userEmail: '$user.email',
                },
            },
        ]);

        res.status(200).json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ message: 'Failed to fetch notes' });
    }
};



export const deleteAllNotes = async (req, res) => {
    try {
        const userId = req.id;



        const deletedNotes = await noteModel.deleteMany({ userId });

        if (deletedNotes.deletedCount === 0) {
            return res.status(404).json({ message: 'Notes not found or access denied.' });
        }

        res.status(200).json({ message: 'All notes deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting all notes.' });
    }
}
