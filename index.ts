import express, { Request, Response } from 'express';
import cors from "cors";
import bodyParser from 'body-parser';
import fs from 'fs';

interface TypedRequestBody<T> extends Express.Request {
    body: T
};

interface ResponseBody {
    result: Array<string>,
    answer?: string
}

var forbiddenResponse: string;
fs.readFile('resources/forbiddenResponse.txt', 'utf8', function (err, data) {
    if (err) throw err;
    forbiddenResponse = data
});

const app: express.Application = express();

app.use(cors())
app.use(bodyParser.json())

const port: number = 6969

const answer: string = "goose"

app.post('/guess', (req: TypedRequestBody<{ guess: string, guessNumber: number, token?: "string" }>, res: express.Response) => {
    if (req.body.guess && req.body.guessNumber) {
        const guess: Array<string> = req.body.guess.split("");
        const guessNumber: number = req.body.guessNumber;

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
            guessAnswer.splice(pos-count,1); // subtract from pos couse removing decreases size of list
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
            result: result
        };

        if (guessNumber == 6 && (result.includes("yellow") || result.includes("grey"))) {
            responseBody.answer = answer;
        };

        res.status(200).send(responseBody)
    } else {
        res.status(403).send(forbiddenResponse);
    };
});

app.listen(port, () => {
    console.log(`Running on port: ${port}`);
});