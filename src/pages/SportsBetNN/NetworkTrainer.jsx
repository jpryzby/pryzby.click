import { useState } from 'react';
import testCsvText from './assets/games_2023 (2).csv?raw';
import networkFile from './assets/network (1).json';

function randomWeight() { return (Math.random() * 2) - 1 }

function heWeight(fanIn) {
  const u1 = Math.random();
  const u2 = Math.random();
  const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return gaussian * Math.sqrt(2 / fanIn);
}

function makeMatrix(rows, cols) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => heWeight(cols))
  );
}

function makeBiases(size) {
  return Array.from({ length: size }, () => randomWeight());
}

function createNetwork() {
  return {
    layers: [
      new Array(101).fill(0),
      new Array(64).fill(0),
      new Array(32).fill(0),
      new Array(1).fill(0),
    ],
    weights: [
      makeMatrix(101, 64),
      makeMatrix(64, 32),
      makeMatrix(32, 1),
    ],
    biases: [
      makeBiases(64),
      makeBiases(32),
      makeBiases(1),
    ]
  };
}

function sigmoid(x) { return 1 / (1 + Math.exp(-x)) }
function relu(x) { return Math.max(0, x) }
function reluDerivative(x) { return x > 0 ? 1 : 0 }

function getNetworkOutput(network) {
  return network.layers[network.layers.length - 1][0];
}

export function feedforward(network, inputs) {
  network.layers[0] = inputs;
  for (let l = 0; l < network.weights.length; l++) {
    const currentLayer = network.layers[l];
    const nextLayer = network.layers[l + 1];
    const weights = network.weights[l];
    const biases = network.biases[l];
    const isOutputLayer = l === network.weights.length - 1;
    for (let j = 0; j < nextLayer.length; j++) {
      let raw = biases[j];
      for (let i = 0; i < currentLayer.length; i++) {
        raw += currentLayer[i] * weights[i][j];
      }
      nextLayer[j] = isOutputLayer ? sigmoid(raw) : relu(raw);
    }
  }
  return getNetworkOutput(network);
}

function cost(output, expected) { return (output - expected) ** 2 }
function costDerivative(output, expected) { return 2 * (output - expected) }

function getDeltas(network, expected) {
  let weightDeltas = network.weights.map(m => m.map(row => row.map(() => 0)));
  let biasDelta = network.biases.map(arr => arr.map(() => 0));
  const output = getNetworkOutput(network);
  let errorSignal = [2 * (output - expected)];

  for (let l = network.weights.length - 1; l >= 0; l--) {
    const currentLayer = network.layers[l];
    const nextLayer = network.layers[l + 1];
    const isOutputLayer = l === network.weights.length - 1;
    const newErrorSignal = new Array(currentLayer.length).fill(0);
    for (let j = 0; j < nextLayer.length; j++) {
      const actDeriv = isOutputLayer ? nextLayer[j] * (1 - nextLayer[j]) : reluDerivative(nextLayer[j]);
      const delta = errorSignal[j] * actDeriv;
      biasDelta[l][j] = delta;
      for (let i = 0; i < currentLayer.length; i++) {
        weightDeltas[l][i][j] = delta * currentLayer[i];
        newErrorSignal[i] += delta * network.weights[l][i][j];
      }
    }
    errorSignal = newErrorSignal;
  }
  return [weightDeltas, biasDelta];
}

function gradientDescent(network, weightDeltas, biasDelta, learningRate) {
  for (let l = 0; l < network.weights.length; l++) {
    for (let i = 0; i < network.weights[l].length; i++)
      for (let j = 0; j < network.weights[l][i].length; j++)
        network.weights[l][i][j] -= learningRate * weightDeltas[l][i][j];
    for (let j = 0; j < network.biases[l].length; j++)
      network.biases[l][j] -= learningRate * biasDelta[l][j];
  }
}

function balanceData(trainingData) {
  const homeWins = trainingData.filter(g => g.expected === 1);
  const awayWins = trainingData.filter(g => g.expected === 0);
  const shuffledHome = homeWins.sort(() => Math.random() - 0.5);
  const balanced = [...shuffledHome.slice(0, awayWins.length), ...awayWins];
  return balanced.sort(() => Math.random() - 0.5);
}

function train(network, trainingData, learningRate, epochNumber) {
  const shuffled = [...trainingData].sort(() => Math.random() - 0.5);
  const batches = [];
  for (let i = 0; i < shuffled.length; i += 32)
    batches.push(shuffled.slice(i, i + 32));

  let epochCost = 0;
  let winRate = 0;

  for (let batch of batches) {
    let totalWeightDeltas = network.weights.map(m => m.map(row => row.map(() => 0)));
    let totalBiasDeltas = network.biases.map(arr => arr.map(() => 0));
    let batchCostSum = 0;

    for (let game of batch) {
      feedforward(network, game.inputs);
      const output = getNetworkOutput(network);
      batchCostSum += cost(output, game.expected);
      winRate += Math.round(output) === game.expected ? 1 : 0;
      const [wDeltas, bDeltas] = getDeltas(network, game.expected);
      for (let l = 0; l < totalWeightDeltas.length; l++) {
        for (let i = 0; i < totalWeightDeltas[l].length; i++)
          for (let j = 0; j < totalWeightDeltas[l][i].length; j++)
            totalWeightDeltas[l][i][j] += wDeltas[l][i][j];
        for (let j = 0; j < totalBiasDeltas[l].length; j++)
          totalBiasDeltas[l][j] += bDeltas[l][j];
      }
    }

    const batchSize = batch.length;
    for (let l = 0; l < totalWeightDeltas.length; l++) {
      for (let i = 0; i < totalWeightDeltas[l].length; i++)
        for (let j = 0; j < totalWeightDeltas[l][i].length; j++)
          totalWeightDeltas[l][i][j] /= batchSize;
      for (let j = 0; j < totalBiasDeltas[l].length; j++)
        totalBiasDeltas[l][j] /= batchSize;
    }

    gradientDescent(network, totalWeightDeltas, totalBiasDeltas, learningRate);
    epochCost += batchCostSum / batchSize;
  }

  winRate /= shuffled.length;
  const avgCost = epochCost / batches.length;
  console.log(`Epoch ${epochNumber} — avg cost: ${avgCost.toFixed(4)}, win rate: ${(winRate * 100).toFixed(1)}%`);
  return avgCost;
}

