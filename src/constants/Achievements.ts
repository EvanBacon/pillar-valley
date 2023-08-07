export type AchievementType = {
  name: string;
};

export default {
  "score-20": {
    name: "Scored 20 points in a single game",
  },
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
} as Record<string, AchievementType>;
