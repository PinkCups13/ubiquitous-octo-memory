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
    icon: 'M-7,7 L-7,0 C-7,-8 7,-8 7,0 L7,7 M-4,1 L4,1',
    note: 'The actual Venice sign over Windward. A proper entrance instead of vague beach-adjacent nonsense.',
    souvenir: 'The sign that officially starts the whole show.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Venice%20Beach%20Sign.jpg',
    fallback: 'linear-gradient(145deg,#f8dfe9,#f4c8da)'
  },
  {
    id: 2, name: 'Muscle Beach', short: 'Muscle Beach', emoji: '💪',
    icon: 'M-9,0 L9,0 M-9,-3 L-9,3 M-7,-5 L-7,5 M7,-5 L7,5 M9,-3 L9,3',
    note: 'Outdoor gym mythology with a lot of sunlight and almost no humility.',
    souvenir: 'Muscle Beach in its famously unbothered form.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Muscle%20Beach%20Venice.jpg',
    fallback: 'linear-gradient(145deg,#f1deeb,#f5dac9)'
  },
  {
    id: 3, name: 'Venice Skatepark', short: 'Skatepark', emoji: '🛹',
    icon: 'M-9,6 C-9,-4 9,-4 9,6',
    note: 'Concrete bowls on the sand. Confidence everywhere. Restraint nowhere.',
    souvenir: 'The famous skate bowls by the beach.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Venice%20Beach%20Skatepark%20P4070293.jpg',
    fallback: 'linear-gradient(145deg,#f4dce8,#d9e9f6)'
  },
  {
    id: 4, name: 'Venice Art Walls', short: 'Art Walls', emoji: '🎨',
    icon: 'M-2,-8 C4,-9 9,-4 8,2 C7,8 2,10 -2,9 C-7,8 -9,4 -9,-1 C-9,-6 -5,-9 -2,-8 M4,-4 A2,2 0 1,1 4,-8',
    note: 'Legally sanctioned chaos, which still leaves plenty of chaos to enjoy.',
    souvenir: 'The art walls, unlocked properly.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Venice%20Beach%20Graffiti%20Wall.jpg',
    fallback: 'linear-gradient(145deg,#f6dbeb,#e6bfd6)'
  },
  {
    id: 5, name: 'Venice Boardwalk', short: 'Boardwalk', emoji: '☼',
    icon: 'M0,-8 L0,-5 M5.7,-5.7 L3.5,-3.5 M8,0 L5,0 M5.7,5.7 L3.5,3.5 M0,8 L0,5 M-5.7,5.7 L-3.5,3.5 M-8,0 L-5,0 M-5.7,-5.7 L-3.5,-3.5 M0,-4 A4,4 0 1,0 0,4 A4,4 0 1,0 0,-4',
    note: 'The actual boardwalk. Busy, iconic, and constitutionally incapable of understatement.',
    souvenir: 'The boardwalk itself, in all its loud little glory.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Venice%20Beach%20Boardwalk%2C%20Los%20Angeles.jpg',
    fallback: 'linear-gradient(145deg,#f8d7e6,#f7e6f0)'
  },
  {
    id: 6, name: 'Venice Pier', short: 'Pier', emoji: '🎣',
    icon: 'M-5,-9 L-5,9 M-5,-9 L6,-5 L-5,-1',
    note: 'Long horizon, salt air, and the sort of view that can improve a person out of spite.',
    souvenir: 'The pier reaching into the Pacific. The finish.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Venice%20Fishing%20Pier-02.jpg',
    fallback: 'linear-gradient(145deg,#e1eff7,#f4deea)'
  }
];
