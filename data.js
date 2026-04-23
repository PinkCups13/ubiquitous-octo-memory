const STORAGE_KEY = 'venice-beach-quest-final-v1';
const GOALS_KEY = 'venice-beach-quest-goals-v1';
const JOURNAL_KEY = 'venice-beach-quest-journal-v1';
const DEFAULT_DAILY_GOAL = 8000;
const DEFAULT_MILE_GOAL = 10;
const STEPS_PER_MILE = 2000;

const ROUTE_MILES = [0, 0.4, 1.1, 2.0, 3.0, 4.1, 5.2, 6.4, 7.5, 8.7, 10];
const ROUTE_POINTS = [
  [36,138],[110,110],[205,82],[325,108],[432,144],
  [550,118],[650,84],[760,102],[858,142],[928,112],[968,78]
];

const STOPS = [
  {id:1,miles:0.4,name:'Venice Sign',short:'Sign',emoji:'✦',note:'The actual Venice sign over Windward. A proper entrance instead of vague beach-adjacent nonsense.',souvenir:'The sign that officially starts the whole show.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Venice%20Beach%20Sign.jpg',fallback:'linear-gradient(145deg,#f8dfe9,#f4c8da)'},
  {id:2,miles:1.1,name:'Venice Beach Boardwalk',short:'Boardwalk',emoji:'☼',note:'The actual boardwalk. Busy, iconic, and constitutionally incapable of understatement.',souvenir:'The boardwalk itself, in all its loud little glory.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Venice%20Beach%20Boardwalk%2C%20Los%20Angeles.jpg',fallback:'linear-gradient(145deg,#f8d7e6,#f7e6f0)'},
  {id:3,miles:2.0,name:'Venice Beach Skatepark',short:'Skatepark',emoji:'🛹',note:'Concrete bowls on the sand. Confidence everywhere. Restraint nowhere.',souvenir:'The famous skate bowls by the beach.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Venice%20Beach%20Skatepark%20P4070293.jpg',fallback:'linear-gradient(145deg,#f4dce8,#d9e9f6)'},
  {id:4,miles:3.0,name:'Venice Art Walls',short:'Art Walls',emoji:'🎨',note:'Legally sanctioned chaos, which still leaves plenty of chaos to enjoy.',souvenir:'The art walls, unlocked properly.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Venice%20Beach%20Graffiti%20Wall.jpg',fallback:'linear-gradient(145deg,#f6dbeb,#e6bfd6)'},
  {id:5,miles:4.1,name:'Muscle Beach Venice',short:'Muscle',emoji:'💪',note:'Outdoor gym mythology with a lot of sunlight and almost no humility.',souvenir:'Muscle Beach in its famously unbothered form.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Muscle%20Beach%20Venice.jpg',fallback:'linear-gradient(145deg,#f1deeb,#f5dac9)'},
  {id:6,miles:5.2,name:'Venice Beach Recreation Center',short:'Rec Center',emoji:'🏀',note:'The courts, the spectacle, and the mild suspicion that everyone is cooler than you.',souvenir:'The recreation center and courts.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Venice%20Beach%20Recreation%20Center.jpg',fallback:'linear-gradient(145deg,#f8e0ea,#f6d1dd)'},
  {id:7,miles:6.4,name:'Venice Fishing Pier',short:'Pier',emoji:'🎣',note:'Long horizon, salt air, and the sort of view that can improve a person out of spite.',souvenir:'The pier reaching into the Pacific.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Venice%20Fishing%20Pier-02.jpg',fallback:'linear-gradient(145deg,#e1eff7,#f4deea)'},
  {id:8,miles:7.5,name:'Venice Canal Historic District',short:'Canals',emoji:'≈',note:'Quiet, photogenic, and weirdly civilized for Venice.',souvenir:'The canals tucked just behind the beach world.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Los%20Angeles%20-%20Venice%20Canal%20Historic%20District%2001.jpg',fallback:'linear-gradient(145deg,#f7dde8,#eed8c6)'},
  {id:9,miles:8.7,name:'Abbot Kinney Boulevard',short:'Abbot Kinney',emoji:'◆',note:'Shops, style, and enough confidence to feel mildly rude about it.',souvenir:'The boulevard that keeps selling the neighborhood back to itself.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Looking%20down%20Abbot%20Kinney.jpg',fallback:'linear-gradient(145deg,#f8d7e0,#f5d4b7)'},
  {id:10,miles:10,name:'Venice Beach Bike Path',short:'Bike Path',emoji:'🚲',note:'Ten miles done. Very competent. Slightly suspicious, honestly.',souvenir:'The bike path beside the beach and your finish line.',image:'https://commons.wikimedia.org/wiki/Special:FilePath/Beach%20bikepath%20in%20the%20Venice%20Beach%20park%2C%20California.jpg',fallback:'linear-gradient(145deg,#f4ddeb,#efd0dd)'}
];

const JOURNAL_PROMPTS = [
  'What looked better in motion than it did in your head?',
  'What part of the walk felt the most alive?',
  'What changed once you kept going?',
  'What did the light do today?',
  'What felt cinematic for no real reason?',
  'What part of Venice felt the most specific today?',
  'What were you still carrying at the start of the walk?',
  'What did the walk quietly fix?',
  'What did you notice once you stopped rushing?',
  'What felt easier halfway through?',
  'What would today\'s walk be called if it were a scene title?',
  'What part of the route felt like escape?',
  'What detail made the walk feel real, not generic?',
  'What looked expensive in the best possible way?',
  'What softened once you were moving?'
];
