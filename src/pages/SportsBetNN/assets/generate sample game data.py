import pandas as pd
import numpy as np

# Load your data
df = pd.read_csv('game.csv')

# Make sure games are in chronological order
df = df.sort_values('game_date')

stats = {
    'Away Team Field Goals Made':              'team_id_away',
    'Away Team Field Goals Attempted':         'team_id_away',
    'Away Team Field Goal Percentage':         'team_id_away',
    'Away Team 3-Point Field Goals Made':      'team_id_away',
    'Away Team 3-Point Field Goals Attempted': 'team_id_away',
    'Away Team 3-Point Percentage':            'team_id_away',
    'Away Team Free Throws Made':              'team_id_away',
    'Away Team Free Throws Attempted':         'team_id_away',
    'Away Team Free Throw Percentage':         'team_id_away',
    'Away Team Offensive Rebounds':            'team_id_away',
    'Away Team Defensive Rebounds':            'team_id_away',
    'Away Team Total Rebounds':                'team_id_away',
    'Away Team Assists':                       'team_id_away',
    'Away Team Steals':                        'team_id_away',
    'Away Team Blocks':                        'team_id_away',
    'Away Team Turnovers':                     'team_id_away',
    'Away Team Personal Fouls':                'team_id_away',
    'Away Team Points':                        'team_id_away',
    'Home Team field goals':                   'team_id_home',
    'Home Team Field Goals Attempted':         'team_id_home',
    'Home Team Field Goal Percentage':         'team_id_home',
    'Home Team 3-Point Field Goals Made':      'team_id_home',
    'Home Team 3-Point Field Goals Attempted': 'team_id_home',
    'Home Team 3-Point Percentage':            'team_id_home',
    'Home Team Free Throws Made':              'team_id_home',
    'Home Team Free Throws Attempted':         'team_id_home',
    'Home Team Free Throw Percentage':         'team_id_home',
    'Home Team Offensive Rebounds':            'team_id_home',
    'Home Team Defensive Rebounds':            'team_id_home',
    'Home Team Total Rebounds':                'team_id_home',
    'Home Team Assists':                       'team_id_home',
    'Home Team Steals':                        'team_id_home',
    'Home Team Blocks':                        'team_id_home',
    'Home Team Turnovers':                     'team_id_home',
    'Home Team Personal Fouls':                'team_id_home',
    'Home Team Points':                        'team_id_home',
}

# Compute rolling averages (raw, no normalization)
for col, team_col in stats.items():
    df[f'10 Game Rolling Average {col}'] = (
        df.groupby(team_col)[col]
        .transform(lambda x: x.shift(1).rolling(10, min_periods=3).mean())
    )

# Convert W/L to 1/0
df['wl_home'] = df['wl_home'].replace({'W': 1, 'L': 0})

# H2H win ratio
df['matchup_key'] = df.apply(
    lambda r: '_vs_'.join(sorted([r['team_name_home'], r['team_name_away']])), axis=1
)
df['first_team'] = df['matchup_key'].str.split('_vs_').str[0]
df['first_team_won'] = (
    (df['team_name_home'] == df['first_team']) & (df['wl_home'] == 1) |
    (df['team_name_away'] == df['first_team']) & (df['wl_home'] == 0)
).astype(int)

def rolling_matchup_ratio(group):
    shifted = group['first_team_won'].shift(1)
    return shifted.rolling(window=10, min_periods=10).mean()

df['h2h_win_ratio_last10'] = (
    df.groupby('matchup_key', group_keys=False)
      .apply(rolling_matchup_ratio)
)

# Clean up teams
df = df[~df['team_name_home'].str.contains('All Star', na=False)]
df = df[~df['team_name_away'].str.contains('All Star', na=False)]

