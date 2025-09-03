import { useState, useEffect, useRef } from 'react'
import './App.css'

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet at least once.",
  "Programming is the art of telling another human being what one wants the computer to do.",
  "In the midst of winter, I found there was, within me, an invincible summer.",
  "The only way to do great work is to love what you do. Stay hungry, stay foolish.",
  "Life is what happens when you're busy making other plans. Time flies like an arrow."
];

const themes = {
  dark: {
    name: 'Dark',
    background: '#1a1a1a',
    text: '#ffffff',
    correctChar: '#4ade80',
    incorrectChar: '#ef4444',
    currentChar: '#3b82f6',
    containerBg: '#2d2d2d',
    buttonBg: '#374151',
    buttonHover: '#4b5563'
  },
  light: {
    name: 'Light', 
    background: '#ffffff',
    text: '#1f2937',
    correctChar: '#059669',
    incorrectChar: '#dc2626',
    currentChar: '#2563eb',
    containerBg: '#f9fafb',
    buttonBg: '#e5e7eb',
    buttonHover: '#d1d5db'
  },
  ocean: {
    name: 'Ocean',
    background: '#0f172a',
    text: '#cbd5e1',
    correctChar: '#06b6d4',
    incorrectChar: '#f59e0b',
    currentChar: '#8b5cf6',
    containerBg: '#1e293b',
    buttonBg: '#334155',
    buttonHover: '#475569'
  },
  forest: {
    name: 'Forest',
    background: '#14532d',
    text: '#dcfce7',
    correctChar: '#22c55e',
    incorrectChar: '#f97316',
    currentChar: '#84cc16',
    containerBg: '#166534',
    buttonBg: '#15803d',
    buttonHover: '#16a34a'
  }
};

type Theme = keyof typeof themes;

function App() {
  const [currentText, setCurrentText] = useState(sampleTexts[0]);
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errors, setErrors] = useState(0);
  const [theme, setTheme] = useState<Theme>('dark');
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerMode, setIsTimerMode] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [correctChars, setCorrectChars] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  const currentWpm = startTime && isStarted ? Math.round((correctChars / 5) / ((Date.now() - startTime) / 60000)) : 0;
  const finalWpm = endTime && startTime ? Math.round((correctChars / 5) / ((endTime - startTime) / 60000)) : 0;
  const wpm = isCompleted || isTimeUp ? finalWpm : currentWpm;
  const accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 0;

  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = themes[theme];
    root.style.setProperty('--bg-color', currentTheme.background);
    root.style.setProperty('--text-color', currentTheme.text);
    root.style.setProperty('--correct-char', currentTheme.correctChar);
    root.style.setProperty('--incorrect-char', currentTheme.incorrectChar);
    root.style.setProperty('--current-char', currentTheme.currentChar);
    root.style.setProperty('--container-bg', currentTheme.containerBg);
    root.style.setProperty('--button-bg', currentTheme.buttonBg);
    root.style.setProperty('--button-hover', currentTheme.buttonHover);
  }, [theme]);

  useEffect(() => {
    if (isTimerMode && isStarted && timeLeft > 0 && !isCompleted) {
      timerRef.current = window.setTimeout(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimeUp(true);
            setEndTime(Date.now());
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [isTimerMode, isStarted, timeLeft, isCompleted]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (isTimeUp || (isTimerMode && timeLeft === 0)) return;
    
    if (!isStarted) {
      setIsStarted(true);
      setStartTime(Date.now());
    }

    if (value.length <= currentText.length) {
      setUserInput(value);
      setCurrentIndex(value.length);

      let correctCount = 0;
      for (let i = 0; i < value.length; i++) {
        if (value[i] === currentText[i]) {
          correctCount++;
        }
      }
      setCorrectChars(correctCount);

      if (value.length > userInput.length && value[value.length - 1] !== currentText[value.length - 1]) {
        setErrors(prev => prev + 1);
      }

      if (value === currentText && !isTimerMode) {
        setIsCompleted(true);
        setEndTime(Date.now());
      }
    }
  };

  const resetTest = () => {
    setUserInput('');
    setCurrentIndex(0);
    setStartTime(null);
    setEndTime(null);
    setIsCompleted(false);
    setErrors(0);
    setIsStarted(false);
    setTimeLeft(30);
    setIsTimeUp(false);
    setCorrectChars(0);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getRandomText = () => {
    const randomIndex = Math.floor(Math.random() * sampleTexts.length);
    setCurrentText(sampleTexts[randomIndex]);
    resetTest();
  };

  const toggleTimerMode = () => {
    setIsTimerMode(!isTimerMode);
    resetTest();
  };

  const renderText = () => {
    return currentText.split('').map((char, index) => {
      let className = 'char ';
      if (index < userInput.length) {
        className += userInput[index] === char ? 'correct' : 'incorrect';
      } else if (index === currentIndex) {
        className += 'current';
      }
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="app">
      <header className="header">
        <h1>TypeSpeed Practice</h1>
        <div className="theme-selector">
          {Object.entries(themes).map(([key, themeData]) => (
            <button
              key={key}
              className={`theme-btn ${theme === key ? 'active' : ''}`}
              onClick={() => setTheme(key as Theme)}
            >
              {themeData.name}
            </button>
          ))}
        </div>
      </header>

      <main className="main-content">
        <div className="mode-selector">
          <button 
            className={`mode-btn ${!isTimerMode ? 'active' : ''}`}
            onClick={toggleTimerMode}
          >
            Free Mode
          </button>
          <button 
            className={`mode-btn ${isTimerMode ? 'active' : ''}`}
            onClick={toggleTimerMode}
          >
            30s Timer
          </button>
        </div>

        <div className="stats">
          {isTimerMode && (
            <div className="stat timer-stat">
              <span className="stat-label">Time</span>
              <span className="stat-value timer-value">{timeLeft}s</span>
            </div>
          )}
          <div className="stat">
            <span className="stat-label">WPM</span>
            <span className="stat-value">{wpm}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Accuracy</span>
            <span className="stat-value">{accuracy}%</span>
          </div>
          <div className="stat">
            <span className="stat-label">Errors</span>
            <span className="stat-value">{errors}</span>
          </div>
        </div>

        <div className="text-display">
          {renderText()}
        </div>

        <input
          ref={inputRef}
          type="text"
          className="typing-input"
          value={userInput}
          onChange={handleInputChange}
          placeholder={isTimerMode ? "Start typing... 30 seconds!" : "Start typing..."}
          disabled={isCompleted || isTimeUp}
          autoFocus
        />

        <div className="controls">
          <button onClick={resetTest} className="control-btn">
            Reset
          </button>
          <button onClick={getRandomText} className="control-btn">
            New Text
          </button>
        </div>

        {(isCompleted || isTimeUp) && (
          <div className="completion-message">
            <h2>{isTimeUp ? 'Time\'s Up!' : 'Test Completed!'}</h2>
            <p>WPM: {wpm} | Accuracy: {accuracy}% | Errors: {errors}</p>
            {isTimerMode && <p>Characters typed: {correctChars} correct out of {userInput.length} total</p>}
          </div>
        )}
      </main>
    </div>
  );
}

export default App
