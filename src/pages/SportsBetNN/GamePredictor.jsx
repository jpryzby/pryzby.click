import { useState, useMemo } from 'react';
import sampleGameData from './assets/sample_game_data.csv?raw';
import scalerStats from './assets/scaler_stats (4).json';
import networkFile from './assets/network (1).json';


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

const parseFirstGame = () => {
  const [headerLine, ...rows] = sampleGameData.trim().split('\n');
  const headers = headerLine.split(',').map(h => h.trim());
  const values = rows[0].replace(/\r/g, '').split(',');
  return Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim()]));
};

const firstGame = parseFirstGame();

function shortLabel(col) {
  return col
    .replace('10 Game Rolling Average Away Team ', '')
    .replace('10 Game Rolling Average Home Team ', '')
    .replace('10 Game Rolling Average ', '')
}

function sigmoid(x) { return 1 / (1 + Math.exp(-x)) }
function relu(x) { return Math.max(0, x) }
function reluDerivative(x) { return x > 0 ? 1 : 0 }

function getNetworkOutput(network) {
  return network.layers[network.layers.length - 1][0];
}

function feedforward(network, inputs) {
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

const decodeTeams = (game) => ({
  home: Object.keys(game).find(k => k.startsWith('home_') && game[k] === '1')?.replace('home_', '') ?? 'Unknown',
  away: Object.keys(game).find(k => k.startsWith('away_') && game[k] === '1')?.replace('away_', '') ?? 'Unknown',
});

export default function GamePredictor() {
  const sampleGames = useMemo(() => {
    const [headerLine, ...rows] = sampleGameData.trim().split('\n');
    const headers = headerLine.split(',').map(h => h.trim());
    return rows.map(row => {
      const values = row.replace(/\r/g, '').split(',');
      return Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim()]));
    });
  }, []);