df['team_name_home'] = df['team_name_home'].replace({
    'LA Clippers': 'Los Angeles Clippers',
    'New Jersey Nets': 'Brooklyn Nets',
    'New Orleans Hornets': 'Charlotte Hornets',
    'Vancouver Grizzlies': 'Memphis Grizzlies',
})
df['team_name_away'] = df['team_name_away'].replace({
    'LA Clippers': 'Los Angeles Clippers',
    'New Jersey Nets': 'Brooklyn Nets',
    'New Orleans Hornets': 'Charlotte Hornets',
    'Vancouver Grizzlies': 'Memphis Grizzlies',
})

valid_teams = {
    'Atlanta Hawks', 'Boston Celtics', 'Brooklyn Nets', 'Charlotte Hornets',
    'Chicago Bulls', 'Cleveland Cavaliers', 'Dallas Mavericks', 'Denver Nuggets',
    'Detroit Pistons', 'Golden State Warriors', 'Houston Rockets', 'Indiana Pacers',
    'Los Angeles Clippers', 'Los Angeles Lakers', 'Memphis Grizzlies', 'Miami Heat',
    'Milwaukee Bucks', 'Minnesota Timberwolves', 'New Orleans Pelicans', 'New York Knicks',
    'Oklahoma City Thunder', 'Orlando Magic', 'Philadelphia 76ers', 'Phoenix Suns',
    'Portland Trail Blazers', 'Sacramento Kings', 'San Antonio Spurs', 'Toronto Raptors',
    'Utah Jazz', 'Washington Wizards',
    'Seattle SuperSonics', 'Charlotte Bobcats',
}

df = df[df['team_name_home'].isin(valid_teams)]
df = df[df['team_name_away'].isin(valid_teams)]

# One-hot encode teams
home_dummies = pd.get_dummies(df['team_name_home'], prefix='home', dtype=int)
away_dummies = pd.get_dummies(df['team_name_away'], prefix='away', dtype=int)
df = pd.concat([df, home_dummies, away_dummies], axis=1)

# Drop NaN rows
df = df.dropna()

# Drop columns we don't need
cols_to_drop = [
    'team_abbreviation_home', 'team_name_home', 'matchup_home',
    'team_abbreviation_away', 'team_name_away', 'matchup_away', 'Away Team Win/Loss Result',
    'matchup_key', 'first_team', 'first_team_won', 'season_id', 'team_id_home', 'game_id', 'min',
    'Home Team field goals', 'Home Team Field Goals Attempted', 'Home Team Field Goal Percentage',
    'Home Team 3-Point Field Goals Made', 'Home Team 3-Point Field Goals Attempted', 'Home Team 3-Point Percentage',
    'Home Team Free Throws Made', 'Home Team Free Throws Attempted', 'Home Team Free Throw Percentage',
    'Home Team Offensive Rebounds', 'Home Team Defensive Rebounds', 'Home Team Total Rebounds',
    'Home Team Assists', 'Home Team Steals', 'Home Team Blocks', 'Home Team Turnovers',
    'Home Team Personal Fouls', 'Home Team Points', 'Home Team Point Differential',
    'video_available_home', 'team_id_away',
    'Away Team Field Goals Made', 'Away Team Field Goals Attempted', 'Away Team Field Goal Percentage',
    'Away Team 3-Point Field Goals Made', 'Away Team 3-Point Field Goals Attempted', 'Away Team 3-Point Percentage',
    'Away Team Free Throws Made', 'Away Team Free Throws Attempted', 'Away Team Free Throw Percentage',
    'Away Team Offensive Rebounds', 'Away Team Defensive Rebounds', 'Away Team Total Rebounds',
    'Away Team Assists', 'Away Team Steals', 'Away Team Blocks', 'Away Team Turnovers',
    'Away Team Personal Fouls', 'Away Team Points', 'Away Team Point Differential',
    'video_available_away', 'season_type'
]

df = df.drop(columns=[c for c in cols_to_drop if c in df.columns])

# Take the 100 most recent games and export
df_sample = df.tail(100).drop(columns=['game_date'])
df_sample.to_csv('sample_game_data.csv', index=False)

print(f"Exported {len(df_sample)} sample games to sample_games.csv")