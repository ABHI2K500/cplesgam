import type { Intensity, SoundPrompt, TruthDareCard } from '@/types/game';

export const TRUTH_PROMPTS: Record<Intensity, string[]> = {
  flirty: [
    'What is the first thing you noticed about me?',
    'What is a compliment you have been waiting to give me?',
    'When did you first realize you had a crush on me?',
    'What is your favorite memory of us together?',
    'Which of my features do you find most irresistible?',
    'What is a small thing I do that always makes you smile?',
  ],
  hot: [
    'Where is the one place you have always wanted me to kiss you?',
    'What is the most daring thing you have ever thought about doing with me?',
    'Which outfit of mine do you find impossible to resist?',
    'What is your favorite way for me to get your attention?',
    'Describe the most electric kiss we have shared, in slow detail.',
    'What is one thing I do that makes you lose your focus completely?',
  ],
  spicy: [
    'What is a fantasy you have never told me about?',
    'What is the most unexpected place you would love for us to be intimate?',
    'What is the boldest thing you want me to whisper in your ear?',
    'Rate my kissing from 1 to 10, then tell me how to score higher.',
    'What is a touch you secretly love that I probably have not discovered yet?',
    'What is one thing you want me to do tonight that you have been too shy to ask for?',
  ],
};

export const DARE_PROMPTS: Record<Intensity, string[]> = {
  flirty: [
    'Give your partner a 60-second shoulder massage.',
    'Write a love note on your phone and read it aloud with a straight face.',
    'Slow dance together to a song you both love, without speaking.',
    'Hold your partner\'s gaze for 30 seconds without laughing.',
  ],
  hot: [
    'Kiss your partner somewhere they do not expect for 10 seconds.',
    'Give your partner a slow, teasing kiss along the neck.',
    'Let your partner choose one piece of your clothing to remove.',
    'Whisper three things you find attractive about your partner into their ear.',
  ],
  spicy: [
    'Blindfold yourself and let your partner guide you through a sensual touch test.',
    'Let your partner draw on your skin with a lipstick, then kiss it off one line at a time.',
    'Swap one piece of clothing with your partner and keep it on for the next round.',
    'Give your partner a full massage using only your breath and lips.',
  ],
};

export const SOUND_PROMPTS: SoundPrompt[] = [
  { category: 'Animal', text: 'Purr like a very happy cat for 10 seconds.', intensity: 'flirty' },
  { category: 'Opera', text: 'Sing one line of a love song as if you are on a grand stage.', intensity: 'flirty' },
  { category: 'Dessert', text: 'Make the sound of tasting the most delicious dessert you have ever had.', intensity: 'hot' },
  { category: 'Secret', text: 'Whisper your partner\'s name like it is a secret you cannot keep.', intensity: 'hot' },
  { category: 'Sigh', text: 'Let out the most sultry sigh you can manage, then hold it for three seconds.', intensity: 'hot' },
  { category: 'Massage', text: 'Groan softly as if your partner just found the perfect spot on your back.', intensity: 'spicy' },
  { category: 'Surprise', text: 'Gasp as if something unexpected just happened, then whisper "more".', intensity: 'spicy' },
  { category: 'Confession', text: 'Moan a single word that describes how you feel about your partner right now.', intensity: 'spicy' },
];

export const DEFAULT_WHEEL_DARES: string[] = [
  'Kiss your partner for 20 seconds',
  'Give a 1-minute massage',
  'Send a flirty text to your partner in the same room',
  'Dance to the song of your partner\'s choice',
  'Speak only in whispers for the next round',
  'Do your best impression of your partner',
  'Feed your partner a bite of something sweet',
  'Pick a new outfit for your partner to wear',
];

export const SOUND_CHALLENGE_SECONDS = 30;

export const MAX_WHEEL_DARES = 12;
export const MIN_WHEEL_DARES = 2;
export const MAX_DARE_LENGTH = 120;

export function pickRandom<T>(items: T[], avoid?: T): T {
  const pool = avoid !== undefined && items.length > 1 ? items.filter((item) => item !== avoid) : items;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function drawTruthOrDare(kind: TruthDareCard['kind'], intensity: Intensity, avoidText?: string): TruthDareCard {
  const deck = kind === 'truth' ? TRUTH_PROMPTS[intensity] : DARE_PROMPTS[intensity];
  return { kind, text: pickRandom(deck, avoidText) };
}

export function drawSoundPrompt(avoidText?: string): SoundPrompt {
  const pool = SOUND_PROMPTS.filter((prompt) => prompt.text !== avoidText);
  return pickRandom(pool.length > 0 ? pool : SOUND_PROMPTS);
}
