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
fs.readFile('forbiddenResponse.txt', 'utf8', function (err, data) {
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
        const guess: string = req.body.guess;
        const guessNumber: number = req.body.guessNumber;

        const result: Array<string> = [];

        for (let i = 0; i < guess.length; i++) {
            let guessLetter: string = guess[i];
            let answerLetter: string = answer[i];

            if (guessLetter === answerLetter) {
                result.push("green");
            } else if (answer.includes(guessLetter)) {
                result.push("yellow");
            } else {
                result.push("grey");
            };
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