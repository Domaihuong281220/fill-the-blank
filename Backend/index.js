// index.js
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); // Allows parsing JSON request bodies

// Sample data for the drag-and-drop exercise
const exerciseData = {
    question: {
        paragraph:
            "The sky is [_input] and the grass is [_input]. You should drag the word <span style='color: red;'>green</span> to the correct blank.",
        blanks: [
            { id: 1, position: "first", correctAnswer: "blue", type: "input" },
            { id: 2, position: "second", correctAnswer: "green", type: "drag" }
        ],
        dragWords: [
            { word: "blue", color: "default", id: 1 },
            { word: "green", color: "red", id: 2 },
            { word: "yellow", color: "default", id: 3 },
            { word: "red", color: "default", id: 4 }
        ]
    }
};

// Route to fetch the exercise data
app.get("/api/exercise", (req, res) => {
    res.json(exerciseData);
});

// Route to receive submitted answers
app.post("/api/submit", (req, res) => {
    console.log("Received answers:", req.body.answers);

    const { answers } = req.body;

    // Check the number of correct answers
    let correctCount = 0;
    answers.forEach((answer, index) => {
        if (answer === exerciseData.question.blanks[index].correctAnswer) {
            correctCount++;
        }
    });

    const isCorrect = correctCount === exerciseData.question.blanks.length;
    const message = isCorrect ? "Correct!" : "Try Again!";

    res.json({ message, correctCount });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
