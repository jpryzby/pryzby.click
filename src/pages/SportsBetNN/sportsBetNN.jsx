import './sportsBetNNStyle.css'
import NeuralNetworkViz from "./NNVizualizer";
import TableOfContents from '../../components/tableOfContents/tableOfContents.jsx';
import { useMemo } from 'react';

import GamePredictor from './GamePredictor';
import NetworkTrainer from './NetworkTrainer';


import sampleGameData from './assets/sample_game_data.csv?raw';

// import csvText from './assets/Training Data 2000-2023.csv?raw'
// import csvText from './assets/Training Data 2015-2023.csv?raw'
// import csvText from './assets/Training Data 2000-2022.csv?raw'
// import csvText from './assets/Training Data 2015-2022.csv?raw'
// import csvText from './assets/games_2000_to_2022 (2).csv?raw'

// import testCsvText from './assets/Testing Data 1999.csv?raw'
// import testCsvText from './assets/Testing Data 2014.csv?raw'
// import testCsvText from './assets/Testing Data 2023.csv?raw'
import testCsvText from './assets/games_2023 (2).csv?raw'

// import networkFile from './assets/network.json'  //56.0 69 40
// import networkFile from './assets/network(20 balanced and raw sets).json' //59.1 81 32
// import networkFile from './assets/network(20 balanced sets).json'                        //57/8 88 19
// import networkFile from './assets/network (20 balanced and raw sets he init).json'       //56.0 79 27
import networkFile from './assets/network (1).json'                                      //60.7 84 30
// import networkFile from './assets/network (1).json'                                      
// import networkFile from './assets/network (1).json'                                      //60.7 84 30



import { useState } from "react"
import scalerStats from './assets/scaler_stats (4).json'
// import networkData from './assets/network.json'

import Nav from '../../components/nav/nav.jsx';
import Footer from '../../components/footer/footer.jsx';


  // Outside the component, at the top of the file
const parseFirstGame = () => {
  const [headerLine, ...rows] = sampleGameData.trim().split('\n');
  const headers = headerLine.split(',').map(h => h.trim());
  const values = rows[0].replace(/\r/g, '').split(',');
  return Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim()]));
};

const firstGame = parseFirstGame();





    const TEAMS = [
        'Atlanta Hawks', 'Boston Celtics', 'Brooklyn Nets', 'Charlotte Hornets',
        'Chicago Bulls', 'Cleveland Cavaliers', 'Dallas Mavericks', 'Denver Nuggets',
        'Detroit Pistons', 'Golden State Warriors', 'Houston Rockets', 'Indiana Pacers',
        'Los Angeles Clippers', 'Los Angeles Lakers', 'Memphis Grizzlies', 'Miami Heat',
        'Milwaukee Bucks', 'Minnesota Timberwolves', 'New Orleans Pelicans', 'New York Knicks',
        'Oklahoma City Thunder', 'Orlando Magic', 'Philadelphia 76ers', 'Phoenix Suns',
        'Portland Trail Blazers', 'Sacramento Kings', 'San Antonio Spurs', 'Toronto Raptors',
        'Utah Jazz', 'Washington Wizards'
    ]

    const AWAY_STATS = [
        '10 Game Rolling Average Away Team Field Goals Made',
        '10 Game Rolling Average Away Team Field Goals Attempted',
        '10 Game Rolling Average Away Team Field Goal Percentage',
        '10 Game Rolling Average Away Team 3-Point Field Goals Made',
        '10 Game Rolling Average Away Team 3-Point Field Goals Attempted',
        '10 Game Rolling Average Away Team 3-Point Percentage',
        '10 Game Rolling Average Away Team Free Throws Made',
        '10 Game Rolling Average Away Team Free Throws Attempted',
        '10 Game Rolling Average Away Team Free Throw Percentage',
        '10 Game Rolling Average Away Team Offensive Rebounds',
        '10 Game Rolling Average Away Team Defensive Rebounds',
        '10 Game Rolling Average Away Team Total Rebounds',
        '10 Game Rolling Average Away Team Assists',
        '10 Game Rolling Average Away Team Steals',
        '10 Game Rolling Average Away Team Blocks',
        '10 Game Rolling Average Away Team Turnovers',
        '10 Game Rolling Average Away Team Personal Fouls',
        '10 Game Rolling Average Away Team Points',
    ]

    const HOME_STATS = [
        '10 Game Rolling Average Home Team field goals',
        '10 Game Rolling Average Home Team Field Goals Attempted',
        '10 Game Rolling Average Home Team Field Goal Percentage',
        '10 Game Rolling Average Home Team 3-Point Field Goals Made',
        '10 Game Rolling Average Home Team 3-Point Field Goals Attempted',
        '10 Game Rolling Average Home Team 3-Point Percentage',
        '10 Game Rolling Average Home Team Free Throws Made',
        '10 Game Rolling Average Home Team Free Throws Attempted',
        '10 Game Rolling Average Home Team Free Throw Percentage',
        '10 Game Rolling Average Home Team Offensive Rebounds',
        '10 Game Rolling Average Home Team Defensive Rebounds',
        '10 Game Rolling Average Home Team Total Rebounds',
        '10 Game Rolling Average Home Team Assists',
        '10 Game Rolling Average Home Team Steals',
        '10 Game Rolling Average Home Team Blocks',
        '10 Game Rolling Average Home Team Turnovers',
        '10 Game Rolling Average Home Team Personal Fouls',
        '10 Game Rolling Average Home Team Points',
    ]












