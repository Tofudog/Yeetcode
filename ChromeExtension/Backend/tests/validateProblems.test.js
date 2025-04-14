const { expect, test } = require('@jest/globals');
import { getLeetCodeProblemInfo } from '../utils/leetcodeGraphQLQueries';
import data from './../../Frontend/assets/data/problems.json' with { type: 'json' };

for (const problem of data.easy) {
    test(`Make sure ${problem} is easy`, async () => {
        const problemInfo = await getLeetCodeProblemInfo(problem);
        const difficulty = problemInfo[0];
        expect(difficulty).toBe("Easy");
    });
    test(`Make sure ${problem} is not subscription-based`, async () => {
        const problemInfo = await getLeetCodeProblemInfo(problem);
        const paid = problemInfo[1];
        expect(paid).toBe(false);
    });
    test(`Make sure ${problem} is algorithmic`, async () => {
        const problemInfo = await getLeetCodeProblemInfo(problem);
        const category = problemInfo[2];
        expect(category).toBe("Algorithms");
    });
}

for (const problem of data.medium) {
    test(`Make sure ${problem} is medium`, async () => {
        const problemInfo = await getLeetCodeProblemInfo(problem);
        const difficulty = problemInfo[0];
        expect(difficulty).toBe("Medium");
    });
    test(`Make sure ${problem} is not subscription-based`, async () => {
        const problemInfo = await getLeetCodeProblemInfo(problem);
        const paid = problemInfo[1];
        expect(paid).toBe(false);
    });
    test(`Make sure ${problem} is algorithmic`, async () => {
        const problemInfo = await getLeetCodeProblemInfo(problem);
        const category = problemInfo[2];
        expect(category).toBe("Algorithms");
    });
}

for (const problem of data.hard) {
    test(`Make sure ${problem} is hard`, async () => {
        const problemInfo = await getLeetCodeProblemInfo(problem);
        const difficulty = problemInfo[0];
        expect(difficulty).toBe("Hard");
    });
    test(`Make sure ${problem} is not subscription-based`, async () => {
        const problemInfo = await getLeetCodeProblemInfo(problem);
        const paid = problemInfo[1];
        expect(paid).toBe(false);
    });
    test(`Make sure ${problem} is algorithmic`, async () => {
        const problemInfo = await getLeetCodeProblemInfo(problem);
        const category = problemInfo[2];
        expect(category).toBe("Algorithms");
    });
}
