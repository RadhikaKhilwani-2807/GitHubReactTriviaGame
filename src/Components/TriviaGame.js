import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../TriviaGame.css'; 

const RETRY_LIMIT = 20; 
const RETRY_DELAY_MS = 1000; 

function TriviaGame() {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState([]);
    const [answer, setAnswer] = useState('');
    const [result, setResult] = useState('');
    const [score, setScore] = useState(0);
    const [questionNumber, setQuestionNumber] = useState(1);

    useEffect(() => {
        const fetchData = async (retryCount = 0) => {
            try {
                const response = await axios.get('https://opentdb.com/api.php?amount=10');
                const data = response.data.results[questionNumber - 1];
                if (data) {
                    setQuestion(data.question);
                    const allOptions = data.incorrect_answers.concat(data.correct_answer);
                    setOptions(shuffleArray(allOptions));
                    setAnswer(data.correct_answer);
                } else {
                    setResult('No more questions available.');
                }
            } catch (error) {
                if (error.response && error.response.status === 429 && retryCount < RETRY_LIMIT) {
                    // If 429 error, wait and retry
                    console.log(`Rate limit exceeded. Retrying in ${RETRY_DELAY_MS}ms...`);
                    setTimeout(() => fetchData(retryCount + 1), RETRY_DELAY_MS);
                } else {
                    console.error('Error fetching data:', error);
                    setResult('Failed to fetch data. Please try again later.');
                }
            }
        };

        fetchData();
    }, [questionNumber]);

    const handleSubmit = (option) => {
        if (option === answer) {
            setResult('Correct!');
            setScore(score + 1);
        } else {
            setResult(`Incorrect. The correct answer is ${answer}.`);
        }
    };

    const handleNextQuestion = () => {
        if (questionNumber < 10) {
            setQuestionNumber(questionNumber + 1);
            setResult('');
        }
    };

    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    return (
        <div className="container mt-4">
            <h1 className="text-center mb-4">Trivia Game</h1>
            <p className="question text-center">Question {questionNumber}</p>
            <p className="text-center mb-4">{question}</p>
            <ul className="list-unstyled">
                {options.map((option, index) => (
                    <li key={index} className="mb-2">
                        <button
                            className={`btn btn-outline-primary ${result.startsWith('Incorrect') && option === answer ? 'incorrect' : ''}`}
                            onClick={() => handleSubmit(option)}
                        >
                            {option}
                        </button>
                    </li>
                ))}
            </ul>
            {result && (
                <div className="text-center mt-3">
                    <p>{result}</p>
                    {questionNumber < 10 ? (
                        <button className="btn btn-primary" onClick={handleNextQuestion}>Next Question</button>
                    ) : (
                        <div className="results">
                            <h2>Results</h2>
                            <p>Total Questions: 10</p>
                            <p>Correct Answers: {score}</p>
                            <p>Incorrect Answers: {10 - score}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default TriviaGame;
