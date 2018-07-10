import Assets from '../Assets';

class Achievement {
  constructor({ name, description, isSecret, points, action }) {
    this.name = name;
    this.description = description;
    this.isSecret = isSecret;
    this.points = points;
    this.action = action;
    this.image = Assets.icons['expo.png'];
  }
}

class ScoreAchievements extends Achievement {
  constructor({ score, description, ...props }) {
    super({
      description: description || `Get over ${score} points in a single round`,
      ...props,
    });
    this.score = score;
    this.action = ({ score }) => {
      return score >= points;
    };
  }
}

const Achievements = [
  new ScoreAchievements({
    name: 'The student becomes the master',
    score: 33,
    description: "Pass Evan's best score 33",
    points: 25,
  }),
  new ScoreAchievements({ name: 'Florence St.', score: 420, points: 25 }),
  new ScoreAchievements({
    name: 'A-CHEEVE-Ment unlocked!',
    score: 650,
    points: 25,
  }),

  new Achievement({
    name: 'Join the club',
    description: 'Lose 5 times in a row',
    points: 25,
    isSecret: true,
  }),
  new Achievement({
    name: 'Matrix',
    description: 'Get 25 perfect points on the first rotation',
    points: 25,
  }),
  new Achievement({
    name: 'Well...thanks I guess',
    description: 'play for 20 hours',
    points: 25,
    isSecret: true,
  }),
  new Achievement({
    name: 'Poland time',
    description: 'Play 5 rounds at 3am',
    points: 25,
    isSecret: true,
  }),
  new Achievement({
    name: 'I 💙 Expo.',
    description: 'Play pillar valley in the Expo Client',
    points: 25,
  }),
  new Achievement({
    name: 'Quake 4 kroon',
    description: 'Reach the top of the leaderboard',
    points: 25,
  }),
  new Achievement({
    name: 'QA fann',
    description: 'press every button in the app',
    points: 25,
    isSecret: true,
  }),
  new Achievement({
    name: 'The Shut Up',
    description: 'listen to all the songs all the way through',
    points: 25,
    isSecret: true,
  }),
  new Achievement({
    name: 'Ide, James Ide',
    description: 'score exactly 007 points',
    points: 25,
    isSecret: true,
  }),
];
export default Achievements;
