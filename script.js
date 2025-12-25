console.log("quiz.js loaded");

const questionParent = document.querySelector(".question-container");
const optionsParent = document.querySelector(".option-container");
const nextbutton = document.querySelector(".next");
const startbutton = document.querySelector(".start");
const categorySelect = document.querySelector(".category-select");
const scoreDisplay = document.querySelector(".score");
const timerDisplay = document.querySelector(".timer");
const progressDisplay = document.querySelector(".progress");

let quizzes = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedCategory = "9";
let timer;
let timeLeft = 10;

const getData = async (url) => {
  try {
    const { data: { results } } = await axios.get(url);
    return results;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const getQuizzes = async () => {
  const apiUrl = `https://opentdb.com/api.php?amount=5&category=${selectedCategory}&difficulty=easy&type=multiple`;
  quizzes = await getData(apiUrl);
  currentQuestionIndex = 0;
  score = 0;
  updateScore();
  createQuestionsAndOptions(quizzes, currentQuestionIndex);
};

function createQuestionsAndOptions(quizzes, index) {
  questionParent.innerHTML = "";
  optionsParent.innerHTML = "";
  clearInterval(timer);

  if (!quizzes.length || index >= quizzes.length) {
    questionParent.innerText = "🎉 Quiz Completed!";
    optionsParent.innerHTML = `<p>Your final score is ${score}/${quizzes.length}</p>`;
    progressDisplay.innerText = "";
    timerDisplay.innerText = "";
    return;
  }

  progressDisplay.innerText = `Question ${index + 1} of ${quizzes.length}`;
  timeLeft = 10;
  startTimer();

  const questionEle = document.createElement("p");
  questionEle.innerText = decodeHTML(quizzes[index].question);
  questionParent.appendChild(questionEle);

  let options = [quizzes[index].correct_answer, ...quizzes[index].incorrect_answers].sort(() => Math.random() - 0.5);

  for (let option of options) {
    const optionBtn = document.createElement("button");
    optionBtn.classList.add("button");
    optionBtn.innerText = decodeHTML(option);
    optionBtn.addEventListener("click", () => handleAnswer(optionBtn, quizzes[index].correct_answer));
    optionsParent.appendChild(optionBtn);
  }
}

function handleAnswer(button, correctAnswer) {
  clearInterval(timer);
  const selected = button.innerText;
  const allButtons = document.querySelectorAll(".button");

  allButtons.forEach(btn => btn.disabled = true);

  if (selected === decodeHTML(correctAnswer)) {
    button.classList.add("correct");
    score++;
    updateScore();
  } else {
    button.classList.add("incorrect");
    allButtons.forEach(btn => {
      if (btn.innerText === decodeHTML(correctAnswer)) {
        btn.classList.add("correct");
      }
    });
  }
}

nextbutton.addEventListener("click", () => {
  currentQuestionIndex++;
  createQuestionsAndOptions(quizzes, currentQuestionIndex);
});

startbutton.addEventListener("click", () => {
  selectedCategory = categorySelect.value;
  getQuizzes();
});

function startTimer() {
  timerDisplay.innerText = `⏳ ${timeLeft}`;
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.innerText = `⏳ ${timeLeft}`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      const correctAnswer = quizzes[currentQuestionIndex].correct_answer;
      const allButtons = document.querySelectorAll(".button");
      allButtons.forEach(btn => {
        btn.disabled = true;
        if (btn.innerText === decodeHTML(correctAnswer)) {
          btn.classList.add("correct");
        }
      });
    }
  }, 1000);
}

function updateScore() {
  scoreDisplay.innerText = score;
}

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
