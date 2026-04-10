# Quiz Master

Quiz Master is a sleek, modern, and responsive trivia application built with Vanilla JavaScript, HTML, and Tailwind CSS. It draws inspiration from Apple's design aesthetics, featuring a clean "glassmorphism" UI, smooth transitions, and a robust filtering system.

## Features

-   **Dynamic API Integration**: Fetches real-time trivia questions from the Open Trivia Database (OpenTDB).
-   **Comprehensive Filtering**:
    -   **Category**: Choose from 20+ different trivia categories.
    -   **Search**: Real-time keyword searching through questions and multiple-choice answers.
    -   **Difficulty**: Filter by Easy, Medium, or Hard levels.
-   **Smart Sorting**: Sort fetched questions alphabetically or by difficulty level.
-   **Progressive UI**:
    -   **Dark Mode**: Native dark/light mode toggle with persistent visibility fixes.
    -   **Progress Bar**: Visual feedback on your progress through the quiz.
    -   **Score Tracking**: Real-time score updates as you answer.
-   **Premium Design**: Features custom gradients, Inter typography, and Apple-style interactive elements.

## Use of Higher-Order Functions (HOFs)

The core logic of Quiz Master relies heavily on JavaScript's functional programming patterns, specifically Higher-Order Functions. This ensures the code is clean, declarative, and efficient.

### 1. `Map()`
Map is used throughout the application to transform data and generate UI elements dynamically:
-   **Data Transformation**: Transforming raw API responses into a cleaner object structure.
-   **Category Hydration**: Converting the static category list into HTML `<option>` elements.
-   **UI Generation**: Iterating over answer arrays to create interactive choice buttons.

### 2. `Filter()`
The `evaluatePipeline` function uses `.filter()` to implement the real-time search and categorization engine. It creates a new subset of questions that simultaneously satisfy:
-   The user's search keyword.
-   The selected difficulty level.

### 3. `Sort()`
The application uses `.sort()` to organize questions based on user preference:
-   **Alphabetical**: Sorting by the question text content.
-   **Difficulty**: Using a mapping object `{easy: 1, medium: 2, hard: 3}` to sort questions logically.

### 4. `Find()`
Within the filter pipeline, `.find()` is used to check if a search term matches any of the possible answers for a question, allowing for deeper search capabilities beyond just the question title.

## Getting Started

Simply open `index.html` in your browser. No build steps or dependencies are required other than an active internet connection to fetch questions from the API.
