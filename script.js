let quizAnswer = {};
let id = null;
let answerOrderNumer = 0;


/**
 * fetch data from API
 */
async function getQuizdata(StudentansID, answer) {
    let url = "https://wpr-quiz-api.herokuapp.com/attempts";
    const post = {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    };
    if (answer) {
        post.body = JSON.stringify({ answers: quizAnswer });
    }
    if (StudentansID) {
        url = `https://wpr-quiz-api.herokuapp.com/attempts/${StudentansID}/submit`;
    }
    let quizresponse = await fetch(url, post);
    let quizdata = await quizresponse.json();
    return quizdata;
}



/**
 * start quiz
 */
function startQuiz() {
    let startQuiz = document.querySelector('.start-button');
    startQuiz.addEventListener('click', startButton);
}

startQuiz();


/**
 * start button
 */
async function startButton() {
    document.getElementById('introduction').style.display = 'none';
    quesForm();
}

async function quesForm() {
    const quizdata = await getQuizdata();
    id = quizdata._id;
    let apt_quiz = document.getElementById('attempt-quiz');
    let submit_box = document.createElement('div');
    submit_box.classList.add('submit-box');
    let submit_btn = document.createElement('button');

    //show question make by quesCreate()
    let leng = quizdata.questions.length;
    let quesNum = 1;
    for (let i = 0; i < leng; i -= -1) {
        apt_quiz.appendChild(quesCreate(leng, quizdata.questions[i], quesNum));
        quesNum -= - 1;
    }
    /**
     * <div class = 'submit-box'>
     *      <button id = 'buttons' class = 'submit-button'>Submit your answers ❯</button>
     * </div>
     */
    submit_btn.setAttribute('id', 'buttons');
    submit_btn.classList.add('submit-button');
    submit_btn.textContent = "Submit your answers ❯";

    /**
     * create window confirm
     * if ok:
     *      submit your answer and end quiz , go review quiz page
     * else
     *      continue to answer the quiz
     */
    submit_btn.addEventListener('click', function () {
        if (confirm('Are you sure to submit your answer?')) {
            document.querySelector('.submit-button').style.display = 'none';
            reviewQuiz();
        }
    });
    apt_quiz.appendChild(submit_box);
    submit_box.appendChild(submit_btn);
}

/**
 * <div>
 *      <h2 id = "quesOrder">
 *          Question x of 10
 *      </h2>
 *      <div> id = "quesName">
 *          quizdata.questions.text
 *      <div>
 *      <div>
 *          quizdata.answers
 *      </div> 
 * <div>
 */
function quesCreate(leng, ques, quesNum) {

    let form = document.createElement('div');
    let quesOrder = document.createElement('h2');
    let quesContent = document.createElement('div');
    let ansLabel = document.createElement('div');
    form.appendChild(quesOrder);
    form.appendChild(quesContent);
    form.appendChild(ansLabel);

    quesOrder.setAttribute('id', 'quesOrder');
    quesOrder.textContent = `Question ${quesNum} of ${leng}`;

    quesContent.setAttribute('id', 'quesContent');
    quesContent.textContent = `${ques.text}`;


    // assign 4 answers into ansLabel
    for (let i = 0; i < ques.answers.length; i -= -1) {
        ansLabel.appendChild(AnsCreate(ques, i));
    }
    return form;
}

/**
 * <div class = "ansForm" >
 *      <input type = "radio" id = "quizdata.answers._id" name = "answerOrderNumer" value = "x" >
 *      <label for="answerOrderNumer">
 *          <span class = "answer">
 *              quizdata.answers[x]
 *          </span>
 *      </label>
 * </div>
 * 
 */
