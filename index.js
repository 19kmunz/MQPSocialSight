const express = require('express')
const app = express()
const {DAO} = require("./dao");
const dao = new DAO();

app.get('/question', (req, res) => {
    let questionTag = req.query.questionTag;
    console.log("Question query: " + JSON.stringify(req.query))
    try {
        dao.getQuestion(questionTag).then( question => {
            if (question) {
                ok(res, JSON.stringify({
                    question: question
                }))
            } else {
                err(res, JSON.stringify({
                    error: "No question found for tag '" + questionTag + "'"
                }))
            }
        })
    } catch (e) {
        err(res, JSON.stringify({
            error: e.toString()
        }))
    }
})

app.get('/questions', (req, res) => {
    let mediaText = req.query.media
    let human = req.query.human
    console.log("QuestionS query: " + JSON.stringify(req.query))
    try {
        if (mediaText) {
            if(human) {
                dao.getQuestionsForMediaAndHumanTag(mediaText, human).toArray().then(questions => {
                    if(questions) {
                        ok(res, JSON.stringify({
                            questions: questions
                        }))
                    } else {
                        err(res, JSON.stringify({
                            error: "No questions found for media '" + mediaText + "' and human '" + human + "'"
                        }))
                    }
                })
            } else {
                dao.getQuestionsForMedia(mediaText).toArray().then(questions => {
                    if (questions) {
                        ok(res, JSON.stringify({
                            questions: questions
                        }))
                    } else {
                        err(res, JSON.stringify({
                            error: "No questions found for media: '" + mediaText + "'"
                        }))
                    }
                })
            }
        } else {
            dao.getAllQuestions().toArray().then( questions => {
                if(questions) {
                    ok(res, JSON.stringify({
                        questions: questions
                    }))
                } else {
                    err(res, JSON.stringify({
                        error: "No questions found"
                    }))
                }
            })
        }
    } catch (e) {
        err(res, JSON.stringify({
            error: e.toString()
        }))
    }
})

app.get('/questionForAllMedia', (req, res) => {
    let questionTag = req.query.questionTag;
    console.log("Question  for all mediaquery: " + JSON.stringify(req.query))
    try {
        dao.getQuestionForAllMedia(questionTag).toArray().then( questions => {
            if (questions) {
                ok(res, JSON.stringify({
                    questions: questions
                }))
            } else {
                err(res, JSON.stringify({
                    error: "No questions found for tag '" + questionTag + "'"
                }))
            }
        })
    } catch (e) {
        err(res, JSON.stringify({
            error: e.toString()
        }))
    }
})

app.get('/questionsForAllMedia', (req, res) => {
    let human = req.query.human;
    console.log("Question  for all mediaquery: " + JSON.stringify(req.query))
    try {
        dao.getQuestionsForAllMediaAndHumanTag(human).toArray().then( questions => {
            if (questions) {
                ok(res, JSON.stringify({
                    questions: questions
                }))
            } else {
                err(res, JSON.stringify({
                    error: "No questions found for tag '" + questionTag + "'"
                }))
            }
        })
    } catch (e) {
        err(res, JSON.stringify({
            error: e.toString()
        }))
    }
})

function ok(res, body) {
    res.writeHead(200, "OK", {'Content-Type': 'text/plain'})
    res.end(body)
}

function err(res, body) {
    res.writeHead(400, "ERR", {'Content-Type': 'text/plain'})
    res.end(body)
}

app.use(express.static("./public/"));

// TODO: change to process.env.PORT
const listener = app.listen(3000, () => {
    console.log(`Example app listening on port ${listener.address().port}`)
})