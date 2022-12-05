const express = require('express')
const app = express()
const {DAO} = require("./dao");
const dao = new DAO();

app.get('/question', (req, res) => {
    let questionTag = req.query.questionTag;
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
            error: e
        }))
    }
})

app.get('/questions', (req, res) => {
    let mediaText = req.query.media
    let human = req.query.human
    try {
        if (mediaText) {
            if(human) {
                dao.getQuestionsForMediaAndHumanTag(mediaText, human).then(questions => {
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
                dao.getQuestionsForMedia(mediaText).then(questions => {
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
            dao.getAllQuestions().then(questions => {
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
            error: e
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

const listener = app.listen(process.env.PORT, () => {
    console.log(`Example app listening on port ${listener.address().port}`)
})