export default function SportsBetNN(){

  const [homeTeam, setHomeTeam] = useState(TEAMS[0])
  const [awayTeam, setAwayTeam] = useState(TEAMS[1])
  const [stats, setStats] = useState({})
  const [result, setResult] = useState(null)
  const [selectedGame, setSelectedGame] = useState('');


  const confidence = result !== null ? Math.abs(result - 0.5) * 200 : null
  const isHomeWin = result !== null && result >= 0.5
  const winner = result !== null ? (result >= 0.5 ? homeTeam : awayTeam) : null

  
  const network = networkFile;


  // const trainingData = loadCSV(csvText)
  const testData = loadCSV(testCsvText)
  // const testData = null;

  const allStats = [...AWAY_STATS, ...HOME_STATS, 'h2h_win_ratio_last10']

  const decodeTeams = (game) => ({
    home: Object.keys(game).find(k => k.startsWith('home_') && game[k] === '1')?.replace('home_', '') ?? 'Unknown',
    away: Object.keys(game).find(k => k.startsWith('away_') && game[k] === '1')?.replace('away_', '') ?? 'Unknown',
  });

  const sampleGames = useMemo(() => {
    const [headerLine, ...rows] = sampleGameData.trim().split('\n');
    const headers = headerLine.split(',').map(h => h.trim());
    return rows.map(row => {
      const values = row.replace(/\r/g, '').split(','); // ← strip \r
      return Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim()]));
    });
  }, []);

    function loadCSV(csvText) {
        const lines = csvText.trim().split('\n')
        const data = []

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',')
            const expected = parseFloat(cols[0])
            const inputs = cols.slice(1, 102).map(parseFloat)

            if (inputs.length === 101 && !inputs.some(isNaN) && !isNaN(expected)) {
                data.push({ inputs, expected })
            }
        }
        return data
    }

      

    



    return(
            <div className='pageContainer'>
                
                <Nav />
    
                <div className='projectTitle'>
                    <h1>NBA Neural Network</h1>
                </div>
                <div>
                  <TableOfContents />
                </div>
                <div>
                  <NeuralNetworkViz network={network} />
                </div>
                <div id='project-body' className='projectBody'>

                  <GamePredictor />

                </div>

                <NetworkTrainer />


                <div id="project-description" className='projectDescription'>
                    <h2>Project Description</h2>
                    <div className='projectParagraph'>
                        <p>This program is a feedforward neural network, trained on NBA game data ranging from 2000 to 2023. Its purpose is to take in gameday data and predict the winner of a game. It predicts the correct winner roughly 62% of the time.</p>
                        <p>The network makes its predictions by looking at each teams recent game history. It takes in stats like the average number of fouls, the average free-throw hit rate, and the average number of successful blocks, and much more, from their previous 10 games. It also looks at the recent win/loss history from the last few times these teams played each other. This data then feeds through a neural network, outputting a single number value between 0 and 1. if that value is above 0.5, we interpret that as a home team win. If the number is below 0.5, we interpret that as an away team win.</p>
                        <p>What is the structure of the neural network? The network is composed of several "layers" of neurons, connected by weighted connections. Each neuron is simply a value between -1 and 1, representing how "activated" the neuron is. So if the home-team-free-throw neuron has a value of 0.9, that means that the home team has been very good with free throws recently. Each layer is an array of neurons, where each neuron in a previous layer feeds into EVERY neuron of the next layer. Each connection has a "weight" which determines how important a signal is. So if a neuron has a high activation, but a very low weight, the result is that the activation will be largely ignored. Vice Versa, a highly activated neuron with a high weight, will have a large impact on the output.</p>
                        <p>Why the layered architecture? The hope is that each layer picks up on smaller abstractions. So for example, the first layer may pick up on correlations between number-of-successful-blocks, a low number-of-fouls, and a low successful-free-throw from the opposite team, and interpret that as playing a good defensive game. The next layer may pick up on a good defensive game, and the opposing teams weak offensive game as good odds of a home team win. The last layer may see that the last few times these teams played, it didn't go well for the home team, so it will temper its expectations. In reality, these layers are much more abstract, and less human understandable, but the theory is that a deeper network can pick up on more abstract patterns than a shallower network. </p>
                        <p>How does the network "learn"? The network is trained on game data ranging from 2000 to 2023. Initially, the network is initialized with random values. The network is then fed a batch of games, and asked to make predictions. It will keep track of how wrong its predictions are, and adjust a corresponding amount. So if the network is mostly accurate, it will make a small adjustment, and if it is very wrong it will make a larger adjustment. </p>
                        <p>The network will start at the output and increase or decrease its weights and biases depending on its success rate. It then goes back to the previous layer and makes the same adjustments. How does it know how much to tweak each previous input? If the input was highly activated, then it highly contributed to the incorrect guess, and must be sharply adjusted. If the neuron was weakly activated, then it did NOT contribute much to the incorrect guess, so it does not need to be as sharply adjusted. </p>
                    </div>
                </div>
                <div id="how-to-use" className='projectInstructions'>
                    <h2>How To Use</h2>
                    <div className='projectParagraph'>
                        <p>use "Load a sample game" to pick from 100 example games with real world data.</p>
                        <p>For a custome prediciton, select which teams are playing home and away.</p>
                        <p>For each stat input, put in the AVERAGE value from the last 10 games this team has played. </p>
                    </div>
                </div>
                
                <div id="improvements" className="projectImprovements">
                  <h2>What can still be improved?</h2>
                  <div className='projectParagraph'>
                    <p>1) Current model does not use any player or injury data. A game with a fully injured team and a fully healthy team are evaluated evenly.</p>
                    <p>2) Data set stops at 2023, so as teams change over time, the model will get less accurate.</p>
                    <p>3) Running this network on a live game takes a LOT of research. It would be nice to include some web crawlers to autofill some statistics.</p>
                    <p><s>4) For demoing, it would be nice if we could auto fill in game data from 10 or so games, just so the user can test the bot without 30 minutes of research.</s></p>                  </div>
                </div>
            </div>
        )
}   