function AnsCreate(ques, x) {

    quizAnswer[ques._id] = null;

    //answer label form
    let form = document.createElement('div');
    let answer_label = document.createElement('label');
    let answer_input = document.createElement('input');
    let answer_span = document.createElement('span');
    answer_label.appendChild(answer_span);
    form.appendChild(answer_input);
    form.appendChild(answer_label);

    form.classList.add('ansForm');
    answer_span.classList.add('answer');
    answer_span.textContent = ques.answers[x];
    answer_label.htmlFor = `ans${answerOrderNumer}`;

    answer_input.setAttribute('type', 'radio');
    answer_input.setAttribute('id', `ans${answerOrderNumer}`);
    answer_input.setAttribute('name', `${ques._id}`);
    answer_input.setAttribute('value', `${x}`);

    answer_input.addEventListener('click', function (event) {
        quizAnswer[event.target.name] = event.target.value;
    });
    answerOrderNumer -= - 1;
    return form;
}


async function reviewQuiz() {

    const quizdata = await getQuizdata(id, quizAnswer);

    // make result form
    let review_quiz = document.getElementById('review-quiz');

    //disable all answer
    for (let i = 0; i < answerOrderNumer; i -= -1) {
        document.getElementById(`ans${i}`).disabled = true;
    }

    //highlight correct and wrong answers
    for (let i in quizAnswer) {
        highlightAns(i, quizdata.correctAnswers);
    }
    //create result view
    review_quiz.appendChild(result(quizdata.score, quizdata.scoreText));

}

function highlightAns(id, correctAns) {

    /**
     * <div class = "correct"> Correct Answer </div>
     */
    let correct = document.createElement('div');
    correct.textContent = "Correct Answer";
    correct.classList.add('correct');

    /**
     * <div class = "wrong"> Wrong Answer </div>
     */
    let wrong = document.createElement('div');
    wrong.textContent = "Wrong Answer";
    wrong.classList.add('wrong');

    let studentAnswer = document.querySelectorAll(`input[name='${id}']`)[quizAnswer[id]];
    let DefaultcorrectAnswer = document.querySelectorAll(`input[name='${id}']`)[correctAns[id]];

    /**
     * set all correct answer with background '#ddd' and set correct label 
     * if student choose correct answer
     *      reset background to '#d4edda'
     * else
     *      reset background to '#f8d7da'
     *      set wrong label
     */
    DefaultcorrectAnswer.nextElementSibling.appendChild(correct);
    DefaultcorrectAnswer.nextElementSibling.style.backgroundColor = '#ddd';
    if (quizAnswer[id] != null) {
        if (quizAnswer[id] == correctAns[id]) {
            studentAnswer.nextElementSibling.style.backgroundColor = '#d4edda';
        } else {
            studentAnswer.nextElementSibling.style.backgroundColor = '#f8d7da';
            studentAnswer.nextElementSibling.appendChild(wrong);
        }
    }
}

/**
 * <div class = 'resultBox'>
 *      <p class = 'result-opening'>Result:</p>
 *      <p>`${score}/10`</p>
 *      <p>`${score*10}%`</p>
 *      <p>cheerText</p>
 *      <button id = 'buttons' class = 'try-again-button'>Try again</button>
 * </div>
 */
function result(score, cheerText) {

    //result box
    let resultBox = document.createElement('div');
    resultBox.classList.add('resultBox');

    //result opening
    let opening = document.createElement('p');
    opening.classList.add('result-opening');
    opening.textContent = 'Result:';

    //quiz score
    let quizScore = document.createElement('p');
    quizScore.textContent = `${score}/10`;
    quizScore.style.fontSize = '24px';

    //score percentage
    let scorePercentage = document.createElement('p');
    scorePercentage.textContent = `${score * 10}%`;
    scorePercentage.style.fontWeight = 'bold';

    //cheer text
    let chText = document.createElement('p');
    chText.textContent = cheerText;

    // Try-again button
    let reTry = document.createElement('button');
    reTry.setAttribute('id', 'buttons');
    reTry.classList.add('try-again-button');
    reTry.textContent = 'Try again';
    reTry.addEventListener('click', function () {
        location.reload();
        document.getElementById('header').scrollIntoView();
    });

    resultBox.appendChild(opening);
    resultBox.appendChild(quizScore);
    resultBox.appendChild(scorePercentage);
    resultBox.appendChild(chText);
    resultBox.appendChild(reTry);

    return resultBox;
}


