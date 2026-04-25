const STORAGE_KEY        = 'vbq_steps_clean';
const GOALS_KEY          = 'vbq_goal_steps_clean';
const DEFAULT_GOAL_STEPS = 20000;
const ROUTE_TOTAL_MILES  = 10.0;

// Visual positions along the SVG route (start + 6 stops)
const ROUTE_POINTS = [
  [36,  138],
  [165, 106],
  [318,  76],
  [462, 108],
  [582, 140],
  [786,  96],
  [968,  76]
];

const STOPS = [
  {
    id: 1, name: 'Venice Sign', short: 'Sign', emoji: '✦',
    note: 'The actual Venice sign over Windward. A proper entrance instead of vague beach-adjacent nonsense.',
    souvenir: 'The sign that officially starts the whole show.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Venice%20Beach%20Sign.jpg',
    fallback: 'linear-gradient(145deg,#f8dfe9,#f4c8da)'
  },
  {
    id: 2, name: 'Muscle Beach', short: 'Muscle Beach', emoji: '💪',
    note: 'Outdoor gym mythology with a lot of sunlight and almost no humility.',
    souvenir: 'Muscle Beach in its famously unbothered form.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Muscle%20Beach%20Venice.jpg',
    fallback: 'linear-gradient(145deg,#f1deeb,#f5dac9)'
  },
  {
    id: 3, name: 'Venice Skatepark', short: 'Skatepark', emoji: '🛹',
    note: 'Concrete bowls on the sand. Confidence everywhere. Restraint nowhere.',
    souvenir: 'The famous skate bowls by the beach.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Venice%20Beach%20Skatepark%20P4070293.jpg',
    fallback: 'linear-gradient(145deg,#f4dce8,#d9e9f6)'
  },
  {
    id: 4, name: 'Venice Art Walls', short: 'Art Walls', emoji: '🎨',
    note: 'Legally sanctioned chaos, which still leaves plenty of chaos to enjoy.',
    souvenir: 'The art walls, unlocked properly.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Venice%20Beach%20Graffiti%20Wall.jpg',
    fallback: 'linear-gradient(145deg,#f6dbeb,#e6bfd6)'
  },
  {
    id: 5, name: 'Venice Boardwalk', short: 'Boardwalk', emoji: '☼',
    note: 'The actual boardwalk. Busy, iconic, and constitutionally incapable of understatement.',
    souvenir: 'The boardwalk itself, in all its loud little glory.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Venice%20Beach%20Boardwalk%2C%20Los%20Angeles.jpg',
    fallback: 'linear-gradient(145deg,#f8d7e6,#f7e6f0)'
  },
  {
    id: 6, name: 'Venice Pier', short: 'Pier', emoji: '🎣',
    note: 'Long horizon, salt air, and the sort of view that can improve a person out of spite.',
    souvenir: 'The pier reaching into the Pacific. The finish.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Venice%20Fishing%20Pier-02.jpg',
    fallback: 'linear-gradient(145deg,#e1eff7,#f4deea)'
  }
];
