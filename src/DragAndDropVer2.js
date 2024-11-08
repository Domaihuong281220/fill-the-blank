import React, { useState, useEffect } from "react";
import "./DragAndDrop.css";

const DragAndDropVer2 = () => {
    const [blanks, setBlanks] = useState([]);
    const [dragWords, setDragWords] = useState([]);
    const [initialDragWords, setInitialDragWords] = useState([]);
    const [feedback, setFeedback] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);

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

    const handleDragStart = (e, word) => {
        e.dataTransfer.setData("text/plain", word);
    };

    const handleDrop = (e, blankId) => {
        e.preventDefault();
        const newWord = e.dataTransfer.getData("text");

        // Define the allowed words for each blank
        const allowedWords = {
            1: "blue", // Blank 1 can only accept "blue"
            2: "green" // Blank 2 can only accept "green"
        };

        // Check if the word matches the allowed word for the specific blank
        if (newWord !== allowedWords[blankId]) {
            console.log(`Only the word "${allowedWords[blankId]}" can be placed here.`);
            return; // Exit if the word is not allowed
        }

        // Get the previous word for the blank
        const previousWord = blanks.find(blank => blank.id === blankId)?.userAnswer;

        // Update blanks with the new word
        setBlanks(prevBlanks =>
            prevBlanks.map(blank =>
                blank.id === blankId ? { ...blank, userAnswer: newWord } : blank
            )
        );

        // Update drag words list, adding back the previous word if it exists
        setDragWords(prevWords => {
            const updatedWords = prevWords.filter(word => word.word !== newWord);
            if (previousWord && !updatedWords.some(word => word.word === previousWord)) {
                const originalWordData = initialDragWords.find(word => word.word === previousWord);
                return [...updatedWords, originalWordData];
            }
            return updatedWords;
        });
    };


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

    const handleReadAloud = () => {
        const sentence = `The sky is ${blanks[0]?.userAnswer || "blank"} and the grass is ${blanks[1]?.userAnswer || "blank"}.`;
        const utterance = new SpeechSynthesisUtterance(sentence);
        speechSynthesis.speak(utterance);
    };

    const resetBlanks = () => {
        let wordsAddedBack = false;

        setBlanks(prevBlanks => {
            const wordsToReturn = prevBlanks
                .map(blank => blank.userAnswer)
                .filter(answer => answer);

            if (!wordsAddedBack && wordsToReturn.length > 0) {
                wordsAddedBack = true;

                setDragWords(prevWords => {
                    const wordsData = wordsToReturn.map(word =>
                        initialDragWords.find(item => item.word === word)
                    );
                    return [...prevWords, ...wordsData];
                });
            }

            return prevBlanks.map(blank => ({ ...blank, userAnswer: "" }));
        });
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
                    />{" "}
                    and the grass is{" "}
                    <Blank
                        id={2}
                        userAnswer={blanks[1]?.userAnswer}
                        onDrop={handleDrop}
                    />.
                </p>
                <button className="readBtn" onClick={handleReadAloud} />
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
                {/* Social media icons and links */}
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

const Blank = ({ id, userAnswer, onDrop }) => (
    <span
        className="blank"
        onDrop={e => onDrop(e, id)}
        onDragOver={e => e.preventDefault()}
    >
        {userAnswer || "[______]"}
    </span>
);

const DraggableWord = ({ word, color, onDragStart }) => (
    <div
        className={`draggable ${color === "red" ? "red" : ""}`}
        draggable
        onDragStart={e => onDragStart(e, word)}
    >
        {word}
    </div>
);

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
            <div className="heading-tertiary">Your Result</div>
            <div className="result-box">
                <div className="heading-primary">{correctCount}</div>
                <p className="result">of 2</p>
            </div>
            <div className="result-text-box">
                <div className="heading-secondary">
                    {feedback === "Correct!" ? "Excellent" : "Oh no!"}
                </div>
                <p className="paragraph">
                    {feedback === "Correct!" ? "Congratulations! You have successfully completed the exercise." : "You are so close! Try again."}
                </p>
            </div>
            <div className="summary__cta">
                <button className="btn btn__continue" onClick={onContinue}>Continue</button>
            </div>
        </div>
    </div>
);

export default DragAndDropVer2;