function testNetwork(network, testData) {
  let correct = 0, truePositives = 0, falsePositives = 0, trueNegatives = 0, falseNegatives = 0;
  for (let game of testData) {
    const output = feedforward(network, game.inputs);
    const predicted = output >= 0.5 ? 1 : 0;
    if (predicted === game.expected) correct++;
    if (predicted === 1 && game.expected === 1) truePositives++;
    if (predicted === 1 && game.expected === 0) falsePositives++;
    if (predicted === 0 && game.expected === 0) trueNegatives++;
    if (predicted === 0 && game.expected === 1) falseNegatives++;
  }
  const total = testData.length;
  const accuracy = (correct / total * 100).toFixed(1);
  console.log('--- Test Results ---');
  console.log(`Total games tested: ${total}`);
  console.log(`Overall accuracy:   ${accuracy}%`);
  console.log(`Home win accuracy:  ${(truePositives / (truePositives + falseNegatives) * 100).toFixed(1)}%`);
  console.log(`Away win accuracy:  ${(trueNegatives / (trueNegatives + falsePositives) * 100).toFixed(1)}%`);
  return accuracy;
}

function loadCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const expected = parseFloat(cols[0]);
    const inputs = cols.slice(1, 102).map(parseFloat);
    if (inputs.length === 101 && !inputs.some(isNaN) && !isNaN(expected))
      data.push({ inputs, expected });
  }
  return data;
}

function saveNetwork(network) {
  const json = JSON.stringify(network);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'network.json';
  a.click();
  URL.revokeObjectURL(url);
}

export default function NetworkTrainer() {
    // const network = createNetwork();
    const network = networkFile;
  const testData = loadCSV(testCsvText);
  // const trainingData = loadCSV(trainingCsvText); // uncomment when needed

  function runEpochs(network, trainingData, learningRate, epochs) {
    console.log('total games:', trainingData.length);
    console.log('expected sample:', trainingData.slice(0, 5).map(g => g.expected));
    console.log('% home wins:', (trainingData.filter(g => g.expected === 1).length / trainingData.length * 100).toFixed(1) + '%');
    console.log('any NaN inputs:', trainingData.some(g => g.inputs.some(isNaN)));
    const costs = [];
    for (let e = 0; e < epochs; e++) costs.push(train(network, trainingData, learningRate, e + 1));
    console.log('--- Training complete ---');
    console.log(`Start cost: ${costs[0].toFixed(4)}`);
    console.log(`End cost:   ${costs[costs.length - 1].toFixed(4)}`);
    console.log(`Improvement: ${((costs[0] - costs[costs.length - 1]) / costs[0] * 100).toFixed(1)}%`);
    return testNetwork(network, testData);
  }

  function overnightTraining() {
    while (true) {
      const learningRate = Math.random() * 0.004 + 0.001;
      const totalNumberOfSets = Math.ceil(Math.random() * 30 + 20);
      const numberOfBalancedSets = Math.ceil(Math.random() * (totalNumberOfSets * 2 / 5));
      const numberOfRawSets = totalNumberOfSets - numberOfBalancedSets;
      const net = createNetwork();
      console.log("learning rate: " + learningRate);
      console.log("total sets: " + totalNumberOfSets);
      console.log("balanced sets: " + numberOfBalancedSets);
      console.log("raw sets: " + numberOfRawSets);
      // runEpochs(net, balanceData(trainingData), 0.001, numberOfBalancedSets);
      // runEpochs(net, trainingData, 0.001, numberOfRawSets);
      const accuracy = testNetwork(net, testData);
      console.log("overall Accuracy = " + accuracy + "\n\n");
      if (accuracy > 60) { console.log("saving network"); saveNetwork(net); }
    }
  }

  return (
    <div>
      {/* <button onClick={() => runEpochs(network, balanceData(trainingData), 0.01, 50)}>Train Balanced Data</button> */}
      {/* <button onClick={() => runEpochs(network, trainingData, 0.01, 50)}>Train Raw Data</button> */}
      <button onClick={() => testNetwork(network, testData)}>Test</button>
      <button onClick={() => console.log(JSON.stringify(network, null, 2))}>Print</button>
      <button onClick={() => saveNetwork(network)}>Save</button>
      <button onClick={() => overnightTraining()}>Overnight Training</button>
    </div>
  );
}