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
            <div className="submit-container">
                <ul class="example-2">
                    <li class="icon-content">
                        <a
                            data-social="linkedin"
                            aria-label="LinkedIn"
                            href="https://www.linkedin.com/in/maihuong652/"
                        >
                            <div class="filled"></div>
                            <svg
                                viewBox="0 0 16 16"
                                class="bi bi-linkedin"
                                fill="currentColor"
                                height="16"
                                width="16"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fill="currentColor"
                                    d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"
                                ></path>
                            </svg>
                        </a>
                        <div class="tooltip">LinkedIn</div>
                    </li>
                    <li class="icon-content">
                        <a data-social="github" aria-label="GitHub" href="https://github.com/Domaihuong281220/fill-the-blank">
                            <div class="filled"></div>
                            <svg
                                viewBox="0 0 16 16"
                                class="bi bi-github"
                                fill="currentColor"
                                height="16"
                                width="16"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fill="currentColor"
                                    d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"
                                ></path>
                            </svg>
                        </a>
                        <div class="tooltip">GitHub</div>
                    </li>
                </ul>
            </div>
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
