import express, { Request, Response } from 'express';
import getAnswer from "./utils/getAnswer"
import cors from "cors";
import bodyParser from 'body-parser';
import fs from 'fs';

interface TypedRequestBody<T> extends Express.Request {
    body: T
};

interface ResponseBody {
    valid: boolean,
    result?: Array<string>,
    answer?: string,
    description?: string
}

var forbiddenResponse: string;
fs.readFile('resources/forbiddenResponse.txt', 'utf8', function (err, data) {
    if (err) throw err;
    forbiddenResponse = data;
});

const app: express.Application = express();

app.use(cors())
app.use(bodyParser.json())

var allWords: Array<string>;
fs.readFile("resources/words.json", "utf-8", function (err, data) {
    if (err) throw err;
    allWords = JSON.parse(data)
})

interface Answer {
    word: string,
    description: string
}
var yorkAnswers: Array<Answer> = [];
fs.readFile("resources/yorkWords.json", "utf-8", function (err, data) {
    if (err) throw err;
    yorkAnswers = JSON.parse(data)
})
var yorkWords: Array<string> = yorkAnswers.map(answer => answer.word)


const checkWin = function (result: Array<string>): Boolean {
    return result.every((colour) => colour == "green")
}


app.post('/guess', (req: TypedRequestBody<{ guess: string, guessNumber: number, token?: "string" }>, res: express.Response) => {
    const fullAnswer: Answer = getAnswer([... yorkAnswers])
    
    
    if (typeof req.body.guess === 'string' && typeof req.body.guessNumber == 'number') {
        const guess: Array<string> = req.body.guess.toLocaleLowerCase().split("");
        const guessNumber: number = req.body.guessNumber;

        if (!allWords.includes(guess.join("")) && !yorkWords.includes(guess.join(""))) {
            return res.status(200).send({valid: false})
        }

        const answer: string = fullAnswer.word;
        const result: Array<string> = ["", "", "", "", ""];

        // process green
        var guessAnswer: Array<string> = answer.split("");
        var greenPositions: Array<number> = []
        for (let i = 0; i < guess.length; i++) {
            let guessLetter: string = guess[i];
            let answerLetter: string = answer[i];

            if (guessLetter === answerLetter) {
                result[i] = "green";
                greenPositions.push(i);
            }
        }
        var count = 0
        for (let pos of greenPositions) {
            guessAnswer.splice(pos-count,1); // subtract from pos because removing decreases size of list
            count += 1
        }

        // process yellow
        for (let i = 0; i < guess.length; i++) {
            if (!greenPositions.includes(i)) {
                let guessLetter: string = guess[i];
                if (guessAnswer.includes(guessLetter)) {
                    result[i] = "yellow";
                    guessAnswer.splice(guessAnswer.indexOf(guessLetter), 1)
                }
            }
        }

        // set the remaining to grey
        for (let i = 0; i < guess.length; i++) {
            if (result[i] === "") {
                result[i] = "grey"
            }
        }

        const responseBody: ResponseBody= {
            valid: true,
            result: result
        };

        if (guessNumber == 5 && !checkWin(result)) {
            responseBody.answer = answer;
            responseBody.description = fullAnswer.description
        };
        if (checkWin(result)) {
            responseBody.description = fullAnswer.description
        }

        res.status(200).send(responseBody)
    } else {
        res.status(403).send(forbiddenResponse);
    };
});

app.get("*", (req, res) => {
    res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
})

const port = process.env.PORT || 4000

app.listen(port, () => {
    console.log(`Running on port: ${port}`);
});