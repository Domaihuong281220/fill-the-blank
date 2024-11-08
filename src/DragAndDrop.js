import React, { useState, useEffect } from "react";
import "./DragAndDrop.css";

// Main Drag and Drop Component
const DragAndDrop = () => {
    const [blanks, setBlanks] = useState([]);
    const [dragWords, setDragWords] = useState([]);
    const [initialDragWords, setInitialDragWords] = useState([]);
    const [feedback, setFeedback] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);

    // Fetch initial data for blanks and draggable words
    useEffect(() => {
        fetch("https://nodejsvercel-git-main-domaihuong281220s-projects.vercel.app/api/exercise")
            .then(response => response.json())
            .then(data => {
                const blanksWithAnswers = data.question.blanks.map(blank => ({ ...blank, userAnswer: "" }));
                setBlanks(blanksWithAnswers);
                setDragWords(data.question.dragWords);
                setInitialDragWords(data.question.dragWords);
            })
            .catch(error => console.error("Error fetching data:", error));
    }, []);

    // Handle drag start for each word
    const handleDragStart = (e, word) => {
        e.dataTransfer.setData("text/plain", word);
    };

    // Handle word drop into blanks
    const handleDrop = (e, blankId) => {
        e.preventDefault();
        const newWord = e.dataTransfer.getData("text");
        const previousWord = blanks.find(blank => blank.id === blankId)?.userAnswer;

        setBlanks(prevBlanks =>
            prevBlanks.map(blank =>
                blank.id === blankId ? { ...blank, userAnswer: newWord } : blank
            )
        );

        setDragWords(prevWords => {
            const updatedWords = prevWords.filter(word => word.word !== newWord);
            if (previousWord && !updatedWords.some(word => word.word === previousWord)) {
                const originalWordData = initialDragWords.find(word => word.word === previousWord);
                return [...updatedWords, originalWordData];
            }
            return updatedWords;
        });
    };

    // Handle drag out from blanks
    const handleDragOut = (e, blankId) => {
        e.preventDefault();
        const wordToRemove = blanks.find(blank => blank.id === blankId)?.userAnswer;

        setDragWords(prevWords => {
            if (wordToRemove && !prevWords.some(word => word.word === wordToRemove)) {
                const originalWordData = initialDragWords.find(word => word.word === wordToRemove);
                return [...prevWords, originalWordData];
            }
            return prevWords;
        });

        setBlanks(prevBlanks =>
            prevBlanks.map(blank =>
                blank.id === blankId ? { ...blank, userAnswer: "" } : blank
            )
        );
    };

    // Handle submission of answers
    const handleSubmit = () => {
        const answers = blanks.map(blank => blank.userAnswer);

        fetch("https://nodejsvercel-git-main-domaihuong281220s-projects.vercel.app/api/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ answers })
        })
            .then(response => response.json())
            .then(data => {
                setCorrectCount(data.correctCount);
                setFeedback(data.message);
                setIsSubmitted(true);
            })
            .catch(error => console.error("Error submitting data:", error));
    };

    // Read sentence aloud based on current answers
    const handleReadAloud = () => {
        const sentence = `The sky is ${blanks[0]?.userAnswer || "blank"} and the grass is ${blanks[1]?.userAnswer || "blank"}.`;
        const utterance = new SpeechSynthesisUtterance(sentence);
        speechSynthesis.speak(utterance);
    };

    // Reset blanks and return words to draggable list
    const resetBlanks = () => {
        setBlanks(prevBlanks => prevBlanks.map(blank => ({ ...blank, userAnswer: "" })));
        setDragWords([...initialDragWords]);
    };

    return (
        <div className="container">
            <h2>Fill in the Blanks</h2>
            <div className="sentence-container">
                <p id="question-text">
                    The sky is{" "}
                    <Blank
                        id={1}
                        userAnswer={blanks[0]?.userAnswer}
                        onDrop={handleDrop}
                        onDragOut={handleDragOut}
                    />{" "}
                    and the grass is{" "}
                    <Blank
                        id={2}
                        userAnswer={blanks[1]?.userAnswer}
                        onDrop={handleDrop}
                        onDragOut={handleDragOut}
                    />.
                </p>
                <button className="readBtn" onClick={handleReadAloud}></button>
            </div>
            <div id="draggable-words">
                {dragWords.map(word => (
                    <DraggableWord
                        key={word.id}
                        word={word.word}
                        color={word.color}
                        onDragStart={handleDragStart}
                    />
                ))}
            </div>
            <button className="submitBtn" onClick={handleSubmit}>
                <span>Submit</span>
                <svg width="15px" height="10px" viewBox="0 0 13 10">
                    <path d="M1,5 L11,5"></path>
                    <polyline points="8 1 12 5 8 9"></polyline>
                </svg>
            </button>
            {isSubmitted && (
                <ResultsSummary
                    feedback={feedback}
                    correctCount={correctCount}
                    onContinue={() => {
                        setIsSubmitted(false);
                        resetBlanks();
                    }}
                />
            )}
        </div>
    );
};

// Blank Component for each blank in the sentence
const Blank = ({ id, userAnswer, onDrop, onDragOut }) => (
    <span
        className="blank"
        onDrop={e => onDrop(e, id)}
        onDragOver={e => e.preventDefault()}
        draggable
        onDragStart={e => onDragOut(e, id)}
    >
        {userAnswer || "[______]"}
    </span>
);

// Draggable Word Component
const DraggableWord = ({ word, color, onDragStart }) => (
    <div
        className={`draggable ${color === "red" ? "red" : ""}`}
        draggable
        onDragStart={e => onDragStart(e, word)}
    >
        {word}
    </div>
);

// Results Summary Component
const ResultsSummary = ({ feedback, correctCount, onContinue }) => (
    <div className="results-summary-container">
        {feedback === "Correct!" && (
            <div className="confetti">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="confetti-piece"></div>
                ))}
            </div>
        )}
        <div className="results-summary-container__result">
            <h3>Your Result</h3>
            <div className="result-box">
                <span className="heading-primary">{correctCount}</span>
                <p className="result">of 2</p>
            </div>
            <p>{feedback === "Correct!" ? "Great job!" : "Try again to get it right."}</p>
            <button className="btn btn__continue" onClick={onContinue}>Continue</button>
        </div>
    </div>
);

export default DragAndDrop;
