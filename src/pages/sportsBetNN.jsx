import '../styles/sportsBetNNStyle.css';
import csvText from '../assets/Training Data 1.csv?raw'

import Nav from '../components/nav.jsx';
import Footer from '../components/footer.jsx';


export default function SportsBetNN(){

    //return random number from -1 to 1
    function randomWeight() {
        return (Math.random() * 2) - 1 
    }

    //Create 2d array with each slot containing a random weight
    function makeMatrix(rows, cols) {
        return Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => randomWeight())
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
    const network = {
        layers: [
            new Array(103).fill(0),  // input layer
            new Array(64).fill(0),  // hidden layer 1
            new Array(32).fill(0),  // hidden layer 2
            new Array(1).fill(0),   // output layer
        ],
        weights: [
            makeMatrix(103, 64),  // input → hidden 1
            makeMatrix(64, 32),  // hidden 1 → hidden 2
            makeMatrix(32, 1),   // hidden 2 → output
        ],
        biases: [
            makeBiases(64),  // hidden layer 1
            makeBiases(32),  // hidden layer 2
            makeBiases(1),   // output layer
        ]
    }

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




   function train(network, trainingData, learningRate, epochNumber) {
        const shuffled = [...trainingData].sort(() => Math.random() - 0.5)

        const batches = []
        for (let i = 0; i < shuffled.length; i += 32) {
            batches.push(shuffled.slice(i, i + 32))
        }

        let epochCost = 0  // ← add this

        for (let batch of batches) {
            let totalWeightDeltas = network.weights.map(matrix =>
                matrix.map(row => row.map(() => 0))
            )
            let totalBiasDeltas = network.biases.map(arr => arr.map(() => 0))
            let batchCost = 0

            for (let game of batch) {
                feedforward(network, game.inputs)
                batchCost += cost(getNetworkOutput(network), game.expected)
                const [wDeltas, bDeltas] = getDeltas(network, game.expected)

                for (let l = 0; l < totalWeightDeltas.length; l++) {
                    for (let i = 0; i < totalWeightDeltas[l].length; i++)
                        for (let j = 0; j < totalWeightDeltas[l][i].length; j++)
                            totalWeightDeltas[l][i][j] += wDeltas[l][i][j]
                    for (let j = 0; j < totalBiasDeltas[l].length; j++)
                        totalBiasDeltas[l][j] += bDeltas[l][j]
                }

            const batchSize = batch.length
            for (let l = 0; l < totalWeightDeltas.length; l++) {
                for (let i = 0; i < totalWeightDeltas[l].length; i++)
                    for (let j = 0; j < totalWeightDeltas[l][i].length; j++)
                        totalWeightDeltas[l][i][j] /= batchSize
                for (let j = 0; j < totalBiasDeltas[l].length; j++)
                    totalBiasDeltas[l][j] /= batchSize
            }

            gradientDescent(network, totalWeightDeltas, totalBiasDeltas, learningRate)
            epochCost += batchCost / batchSize  // ← add this
            }
        }

        const avgCost = epochCost / batches.length  // ← add this
        console.log(`Epoch ${epochNumber} — avg cost: ${avgCost.toFixed(4)}`)
        return avgCost  // ← add this

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


    function loadCSV(csvText) {
        const lines = csvText.trim().split('\n')
        const data = []

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',')
            const expected = parseFloat(cols[0])
            const inputs = cols.slice(1, 104).map(parseFloat)

            if (inputs.length === 103 && !inputs.some(isNaN) && !isNaN(expected)) {
                data.push({ inputs, expected })
            }
        }
        return data
    }

    const trainingData = loadCSV(csvText)



    return(
            <div className='pageContainer'>
                
                <Nav />
    
                <div className='projectTitle'>
                    <h1>Project Title</h1>
                </div>
                <div className='projectBody'>
                    <p>project body</p>
                </div>


                <button onClick={() => runEpochs(network, trainingData, 0.02, 50)}>Train</button>



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