// class Achievement {
//   constructor({ name, description, isSecret, points, action }) {
//     this.name = name;
//     this.description = description;
//     this.isSecret = isSecret;
//     this.points = points;
//     this.action = action;
//     // this.image = require("../assets/icons/expo.png");
//   }
// }

// class ScoreAchievements extends Achievement {
//   constructor({ score, description, ...props }) {
//     super({
//       description: description || `Get over ${score} points in a single round`,
//       ...props,
//     });
//     this.score = score;
//     this.action = ({ score }) => score >= this.points;
//   }
// }

export default {
  "score-50": {
    name: "Scored 50 points in a single game",
  },
  "score-100": {
    name: "Scored 100 points in a single game",
  },
  "total-score-500": {
    name: "Scored a total of 500 points",
  },
  "total-score-1000": {
    name: "Scored a total of 1,000 points",
  },
  "total-score-5000": { name: "Scored a total of 5,000 points" },
  "total-score-10000": { name: "Scored a total of 10,000 points" },
  "rounds-10": { name: "Played 10 rounds" },
  "rounds-50": { name: "Played 50 rounds" },
  "rounds-100": { name: "Played 100 rounds" },
  "rounds-500": { name: "Played 500 rounds" },
  "rounds-1000": { name: "Played 1,000 rounds" },
};

const Achievements = [
  // new ScoreAchievements({
  //   name: "The student becomes the master",
  //   score: 33,
  //   description: "Pass Evan's best score 33",
  //   points: 25,
  // }),
  // new ScoreAchievements({ name: "Florence St.", score: 420, points: 25 }),
  // new ScoreAchievements({
  //   name: "A-CHEEVE-Ment unlocked!",
  //   score: 650,
  //   points: 25,
  // }),
  // new Achievement({
  //   name: "Join the club",
  //   description: "Lose 5 times in a row",
  //   points: 25,
  //   isSecret: true,
  // }),
  // new Achievement({
  //   name: "Matrix",
  //   description: "Get 25 perfect points on the first rotation",
  //   points: 25,
  // }),
  // new Achievement({
  //   name: "Well...thanks I guess",
  //   description: "play for 20 hours",
  //   points: 25,
  //   isSecret: true,
  // }),
  // new Achievement({
  //   name: "Poland time",
  //   description: "Play 5 rounds at 3am",
  //   points: 25,
  //   isSecret: true,
  // }),
  // new Achievement({
  //   name: "I 💙 Expo.",
  //   description: "Play pillar valley in the Expo Client",
  //   points: 25,
  // }),
  // new Achievement({
  //   name: "Quake 4 kroon",
  //   description: "Reach the top of the leaderboard",
  //   points: 25,
  // }),
  // new Achievement({
  //   name: "QA fann",
  //   description: "press every button in the app",
  //   points: 25,
  //   isSecret: true,
  // }),
];
// export default Achievements;
