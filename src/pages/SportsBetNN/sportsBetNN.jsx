import './sportsBetNNStyle.css'
import NeuralNetworkViz from "./NNVizualizer";

// import csvText from './assets/Training Data 2000-2023.csv?raw'
// import csvText from './assets/Training Data 2015-2023.csv?raw'
import csvText from './assets/Training Data 2000-2022.csv?raw'
// import csvText from './assets/Training Data 2015-2022.csv?raw'

// import testCsvText from './assets/Testing Data 1999.csv?raw'
// import testCsvText from './assets/Testing Data 2014.csv?raw'
import testCsvText from './assets/Testing Data 2023.csv?raw'

import networkFile from './assets/network.json'
// import networkFile from './assets/network(20 balanced and raw sets).json'
// import networkFile from './assets/network(20 balanced sets).json'
// import networkFile from './assets/network (20 balanced and raw sets he init).json'


import { useState } from "react"
import scalerStats from './assets/scaler_stats.json'
import networkData from './assets/network.json'

import Nav from '../../components/nav/nav.jsx';
import Footer from '../../components/footer/footer.jsx';





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


    
    function shortLabel(col) {
      return col
        .replace('10 Game Rolling Average Away Team ', '')
        .replace('10 Game Rolling Average Home Team ', '')
        .replace('10 Game Rolling Average ', '')
    }
    
    function normalize(col, value) {
      const mean = scalerStats.mean[col]
      const std = scalerStats.std[col]
      if (mean === undefined || std === undefined) return parseFloat(value) || 0
      return (parseFloat(value) - mean) / std
    }
    
    function buildInputVector(homeTeam, awayTeam, stats) {
      // Build the input vector in the same column order as training data
      // Order: rolling stats (away then home), h2h, home_* one-hots, away_* one-hots
      const inputs = []
    
      // Rolling averages (normalized)
      for (const col of AWAY_STATS) {
        inputs.push(normalize(col, stats[col] ?? 0))
      }
      for (const col of HOME_STATS) {
        inputs.push(normalize(col, stats[col] ?? 0))
      }
    
      // h2h_win_ratio_last10 (not normalized, already 0-1)
      inputs.push(parseFloat(stats['h2h_win_ratio_last10'] ?? 0.5))
    
      // home team one-hot
      for (const team of TEAMS) {
        inputs.push(team === homeTeam ? 1 : 0)
      }
    
      // away team one-hot
      for (const team of TEAMS) {
        inputs.push(team === awayTeam ? 1 : 0)
      }
    
      return inputs
    }
    

    const [homeTeam, setHomeTeam] = useState(TEAMS[0])
      const [awayTeam, setAwayTeam] = useState(TEAMS[1])
      const [stats, setStats] = useState({})
      const [result, setResult] = useState(null)
    
      const allStats = [...AWAY_STATS, ...HOME_STATS, 'h2h_win_ratio_last10']
    
      function handleStatChange(col, value) {
        setStats(prev => ({ ...prev, [col]: value }))
      }
    
      function predict() {
        const inputs = buildInputVector(homeTeam, awayTeam, stats)
        // Deep clone network so feedforward doesn't mutate the imported object permanently
        // const network = JSON.parse(JSON.stringify(networkData))
        const output = feedforward(network, inputs)
        setResult(output)
      }
    
      const confidence = result !== null ? Math.abs(result - 0.5) * 200 : null
      const isHomeWin = result !== null && result >= 0.5
      const winner = result !== null ? (result >= 0.5 ? homeTeam : awayTeam) : null


    const trainingData = loadCSV(csvText)
    const testData = loadCSV(testCsvText)

    


    //return random number from -1 to 1
    function randomWeight() {
        return (Math.random() * 2) - 1 
    }

    function heWeight(fanIn) {
    // Box-Muller transform — converts two uniform random numbers into
    // a standard normal distribution (bell curve centered at 0)
    const u1 = Math.random();
    const u2 = Math.random();
    const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    // Scale by He factor
    return gaussian * Math.sqrt(2 / fanIn);
}

    //Create 2d array with each slot containing a random weight
    function makeMatrix(rows, cols) {
        return Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => heWeight(cols))
        )
    }

    // return array of {size} random weights
    function makeBiases(size) {
        return Array.from({ length: size }, () => randomWeight())
    }


    // Neuron arrays (one per layer)
    ////starting layer (30 for each home team, 30 for each away time, 20-ish for each input data)
    ////mid layer 1 (64 cuz reasons?)
    ////mid layer 2 (32 cuz reasons?)
    ////output layer (1. greater than 0.5 is home team win. less than 0.5 is away team win)

    // Weight matrices (one per layer transition)
    // Bias arrays (one per layer)
    // const network = {
    //     layers: [
    //         new Array(101).fill(0),  // input layer
    //         new Array(128).fill(0),  // hidden layer 1
    //         new Array(64).fill(0),  // hidden layer 1
    //         new Array(32).fill(0),  // hidden layer 2
    //         new Array(1).fill(0),   // output layer
    //     ],
    //     weights: [
    //         makeMatrix(101, 128),  // input → hidden 1
    //         makeMatrix(128, 64),  // hidden 1 → hidden 2
    //         makeMatrix(64, 32),  // hidden 1 → hidden 2
    //         makeMatrix(32, 1),   // hidden 2 → output
    //     ],
    //     biases: [
    //         makeBiases(128),  // hidden layer 1
    //         makeBiases(64),  // hidden layer 1
    //         makeBiases(32),  // hidden layer 2
    //         makeBiases(1),   // output layer
    //     ]
    // }

    const network = {
        layers: [
            new Array(101).fill(0),  // input layer
            new Array(64).fill(0),  // hidden layer 1
            new Array(32).fill(0),  // hidden layer 2
            new Array(1).fill(0),   // output layer
        ],
        weights: [
            makeMatrix(101, 64),  // input → hidden 1
            makeMatrix(64, 32),  // hidden 1 → hidden 2
            makeMatrix(32, 1),   // hidden 2 → output
        ],
        biases: [
            makeBiases(64),  // hidden layer 1
            makeBiases(32),  // hidden layer 2
            makeBiases(1),   // output layer
        ]
    }

    // const network = networkFile;

    function getNetworkOutput(network) {
        return (network.layers[network.layers.length - 1][0]);
    }


    //Normalization function for output
    function sigmoid(x) {
        return 1 / (1 + Math.exp(-x))
    }

    function sigmoidDerivative(x) {
        const s = sigmoid(x)
        return s * (1 - s)
    }

    
    //normalization for hidden layers
    function relu(x) {
        return Math.max(0, x)
    }

    function reluDerivative(x) {
        return x > 0 ? 1 : 0
    }


    // Feedforward function
    function feedforward(network, inputs) {
        // load inputs into the input layer
        network.layers[0] = inputs

        // loop through each layer transition
        // for each layer, feed forward
        for (let l = 0; l < network.weights.length; l++) {
            const currentLayer = network.layers[l]
            const nextLayer = network.layers[l + 1]
            const weights = network.weights[l]
            const biases = network.biases[l]

            // calculate each neuron in the next layer
            // for each neuron in the next layer
                //get the bias for that neuron
                //sum every(input neuron * its weight)
                //add bias
                //normalize
            for (let j = 0; j < nextLayer.length; j++) {
                let raw = biases[j]
                for (let i = 0; i < currentLayer.length; i++) {
                    raw += currentLayer[i] * weights[i][j]
                }

                // normalize relu for hidden layers, sigmoid for output
                // Make this more Jaype -- todo
                const isOutputLayer = l === network.weights.length - 1
                nextLayer[j] = isOutputLayer ? sigmoid(raw) : relu(raw)
            }
        }


        //output is single neuron in the last neuron layer
        const output = getNetworkOutput(network);
        return output;
    }

    
    
    
    
    // cost function — measures how wrong the output is
    function cost(output, expected) {
        return (output - expected) ** 2
    }


    // Binary cross entropy function more popular for binary outputs. 
    // it more harshly punishes confident wrong answers
    //consider implementing into training?
    // 
    //function binaryCrossEntropy(output, expected) {
    //     return -(expected * Math.log(output) + (1 - expected) * Math.log(1 - output))
    // }


    // average cost across all games in a batch
    function batchCost(network, batch) {
        let sum = 0
        for (let game of batch) {
            const output = feedforward(network, game.inputs)
            sum += cost(output, game.expected)
        }
        return sum / batch.length
    }



    function costDerivative(output, expected) {
       return 2 * (output - expected)
    }






    function getDeltas(network, expected) {
        let weightDeltas = network.weights.map(m => m.map(row => row.map(() => 0)))
        let biasDelta = network.biases.map(arr => arr.map(() => 0))

        const output = getNetworkOutput(network)
        let errorSignal = [2 * (output - expected)]

        for (let l = network.weights.length - 1; l >= 0; l--) {
            const currentLayer = network.layers[l]
            const nextLayer = network.layers[l + 1]
            const isOutputLayer = l === network.weights.length - 1
            const newErrorSignal = new Array(currentLayer.length).fill(0)

            for (let j = 0; j < nextLayer.length; j++) {
                const actDeriv = isOutputLayer
                    ? nextLayer[j] * (1 - nextLayer[j])
                    : reluDerivative(nextLayer[j])

                const delta = errorSignal[j] * actDeriv
                biasDelta[l][j] = delta

                for (let i = 0; i < currentLayer.length; i++) {
                    weightDeltas[l][i][j] = delta * currentLayer[i]
                    newErrorSignal[i] += delta * network.weights[l][i][j]
                }
            }
            errorSignal = newErrorSignal
        }

        return [weightDeltas, biasDelta]
    }
  



    






    // Gradient descent (training function) — the actual weight update step using those calculations
    // TODO comment this
    function gradientDescent(network, weightDeltas, biasDelta, learningRate) {
        // for each layer of the network
        for (let l = 0; l < network.weights.length; l++) {
            // for each neuron in that layer
            for (let i = 0; i < network.weights[l].length; i++) {
                //adjust the weights connected to that neuron
                for (let j = 0; j < network.weights[l][i].length; j++) {
                    network.weights[l][i][j] -= learningRate * weightDeltas[l][i][j]
                }
            }
            //adjust the biases of that layer
            for (let j = 0; j < network.biases[l].length; j++) {
                network.biases[l][j] -= learningRate * biasDelta[l][j]
            }
        }
    }




    // Backpropagation — calculates how much each weight contributed to the error
    // function backpropagate(network, expected, learningRate) {

    //     // initialize weight and bias deltas mirroring weights and biases
    //     // for each 2d array of weights, create a copy array where every weight is 0
    //     // this will eventually be the delta to each weight
    //     let weightDeltas = network.weights.map(matrix =>
    //         matrix.map(row => row.map(() => 0))
    //     )

    //     // for each array of biases, create a copy array where every bias is 0
    //     // this will eventually be the delta to each bias
    //     let biasDelta = network.biases.map(arr => arr.map(() => 0))



    //     // calculate error at output neuron
    //     // costDerivative is an array instead of a scalar, because hidden layers with multiple neurons will use this
    //     const output = getNetworkOutput(network);
    //     let outputCostDerivative = [costDerivative(output, expected)]

    //     // walk backwards through each layer of weights
    //     //for each layer
    //     //
    //     for (let l = network.weights.length - 1; l >= 0; l--) {
    //         const currentLayer = network.layers[l]
    //         const nextLayer = network.layers[l + 1]
    //         const isOutputLayer = l === network.weights.length - 1

    //         //create an array of 0s for each neuron in current layer
    //         const newCostDerivative = new Array(currentLayer.length).fill(0)

    //         //for each neuron in the next layer
    //         for (let j = 0; j < nextLayer.length; j++) {
    //             const activationDerivative = isOutputLayer ? nextLayer[j] * (1 - nextLayer[j]) : reluDerivative(nextLayer[j])

    //             //Delta to the bias of this neuron in next layer 
    //             // delta is how wrong output was * how activated this neuron was. measures how much change is neccessary and in what direction
    //             const delta = outputCostDerivative[j] * activationDerivative
    //             biasDelta[l][j] = delta
                
    //             //for each neuron in current layer
    //             for (let i = 0; i < currentLayer.length; i++) {
    //                 // weightDeltas for weight of connection is delta * how activated that neuron was
    //                 weightDeltas[l][i][j] = delta * currentLayer[i]

    //                 // newCostDerivative is delta * old weight
    //                 newCostDerivative[i] += delta * network.weights[l][i][j]
    //             }



    //         }
    //         outputCostDerivative = newCostDerivative
    //     }
    //     gradientDescent(network, weightDeltas, biasDelta, learningRate)
    // }


    //adjusts training data such that there is an even spread of at home wins and away wins
    function balanceData(trainingData) {
        const homeWins = trainingData.filter(g => g.expected === 1)
        const awayWins = trainingData.filter(g => g.expected === 0)
        
        // trim home wins to match away win count
        const shuffledHome = homeWins.sort(() => Math.random() - 0.5)
        const balanced = [...shuffledHome.slice(0, awayWins.length), ...awayWins]
        return balanced.sort(() => Math.random() - 0.5)
    }



  function train(network, trainingData, learningRate, epochNumber) {
    const shuffled = [...trainingData].sort(() => Math.random() - 0.5);

    const batches = [];
    for (let i = 0; i < shuffled.length; i += 32) {
        batches.push(shuffled.slice(i, i + 32));
    }

    let epochCost = 0;
    let winRate = 0;

    for (let batch of batches) {
        let totalWeightDeltas = network.weights.map(matrix =>
            matrix.map(row => row.map(() => 0))
        );
        let totalBiasDeltas = network.biases.map(arr => arr.map(() => 0));
        let batchCost = 0;

        for (let game of batch) {
            feedforward(network, game.inputs);
            const output = getNetworkOutput(network);

            batchCost += cost(output, game.expected);
            winRate += Math.round(output) === game.expected ? 1 : 0;

            const [wDeltas, bDeltas] = getDeltas(network, game.expected);

            for (let l = 0; l < totalWeightDeltas.length; l++) {
                for (let i = 0; i < totalWeightDeltas[l].length; i++)
                    for (let j = 0; j < totalWeightDeltas[l][i].length; j++)
                        totalWeightDeltas[l][i][j] += wDeltas[l][i][j];
                for (let j = 0; j < totalBiasDeltas[l].length; j++)
                    totalBiasDeltas[l][j] += bDeltas[l][j];
            }
        } // ← game loop ends here (was the bug)

        const batchSize = batch.length;
        for (let l = 0; l < totalWeightDeltas.length; l++) {
            for (let i = 0; i < totalWeightDeltas[l].length; i++)
                for (let j = 0; j < totalWeightDeltas[l][i].length; j++)
                    totalWeightDeltas[l][i][j] /= batchSize;
            for (let j = 0; j < totalBiasDeltas[l].length; j++)
                totalBiasDeltas[l][j] /= batchSize;
        }

        gradientDescent(network, totalWeightDeltas, totalBiasDeltas, learningRate);
        epochCost += batchCost / batchSize;
    }

    winRate /= shuffled.length;
    const avgCost = epochCost / batches.length;

    console.log(`Epoch ${epochNumber} — avg cost: ${avgCost.toFixed(4)}, win rate: ${(winRate * 100).toFixed(1)}%`);
    return avgCost;
}



    function runEpochs(network, trainingData, learningRate, epochs) {
        console.log('total games:', trainingData.length)
        // console.log('input length:', trainingData[0].inputs.length)
        console.log('expected sample:', trainingData.slice(0, 5).map(g => g.expected))
        console.log('% home wins:', (trainingData.filter(g => g.expected === 1).length / trainingData.length * 100).toFixed(1) + '%')
        console.log('any NaN inputs:', trainingData.some(g => g.inputs.some(isNaN)))
        const costs = []
        for (let e = 0; e < epochs; e++) {
            const c = train(network, trainingData, learningRate, e + 1)
            costs.push(c)
        }

        // summary at the end
        console.log('--- Training complete ---')
        console.log(`Start cost: ${costs[0].toFixed(4)}`)
        console.log(`End cost:   ${costs[costs.length - 1].toFixed(4)}`)
        console.log(`Improvement: ${((costs[0] - costs[costs.length - 1]) / costs[0] * 100).toFixed(1)}%`)
    }



    function testNetwork(network, testData) {
        let correct = 0
        let truePositives = 0   // predicted home win, was home win
        let falsePositives = 0  // predicted home win, was away win
        let trueNegatives = 0   // predicted away win, was away win
        let falseNegatives = 0  // predicted away win, was home win

        for (let game of testData) {
            const output = feedforward(network, game.inputs)
            const predicted = output >= 0.5 ? 1 : 0

            if (predicted === game.expected) correct++

            if (predicted === 1 && game.expected === 1) truePositives++
            if (predicted === 1 && game.expected === 0) falsePositives++
            if (predicted === 0 && game.expected === 0) trueNegatives++
            if (predicted === 0 && game.expected === 1) falseNegatives++
        }

        const total = testData.length
        console.log('--- Test Results ---')
        console.log(`Total games tested: ${total}`)
        console.log(`Overall accuracy:   ${(correct / total * 100).toFixed(1)}%`)
        console.log(`Home win accuracy:  ${(truePositives / (truePositives + falseNegatives) * 100).toFixed(1)}%`)
        console.log(`Away win accuracy:  ${(trueNegatives / (trueNegatives + falsePositives) * 100).toFixed(1)}%`)
    }





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

        // Save to a JSON file download
    function saveNetwork(network) {
        const json = JSON.stringify(network)
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'network.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    // Load from a JSON file
    function loadNetwork(file) {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                const loaded = JSON.parse(e.target.result)
                resolve(loaded)
            }
            reader.readAsText(file)
        })
    }


    



    return(
            <div className='pageContainer'>
                
                <Nav />
    
                <div className='projectTitle'>
                    <h1>Project Title</h1>
                </div>
                <div>
                  <NeuralNetworkViz network={network} />
                </div>
                <div className='projectBody'>












<div className='gpWrapper'>
      <div className='gpInner'>

        {/* Header */}
        <div className='gpHeader'>
          <div className='gpHeaderEyebrow'>NBA NEURAL NETWORK</div>
          <h1 className='gpHeaderTitle'>GAME PREDICTOR</h1>
          <div className='gpHeaderRule' />
        </div>

        {/* Team selectors */}
        <div className='gpTeamGrid'>
          <div>
            <div className='gpTeamLabel gpTeamLabelHome'>HOME TEAM</div>
            <select
              value={homeTeam}
              onChange={e => setHomeTeam(e.target.value)}
              className='gpTeamSelect'
            >
              {TEAMS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className='gpTeamVs'>VS</div>
            <div>
            <div className='gpTeamLabel gpTeamLabelAway'>AWAY TEAM</div>
            <select
              value={awayTeam}
              onChange={e => setAwayTeam(e.target.value)}
              className='gpTeamSelect'
            >
              {TEAMS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Stats columns */}
        <div className='gpStatsGrid'>

          

          {/* Home column */}
          <div className='gpStatsColumn'>
            <div className='gpStatsColumnHeader gpStatsColumnHeaderHome'>
              HOME — {homeTeam.toUpperCase()}
            </div>
            {HOME_STATS.map(col => (
              <div key={col} className='gpStatRow'>
                <div className='gpStatLabel'>{shortLabel(col).toUpperCase()}</div>
                <input
                  type='number'
                  value={stats[col] ?? ''}
                  onChange={e => handleStatChange(col, e.target.value)}
                  placeholder='—'
                  className='gpStatInput'
                />
              </div>
            ))}

            {/* H2H */}
            <div className='gpH2hSection'>
              <div className='gpStatLabel'>H2H WIN RATIO (LAST 10)</div>
              <input
                type='number'
                min='0' max='1' step='0.1'
                value={stats['h2h_win_ratio_last10'] ?? ''}
                onChange={e => handleStatChange('h2h_win_ratio_last10', e.target.value)}
                placeholder='0.0 – 1.0'
                className='gpStatInput'
              />
            </div>
          </div>

        {/* Away column */}
          <div className='gpStatsColumn'>
            <div className='gpStatsColumnHeader gpStatsColumnHeaderAway'>
              AWAY — {awayTeam.toUpperCase()}
            </div>
            {AWAY_STATS.map(col => (
              <div key={col} className='gpStatRow'>
                <div className='gpStatLabel'>{shortLabel(col).toUpperCase()}</div>
                <input
                  type='number'
                  value={stats[col] ?? ''}
                  onChange={e => handleStatChange(col, e.target.value)}
                  placeholder='—'
                  className='gpStatInput'
                />
              </div>
            ))}
          </div>





        </div>

        {/* Predict button */}
        <button onClick={predict} className='gpPredictButton'>
          RUN PREDICTION
        </button>

        {/* Result */}
        {result !== null && (
          <div className={`gpResultBox ${isHomeWin ? 'gpResultBoxHome' : 'gpResultBoxAway'}`}>
            <div className='gpResultEyebrow'>PREDICTION</div>
            <div className={`gpResultWinner ${isHomeWin ? 'gpResultWinnerHome' : 'gpResultWinnerAway'}`}>
              {winner}
            </div>
            <div className='gpResultOutcome'>
              {isHomeWin ? 'HOME WIN' : 'AWAY WIN'}
            </div>
            <div className='gpResultOutput'>
              NETWORK OUTPUT: {result.toFixed(4)}
            </div>
            <div className='gpConfidenceTrack'>
              <div
                className={`gpConfidenceFill ${isHomeWin ? 'gpConfidenceFillHome' : 'gpConfidenceFillAway'}`}
                style={{ width: `${result * 100}%` }}
              />
            </div>
            <div className='gpConfidenceLabels'>
              <span>AWAY</span>
              <span>HOME</span>
            </div>
          </div>
        )}

      </div>
    </div>







                </div>


                <button onClick={() => runEpochs(network, balanceData(trainingData), 0.02, 50)}>Train Balanced Data</button>
                <button onClick={() => runEpochs(network, trainingData, 0.02, 50)}>Train Raw Data</button>

                <button onClick={() => testNetwork(network, testData)}>Test</button>


                <button onClick={() => console.log(JSON.stringify(network, null, 2))}>Print</button>                
                <button onClick={() => saveNetwork(network)}>Save</button>



                <div className='projectDescription'>
                    <h2>Project Description</h2>
                    <div className='projectParagraph'>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod earum beatae, deleniti quae eveniet reiciendis id incidunt blanditiis repellat harum quidem magnam adipisci minima, nihil officia voluptatem, cumque facilis quis.</p>
                        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Assumenda cumque officiis modi, consequuntur saepe eveniet! Mollitia nam, quae autem eius deserunt similique omnis maiores aperiam ullam blanditiis expedita quod necessitatibus!</p>
                    </div>
                </div>
                <div className='projectInstructions'>
                    <h2>How To Use</h2>
                    <div className='projectParagraph'>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod earum beatae, deleniti quae eveniet reiciendis id incidunt blanditiis repellat harum quidem magnam adipisci minima, nihil officia voluptatem, cumque facilis quis.</p>
                        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Assumenda cumque officiis modi, consequuntur saepe eveniet! Mollitia nam, quae autem eius deserunt similique omnis maiores aperiam ullam blanditiis expedita quod necessitatibus!</p>
                    </div>
                </div>
            </div>
        )
}   