//npm install moment simple-git random

import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";
import random from "random";
import readline from "readline";

const path = "./data.json";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

const markCommit = (date) => {
  const data = {
    date: date,
  };

  jsonfile.writeFile(path, data, () => {
    simpleGit().add([path]).commit(date, { "--date": date }).push();
  });
};

const makeCommits = (n, startDate, endDate) => {
  if (n === 0) return simpleGit().push();
  
  const start = moment(startDate);
  const end = moment(endDate);
  const diffDays = end.diff(start, 'days');
  const randomDay = random.int(0, diffDays);

  const date = start.clone().add(randomDay, 'days').format();

  const data = {
    date: date,
  };
  console.log(date);
  jsonfile.writeFile(path, data, () => {
    simpleGit().add([path]).commit(date, { "--date": date }, makeCommits.bind(this, --n, startDate, endDate));
  });
};

const main = async () => {
  const startMonth = await askQuestion("Start month (1-12): ");
  const startYear = await askQuestion("Start year (YYYY): ");
  const endMonth = await askQuestion("End month (1-12): ");
  const endYear = await askQuestion("End year (YYYY): ");
  const numberOfCommits = await askQuestion("Number of commits: ");

  const startDate = `${startYear}-${startMonth}-01`;
  const endDate = `${endYear}-${endMonth}-01`;

  makeCommits(parseInt(numberOfCommits), startDate, endDate);
  rl.close();
};

main();
