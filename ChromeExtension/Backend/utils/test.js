import { getLeetCodeProblemInfo } from "./leetcodeGraphQLQueries.js";

async function main(problem) {
    const problemInfo = await getLeetCodeProblemInfo(problem);
    console.log(problemInfo[0]);
    console.log(problemInfo[1]);
    console.log(problemInfo[2]);
}

main("rank-scores");