//   const [selectedGame, setSelectedGame] = useState('0');
//   const [homeTeam, setHomeTeam] = useState(
//     Object.keys(firstGame).find(k => k.startsWith('home_') && firstGame[k] === '1')?.replace('home_', '') ?? TEAMS[0]
//   );
//   const [awayTeam, setAwayTeam] = useState(
//     Object.keys(firstGame).find(k => k.startsWith('away_') && firstGame[k] === '1')?.replace('away_', '') ?? TEAMS[1]
//   );
//   const [stats, setStats] = useState(
//     Object.fromEntries([...HOME_STATS, ...AWAY_STATS, 'h2h_win_ratio_last10'].map(col => [col, firstGame[col] ?? '']))
//   );
    const [selectedGame, setSelectedGame] = useState('');
    const [homeTeam, setHomeTeam] = useState(TEAMS[0]);
    const [awayTeam, setAwayTeam] = useState(TEAMS[1]);
    const [stats, setStats] = useState({});
  const [result, setResult] = useState(null);

  function normalize(col, value) {
    const mean = scalerStats.mean[col];
    const std = scalerStats.std[col];
    if (mean === undefined || std === undefined) return parseFloat(value) || 0;
    return (parseFloat(value) - mean) / std;
  }

  function buildInputVector(homeTeam, awayTeam, stats) {
    const inputs = [];
    for (const col of AWAY_STATS) inputs.push(normalize(col, stats[col] ?? 0));
    for (const col of HOME_STATS) inputs.push(normalize(col, stats[col] ?? 0));
    inputs.push(parseFloat(stats['h2h_win_ratio_last10'] ?? 0.5));
    for (const team of TEAMS) inputs.push(team === homeTeam ? 1 : 0);
    for (const team of TEAMS) inputs.push(team === awayTeam ? 1 : 0);
    return inputs;
  }

  function handleStatChange(col, value) {
    setStats(prev => ({ ...prev, [col]: value }));
  }

  function predict() {
    const inputs = buildInputVector(homeTeam, awayTeam, stats);
    const network = JSON.parse(JSON.stringify(networkFile));
    const output = feedforward(network, inputs);
    setResult(output);
  }

  function handleSampleGameSelect(e) {
    const idx = e.target.value;
    if (idx === '') return;
    const game = sampleGames[idx];
    const { home, away } = decodeTeams(game);
    setHomeTeam(home);
    setAwayTeam(away);
    const newStats = {};
    [...HOME_STATS, ...AWAY_STATS, 'h2h_win_ratio_last10'].forEach(col => {
      if (game[col] !== undefined) newStats[col] = game[col];
    });
    setStats(newStats);
    setSelectedGame(idx);
  }

  const isHomeWin = result !== null && result >= 0.5;
  const winner = result !== null ? (result >= 0.5 ? homeTeam : awayTeam) : null;

  return (
    <div className='gpWrapper'>
      <div className='gpInner'>
        <div className='gpHeader'>
          <div className='gpHeaderEyebrow'>NBA NEURAL NETWORK</div>
          <h1 className='gpHeaderTitle'>GAME PREDICTOR</h1>
          <div className='gpHeaderRule' />
        </div>

        <select value={selectedGame} onChange={handleSampleGameSelect} className='gpTeamSelect'>
          <option value=''>— Load a sample game —</option>
          {sampleGames.map((game, i) => {
            const { home, away } = decodeTeams(game);
            return <option key={i} value={i}>{home} vs {away}</option>;
          })}
        </select>

        <div className='gpTeamGrid'>
          <div>
            <div className='gpTeamLabel gpTeamLabelHome'>HOME TEAM</div>
            <select value={homeTeam} onChange={e => setHomeTeam(e.target.value)} className='gpTeamSelect'>
              {TEAMS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className='gpTeamVs'>VS</div>
          <div>
            <div className='gpTeamLabel gpTeamLabelAway'>AWAY TEAM</div>
            <select value={awayTeam} onChange={e => setAwayTeam(e.target.value)} className='gpTeamSelect'>
              {TEAMS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className='gpStatsGrid'>
          <div className='gpStatsColumn'>
            <div className='gpStatsColumnHeader gpStatsColumnHeaderHome'>HOME — {homeTeam.toUpperCase()}</div>
            {HOME_STATS.map(col => (
              <div key={col} className='gpStatRow'>
                <div className='gpStatLabel'>{shortLabel(col).toUpperCase()}</div>
                <input type='number' value={stats[col] ?? ''} onChange={e => handleStatChange(col, e.target.value)} placeholder='—' className='gpStatInput' />
              </div>
            ))}
            <div className='gpH2hSection'>
              <div className='gpStatLabel'>H2H WIN RATIO (LAST 10)</div>
              <input type='number' min='0' max='1' step='0.1' value={stats['h2h_win_ratio_last10'] ?? ''} onChange={e => handleStatChange('h2h_win_ratio_last10', e.target.value)} placeholder='0.0 – 1.0' className='gpStatInput' />
            </div>
          </div>

          <div className='gpStatsColumn'>
            <div className='gpStatsColumnHeader gpStatsColumnHeaderAway'>AWAY — {awayTeam.toUpperCase()}</div>
            {AWAY_STATS.map(col => (
              <div key={col} className='gpStatRow'>
                <div className='gpStatLabel'>{shortLabel(col).toUpperCase()}</div>
                <input type='number' value={stats[col] ?? ''} onChange={e => handleStatChange(col, e.target.value)} placeholder='—' className='gpStatInput' />
              </div>
            ))}
          </div>
        </div>

        <button onClick={predict} className='gpPredictButton'>RUN PREDICTION</button>

        {result !== null && (
          <div className={`gpResultBox ${isHomeWin ? 'gpResultBoxHome' : 'gpResultBoxAway'}`}>
            <div className='gpResultEyebrow'>PREDICTION</div>
            <div className={`gpResultWinner ${isHomeWin ? 'gpResultWinnerHome' : 'gpResultWinnerAway'}`}>{winner}</div>
            <div className='gpResultOutcome'>{isHomeWin ? 'HOME WIN' : 'AWAY WIN'}</div>
            <div className='gpResultOutput'>NETWORK OUTPUT: {result.toFixed(4)}</div>
            <div className='gpConfidenceTrack'>
              <div className={`gpConfidenceFill ${isHomeWin ? 'gpConfidenceFillHome' : 'gpConfidenceFillAway'}`} style={{ width: `${result * 100}%` }} />
            </div>
            <div className='gpConfidenceLabels'><span>AWAY</span><span>HOME</span></div>
          </div>
        )}
      </div>
    </div>
  );
}