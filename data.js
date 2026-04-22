// Morning Savers — SAVERS data with 7-day rotating suggestions
const SAVERS_DATA = [
  {
    id: 'S',
    letter: 'S',
    name: 'Silence',
    icon: '🧘',
    tagline: 'Begin with stillness',
    instructions: `
      <p><strong>Silence</strong> is the first SAVER — a deliberate practice of stillness that sets the tone for your entire day. Most people wake up and immediately reach for their phone, flooding their mind with noise before they've had a single conscious thought.</p>
      <p>Silence creates space. It lowers cortisol, activates the parasympathetic nervous system, and lets your subconscious surface insights that the busyness of the day would otherwise drown out.</p>
      <p><strong>How to practice:</strong></p>
      <ol>
        <li>Find a comfortable seat — on the floor, a chair, or your bed.</li>
        <li>Close your eyes and take three slow, deep breaths to arrive.</li>
        <li>Choose a focus: your breath, a word (like "calm"), or simply open awareness.</li>
        <li>When thoughts arise, notice them without judgment and return to your focus.</li>
        <li>End by setting one intention for the day.</li>
      </ol>
      <p>There is no perfect meditation. Even a restless minute of stillness counts.</p>
    `,
    ideas: [
      { title: 'Box Breathing', body: 'Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat. Used by Navy SEALs to calm the nervous system fast.' },
      { title: 'Body Scan', body: 'Starting at the top of your head, slowly move awareness down through each body part, releasing tension as you go.' },
      { title: 'Loving-Kindness (Metta)', body: 'Silently repeat: "May I be happy. May I be healthy. May I be at peace." Then extend those wishes to others.' },
      { title: 'Breath Counting', body: 'Count each exhale from 1 to 10, then start again. When you lose count, start over without frustration.' },
      { title: 'Open Awareness', body: 'Simply sit and notice sounds, sensations, and thoughts as they arise — like watching clouds pass. No agenda.' },
      { title: '4-7-8 Breathing', body: 'Inhale for 4, hold for 7, exhale slowly for 8. Powerfully activates the relaxation response.' },
      { title: 'Gratitude Silence', body: 'Sit quietly and mentally name three things you\'re grateful for. Hold each one and really feel it before moving on.' },
    ],
    daily: [
      { title: 'Box Breathing', snippet: 'Inhale 4, hold 4, exhale 4, hold 4 — steady and grounding.' },
      { title: 'Body Scan', snippet: 'Move awareness from head to toe, softening wherever you hold tension.' },
      { title: 'Loving-Kindness', snippet: 'Send compassion inward first, then outward to those around you.' },
      { title: 'Breath Counting', snippet: 'Count each exhale 1–10. A simple anchor for a busy mind.' },
      { title: 'Open Awareness', snippet: 'No agenda — just notice what is, like watching clouds pass by.' },
      { title: '4-7-8 Breathing', snippet: 'Inhale 4, hold 7, exhale 8. A powerful reset for your nervous system.' },
      { title: 'Gratitude Silence', snippet: 'Sit with three things you\'re grateful for and really feel each one.' },
    ],
  },
  {
    id: 'A',
    letter: 'A',
    name: 'Affirmations',
    icon: '💬',
    tagline: 'Program your mindset',
    instructions: `
      <p><strong>Affirmations</strong> are deliberate statements that shape your beliefs, which in turn shape your behaviour. The key insight from neuroscience: your brain tends to confirm what it already believes. Affirmations interrupt negative self-talk loops and replace them with empowering narratives.</p>
      <p>Hal Elrod's formula for powerful affirmations has five parts:</p>
      <ol>
        <li><strong>What you want</strong> — state it in the present tense as if it's already true.</li>
        <li><strong>Why you want it</strong> — connect it to a deep reason that matters to you.</li>
        <li><strong>What you're committed to doing</strong> — actions, not just wishes.</li>
        <li><strong>When you'll do it</strong> — specificity makes it real.</li>
        <li><strong>Read them with emotion</strong> — feel the words as you say them.</li>
      </ol>
      <p>Write your own affirmations in a notebook or use today's suggestions as a starting point. Read them aloud, slowly, with conviction.</p>
    `,
    ideas: [
      { title: 'Identity Affirmations', body: '"I am disciplined, focused, and fully capable of achieving my goals." Repeat 3× with conviction.' },
      { title: 'Health & Energy', body: '"I take excellent care of my body. I have boundless energy and I feel strong and healthy every day."' },
      { title: 'Abundance Mindset', body: '"There is more than enough success, love, and opportunity for me. I attract good things effortlessly."' },
      { title: 'Relationship Affirmations', body: '"I show up as my best self in all my relationships. I listen deeply and give generously."' },
      { title: 'Purpose & Growth', body: '"I am constantly growing and improving. My life has meaning and I make a positive difference."' },
      { title: 'Courage Affirmations', body: '"I act in spite of fear. I embrace challenges as opportunities to grow stronger."' },
      { title: 'Gratitude Affirmations', body: '"I am grateful for this day and everything in my life. My attitude of gratitude attracts more good."' },
    ],
    daily: [
      { title: 'Identity Affirmations', snippet: 'Reinforce who you are becoming — capable, disciplined, focused.' },
      { title: 'Health & Energy', snippet: 'Affirm your body\'s strength and your commitment to caring for it.' },
      { title: 'Abundance Mindset', snippet: 'Open your mind to success, opportunity, and more than enough.' },
      { title: 'Relationship Affirmations', snippet: 'Affirm how you show up for the people who matter most.' },
      { title: 'Purpose & Growth', snippet: 'Remind yourself that your life has meaning and you\'re always improving.' },
      { title: 'Courage Affirmations', snippet: 'Act in spite of fear — affirm your boldness and resilience.' },
      { title: 'Gratitude Affirmations', snippet: 'A grateful mind attracts more. Affirm all that you have.' },
    ],
  },
  {
    id: 'V',
    letter: 'V',
    name: 'Visualization',
    icon: '🔮',
    tagline: 'See it before you live it',
    instructions: `
      <p><strong>Visualization</strong> is the practice of mentally rehearsing your ideal future. Olympic athletes have used it for decades — the brain doesn't fully distinguish between a vividly imagined experience and a real one, so mental rehearsal literally primes your neural pathways for success.</p>
      <p><strong>How to visualize effectively:</strong></p>
      <ol>
        <li>Close your eyes and take a few deep breaths to relax.</li>
        <li>Choose a specific scene: your ideal day, achieving a goal, or your future self.</li>
        <li>Make it <strong>multi-sensory</strong> — what do you see, hear, feel, even smell?</li>
        <li>Experience the <strong>emotions</strong> as if it's happening now: pride, joy, gratitude.</li>
        <li>Replay the scene 2–3 times, adding more detail each time.</li>
      </ol>
      <p>Keep a small image, vision board, or note card nearby to glance at after your session to anchor the vision.</p>
    `,
    ideas: [
      { title: 'Ideal Day', body: 'Walk through your perfect day from waking up to going to bed — every detail, every feeling.' },
      { title: 'Future Self', body: 'Visualize yourself 1 or 5 years from now at your best. What do you look like? How do you carry yourself?' },
      { title: '#1 Goal Achievement', body: 'Picture the exact moment you achieve your most important goal. Who\'s there? How do you feel?' },
      { title: 'Thriving Relationships', body: 'See yourself connecting deeply with those you love — listening, laughing, present and engaged.' },
      { title: 'Peak Health', body: 'Visualize your body strong and vibrant. See yourself making healthy choices with ease and joy.' },
      { title: 'Career & Purpose', body: 'Imagine doing work that lights you up, contributing your unique gifts, and being recognized for your impact.' },
      { title: 'Legacy Vision', body: 'Fast-forward to the end of your life. What did you build? Who did you become? What legacy did you leave?' },
    ],
    daily: [
      { title: 'Your Ideal Day', snippet: 'Walk through your perfect day from first light to last — every detail vivid.' },
      { title: 'Your Future Self', snippet: 'See yourself 1–5 years from now at your absolute best.' },
      { title: 'Goal Achievement', snippet: 'Picture the exact moment you achieve your #1 goal. Feel it fully.' },
      { title: 'Thriving Relationships', snippet: 'See yourself deeply connected, present, and generous with those you love.' },
      { title: 'Peak Health', snippet: 'Visualize your body strong, vibrant, and full of energy.' },
      { title: 'Career & Purpose', snippet: 'See yourself doing meaningful work that lights you up every day.' },
      { title: 'Your Legacy', snippet: 'Who did you become? What did you build? What did you leave behind?' },
    ],
  },
  {
    id: 'E',
    letter: 'E',
    name: 'Exercise',
    icon: '⚡',
    tagline: 'Move to energize your mind',
    instructions: `
      <p><strong>Exercise</strong> in the morning isn't just about fitness — it's about waking up your brain. Physical movement increases blood flow, releases BDNF (the brain's growth hormone), and floods your system with endorphins and dopamine. You think more clearly, feel more confident, and have more energy for the entire day.</p>
      <p>Even a short session counts. The goal here is activation, not exhaustion.</p>
      <p><strong>Tips for morning exercise:</strong></p>
      <ol>
        <li>Lay your workout clothes out the night before to remove friction.</li>
        <li>Start gentle — a 1-minute session might just be 20 jumping jacks and a stretch.</li>
        <li>Match intensity to your goal: energize (moderate) vs. train (high intensity).</li>
        <li>Stay hydrated — drink a glass of water before you begin.</li>
        <li>A 10-minute session is enough to get a meaningful cognitive and mood boost.</li>
      </ol>
      <p>Consistency beats intensity. Show up every day, even for just a minute.</p>
    `,
    ideas: [
      { title: 'Sun Salutations', body: '3–5 rounds of yoga sun salutations. Warms the whole body, improves flexibility, and is deeply energizing.' },
      { title: 'HIIT Intervals', body: '30 sec on / 15 sec rest. Burpees, mountain climbers, jump squats — get your heart rate up fast.' },
      { title: 'Brisk Walk or Jog', body: 'Step outside. Fresh air + movement is one of the best combinations for mood and mental clarity.' },
      { title: 'Bodyweight Strength', body: 'Push-ups, squats, lunges, planks. No equipment needed. 3 exercises × 10–15 reps each.' },
      { title: 'Dance & Move', body: 'Put on one song and just move however feels good. Silly? Yes. Effective? Absolutely.' },
      { title: 'Stretch & Flow', body: 'A slow, intentional stretching sequence. Focus on hips, spine, shoulders, and hamstrings.' },
      { title: 'Breath + Movement', body: 'Combine breathing exercises with slow arm circles, torso twists, and gentle movement. Low impact, high return.' },
    ],
    daily: [
      { title: 'Sun Salutations', snippet: '3–5 yoga sun salutations to warm the whole body and build heat.' },
      { title: 'HIIT Burst', snippet: '30 sec on, 15 sec rest — burpees, mountain climbers, jump squats.' },
      { title: 'Brisk Walk or Jog', snippet: 'Step outside. Fresh air and movement is the ultimate mood booster.' },
      { title: 'Bodyweight Strength', snippet: 'Push-ups, squats, lunges, plank. No equipment, full activation.' },
      { title: 'Dance & Move', snippet: 'One song, free movement. Joyful, energizing, and genuinely effective.' },
      { title: 'Stretch & Flow', snippet: 'Slow, intentional stretching — hips, spine, shoulders, hamstrings.' },
      { title: 'Breath + Movement', snippet: 'Combine breathwork with gentle movement for a grounded, calm start.' },
    ],
  },
  {
    id: 'R',
    letter: 'R',
    name: 'Reading',
    icon: '📖',
    tagline: 'Learn from the best every day',
    instructions: `
      <p><strong>Reading</strong> is one of the highest-leverage habits you can develop. Reading just 10 pages a day equals roughly 12 books a year — that's 12 mentors, 12 new frameworks, 12 perspectives shaping how you see and act in the world.</p>
      <p>The Miracle Morning reading practice is about <em>personal development</em> — reading books that make you better, not just books that entertain you (though those have their place too).</p>
      <p><strong>How to read actively:</strong></p>
      <ol>
        <li>Keep a highlighter or pen nearby — mark passages that resonate.</li>
        <li>After reading, pause and ask: "What's the one thing I'll apply today?"</li>
        <li>Keep your reading material ready the night before so there's no friction.</li>
        <li>Rotate categories: mindset, health, relationships, skills, biography.</li>
        <li>Even re-reading a favourite chapter from a book you love counts.</li>
      </ol>
      <p>Don't aim to finish books. Aim to extract and apply one idea at a time.</p>
    `,
    ideas: [
      { title: 'Personal Development', body: 'Books like Atomic Habits, The 7 Habits, Think and Grow Rich, or Mindset. One idea per session.' },
      { title: 'Biography', body: 'Read about someone who achieved something you admire. Their struggles will reframe your own.' },
      { title: 'Health & Wellness', body: 'Explore nutrition, sleep, fitness, or longevity — knowledge that directly improves your daily life.' },
      { title: 'Spiritual or Philosophical', body: 'Stoicism, Buddhism, or whatever tradition speaks to you. The Meditations by Marcus Aurelius is always worth returning to.' },
      { title: 'Business & Entrepreneurship', body: 'Strategy, leadership, marketing, product. Apply what you read to your current work immediately.' },
      { title: 'Science & Curiosity', body: 'A book about the brain, the cosmos, biology, or any subject that sparks wonder and broadens your worldview.' },
      { title: 'Poetry or Creative Writing', body: 'A poem, a short story, or a passage of beautiful prose. Feeds a different part of the mind — equally valuable.' },
    ],
    daily: [
      { title: 'Personal Development', snippet: 'One idea from a book that makes you better. Apply it today.' },
      { title: 'Biography', snippet: 'Read about someone extraordinary. Their struggles will inspire yours.' },
      { title: 'Health & Wellness', snippet: 'Knowledge about sleep, nutrition, or fitness you can use immediately.' },
      { title: 'Stoic or Philosophy', snippet: 'A passage from Marcus Aurelius, Epictetus, or any wisdom tradition.' },
      { title: 'Business & Strategy', snippet: 'One concept from a business or leadership book applied to your work.' },
      { title: 'Science & Wonder', snippet: 'A chapter that expands your worldview and sparks curiosity.' },
      { title: 'Poetry or Prose', snippet: 'A poem or beautiful passage — nourishment for a different part of you.' },
    ],
  },
  {
    id: 'SC',
    letter: 'S',
    name: 'Scribing',
    icon: '✍️',
    tagline: 'Write to think and grow',
    instructions: `
      <p><strong>Scribing</strong> (journaling) is the SAVER that captures and consolidates everything else. Writing externalises your thoughts, making them concrete and actionable. It reduces anxiety, improves clarity, and creates a record of your growth over time.</p>
      <p>You don't need to be a good writer. You just need to be honest.</p>
      <p><strong>How to journal effectively:</strong></p>
      <ol>
        <li>Use a dedicated notebook or app — make it a special object you look forward to.</li>
        <li>Don't edit yourself. Write without stopping, crossing out, or judging.</li>
        <li>Choose a prompt or format for each session (see ideas) — blank pages can be intimidating.</li>
        <li>Date every entry so you can look back and track growth.</li>
        <li>End each session with one clear intention or action for the day.</li>
      </ol>
      <p>Re-reading past entries is one of the most powerful things you can do — you'll see how far you've come and remember things you'd otherwise forget.</p>
    `,
    ideas: [
      { title: 'Gratitude List', body: 'Write 3–5 specific things you\'re grateful for. Specific beats generic: "my daughter\'s laugh at breakfast" vs "my family".' },
      { title: 'Morning Pages', body: 'Stream-of-consciousness writing: 3 pages (or your full timer), no editing, no stopping. Clears mental clutter.' },
      { title: 'Goal & Intentions', body: 'Write your top 3 goals in the present tense. Then write your single most important task for today.' },
      { title: 'Yesterday\'s Wins', body: 'Reflect on what went well yesterday. What did you do that you\'re proud of? What did you learn?' },
      { title: 'Brain Dump', body: 'Empty your mind onto paper: worries, ideas, to-dos, random thoughts. Get it out so you can think clearly.' },
      { title: 'Future Self Letter', body: 'Write a letter from your ideal future self — 5 years from now — to the person you are today. What do they say?' },
      { title: 'Creative Story', body: 'Write freely about any topic: a memory, an imagined adventure, a character. Play with words. There are no rules.' },
    ],
    daily: [
      { title: 'Gratitude List', snippet: 'Write 3–5 specific things you\'re grateful for. Specific beats generic.' },
      { title: 'Morning Pages', snippet: 'Stream-of-consciousness — write non-stop until the timer ends.' },
      { title: 'Goals & Intentions', snippet: 'Your top 3 goals + the one most important thing you\'ll do today.' },
      { title: 'Yesterday\'s Wins', snippet: 'Reflect on what went well and what you\'re proud of from yesterday.' },
      { title: 'Brain Dump', snippet: 'Empty your mind: worries, ideas, to-dos. Clear the mental clutter.' },
      { title: 'Letter from Future Self', snippet: 'Write from your best future self to the person you are today.' },
      { title: 'Free Writing', snippet: 'No rules — write anything. A memory, a dream, a story, a rant.' },
    ],
  },
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
