import { Challenge, SpiceLevel } from '@/lib/supabase';

export interface CardContent {
  id: string;
  challenge: Challenge;
  spice: SpiceLevel;
}

export const CARD_CONTENT: CardContent[] = [
  // ============ MILD ============
  // Truths
  { id: 'mild-t1', spice: 'mild', challenge: { type: 'truth', text: 'What was your first impression of me?', intensity: 1 } },
  { id: 'mild-t2', spice: 'mild', challenge: { type: 'truth', text: 'What is your favorite memory of us together?', intensity: 1 } },
  { id: 'mild-t3', spice: 'mild', challenge: { type: 'truth', text: 'What outfit of mine do you love the most?', intensity: 1 } },
  { id: 'mild-t4', spice: 'mild', challenge: { type: 'truth', text: 'When did you first realize you had feelings for me?', intensity: 1 } },
  { id: 'mild-t5', spice: 'mild', challenge: { type: 'truth', text: 'What song reminds you of me?', intensity: 1 } },
  { id: 'mild-t6', spice: 'mild', challenge: { type: 'truth', text: 'What is one thing I do that always makes you smile?', intensity: 1 } },
  { id: 'mild-t7', spice: 'mild', challenge: { type: 'truth', text: 'What was going through your mind on our first date?', intensity: 1 } },
  { id: 'mild-t8', spice: 'mild', challenge: { type: 'truth', text: 'What is your favorite physical feature of mine?', intensity: 1 } },

  // Dares
  { id: 'mild-d1', spice: 'mild', challenge: { type: 'dare', text: 'Give your partner a slow, lingering kiss that lasts at least 30 seconds.', intensity: 1 } },
  { id: 'mild-d2', spice: 'mild', challenge: { type: 'dare', text: 'Whisper something sweet in your partner\'s ear.', intensity: 1 } },
  { id: 'mild-d3', spice: 'mild', challenge: { type: 'dare', text: 'Slow dance with your partner for one full song, no matter where you are.', intensity: 1 } },
  { id: 'mild-d4', spice: 'mild', challenge: { type: 'dare', text: 'Stare deeply into your partner\'s eyes for 60 seconds without looking away.', intensity: 1 } },
  { id: 'mild-d5', spice: 'mild', challenge: { type: 'dare', text: 'Give your partner a gentle shoulder massage for 2 minutes.', intensity: 1 } },
  { id: 'mild-d6', spice: 'mild', challenge: { type: 'dare', text: 'Feed your partner a bite of food or a sip of a drink.', intensity: 1 } },
  { id: 'mild-d7', spice: 'mild', challenge: { type: 'dare', text: 'Hold your partner\'s hand and describe what you love about them.', intensity: 1 } },
  { id: 'mild-d8', spice: 'mild', challenge: { type: 'dare', text: 'Leave a trail of kisses from your partner\'s neck to their shoulder.', intensity: 1 } },

  // Would You Rather
  { id: 'mild-w1', spice: 'mild', challenge: { type: 'wyr', text: 'Would you rather cuddle all night or have an adventurous date night out?', intensity: 1 } },
  { id: 'mild-w2', spice: 'mild', challenge: { type: 'wyr', text: 'Would you rather receive a love letter or a surprise gift?', intensity: 1 } },
  { id: 'mild-w3', spice: 'mild', challenge: { type: 'wyr', text: 'Would you rather cook dinner together or order takeout and watch a movie?', intensity: 1 } },
  { id: 'mild-w4', spice: 'mild', challenge: { type: 'wyr', text: 'Would you rather slow dance in the rain or under the stars?', intensity: 1 } },
  { id: 'mild-w5', spice: 'mild', challenge: { type: 'wyr', text: 'Would you rather kiss in the morning or at midnight?', intensity: 1 } },
  { id: 'mild-w6', spice: 'mild', challenge: { type: 'wyr', text: 'Would you rather always know what your partner is thinking or always feel what they feel?', intensity: 1 } },

  // Act
  { id: 'mild-a1', spice: 'mild', challenge: { type: 'act', text: 'Recreate the moment you first said "I love you" to each other.', intensity: 1 } },
  { id: 'mild-a2', spice: 'mild', challenge: { type: 'act', text: 'Show your partner exactly how you like to be kissed — demonstrate on them.', intensity: 1 } },
  { id: 'mild-a3', spice: 'mild', challenge: { type: 'act', text: 'Pretend it is your first date all over again. Introduce yourself and flirt.', intensity: 1 } },
  { id: 'mild-a4', spice: 'mild', challenge: { type: 'act', text: 'Compliment your partner slowly from head to toe.', intensity: 1 } },

  // ============ MEDIUM ============
  // Truths
  { id: 'med-t1', spice: 'medium', challenge: { type: 'truth', text: 'What is your biggest turn-on that you have not told me about yet?', intensity: 2 } },
  { id: 'med-t2', spice: 'medium', challenge: { type: 'truth', text: 'What is a fantasy you have had about us that you have never shared?', intensity: 2 } },
  { id: 'med-t3', spice: 'medium', challenge: { type: 'truth', text: 'What was the most attractive moment you have experienced with me?', intensity: 2 } },
  { id: 'med-t4', spice: 'medium', challenge: { type: 'truth', text: 'Where is the most unexpected place you have thought about being intimate with me?', intensity: 2 } },
  { id: 'med-t5', spice: 'medium', challenge: { type: 'truth', text: 'What is something I wear that instantly makes you want me?', intensity: 2 } },
  { id: 'med-t6', spice: 'medium', challenge: { type: 'truth', text: 'What do you think about when you look at me from across the room?', intensity: 2 } },
  { id: 'med-t7', spice: 'medium', challenge: { type: 'truth', text: 'What is one thing you want us to try that we have not done yet?', intensity: 2 } },
  { id: 'med-t8', spice: 'medium', challenge: { type: 'truth', text: 'When was the last time you wanted me but could not say it?', intensity: 2 } },

  // Dares
  { id: 'med-d1', spice: 'medium', challenge: { type: 'dare', text: 'Kiss your partner passionately while slowly running your fingers through their hair.', intensity: 2 } },
  { id: 'med-d2', spice: 'medium', challenge: { type: 'dare', text: 'Remove one piece of clothing — your partner gets to choose which one.', intensity: 2 } },
  { id: 'med-d3', spice: 'medium', challenge: { type: 'dare', text: 'Sit on your partner\'s lap and whisper three things you want to do to them.', intensity: 2 } },
  { id: 'med-d4', spice: 'medium', challenge: { type: 'dare', text: 'Give your partner a slow kiss on the neck that lasts 15 seconds.', intensity: 2 } },
  { id: 'med-d5', spice: 'medium', challenge: { type: 'dare', text: 'Trace your partner\'s lips with your finger, then kiss them softly.', intensity: 2 } },
  { id: 'med-d6', spice: 'medium', challenge: { type: 'dare', text: 'Blindfold yourself (or close your eyes) and let your partner guide your hands anywhere they want for 30 seconds.', intensity: 2 } },
  { id: 'med-d7', spice: 'medium', challenge: { type: 'dare', text: 'Whisper exactly what you want to do next time you are alone together.', intensity: 2 } },
  { id: 'med-d8', spice: 'medium', challenge: { type: 'dare', text: 'Kiss your partner somewhere you have never kissed them before.', intensity: 2 } },

  // Would You Rather
  { id: 'med-w1', spice: 'medium', challenge: { type: 'wyr', text: 'Would you rather be teased all night or go straight to the main event?', intensity: 2 } },
  { id: 'med-w2', spice: 'medium', challenge: { type: 'wyr', text: 'Would you rather have a passionate quickie or a slow, sensual marathon?', intensity: 2 } },
  { id: 'med-w3', spice: 'medium', challenge: { type: 'wyr', text: 'Would you rather be in control or let your partner take complete control?', intensity: 2 } },
  { id: 'med-w4', spice: 'medium', challenge: { type: 'wyr', text: 'Would you rather kiss with music playing in the dark or in candlelight in silence?', intensity: 2 } },
  { id: 'med-w5', spice: 'medium', challenge: { type: 'wyr', text: 'Would you rather try something new and risky or stick with what you know works?', intensity: 2 } },
  { id: 'med-w6', spice: 'medium', challenge: { type: 'wyr', text: 'Would you rather be kissed on the neck or on the collarbone?', intensity: 2 } },

  // Act
  { id: 'med-a1', spice: 'medium', challenge: { type: 'act', text: 'Show your partner how you want to be touched — guide their hand.', intensity: 2 } },
  { id: 'med-a2', spice: 'medium', challenge: { type: 'act', text: 'Reenact your hottest memory together, starting from the very beginning.', intensity: 2 } },
  { id: 'med-a3', spice: 'medium', challenge: { type: 'act', text: 'Slowly unzip or unbutton one layer of your partner\'s clothing while maintaining eye contact.', intensity: 2 } },
  { id: 'med-a4', spice: 'medium', challenge: { type: 'act', text: 'Write a word on your partner\'s skin with your fingertip and let them guess what it is.', intensity: 2 } },

  // Reveal
  { id: 'med-r1', spice: 'medium', challenge: { type: 'reveal', text: 'Reveal your phone lock screen to your partner for 10 seconds.', intensity: 2 } },
  { id: 'med-r2', spice: 'medium', challenge: { type: 'reveal', text: 'Show your partner the last photo you took of them.', intensity: 2 } },
  { id: 'med-r3', spice: 'medium', challenge: { type: 'reveal', text: 'Let your partner choose one app on your phone to open.', intensity: 2 } },

  // ============ HOT ============
  // Truths
  { id: 'hot-t1', spice: 'hot', challenge: { type: 'truth', text: 'Describe in detail your most intense fantasy involving me.', intensity: 3 } },
  { id: 'hot-t2', spice: 'hot', challenge: { type: 'truth', text: 'What is the wildest thing you want us to try behind closed doors?', intensity: 3 } },
  { id: 'hot-t3', spice: 'hot', challenge: { type: 'truth', text: 'What part of my body do you crave the most right now?', intensity: 3 } },
  { id: 'hot-t4', spice: 'hot', challenge: { type: 'truth', text: 'Tell me exactly what you were thinking the last time we were intimate.', intensity: 3 } },
  { id: 'hot-t5', spice: 'hot', challenge: { type: 'truth', text: 'What is something you have watched or read that you want to recreate with me?', intensity: 3 } },
  { id: 'hot-t6', spice: 'hot', challenge: { type: 'truth', text: 'If you could have me any way you wanted right now, what would you do first?', intensity: 3 } },
  { id: 'hot-t7', spice: 'hot', challenge: { type: 'truth', text: 'What is one place you want us to be intimate that we have not tried yet?', intensity: 3 } },
  { id: 'hot-t8', spice: 'hot', challenge: { type: 'truth', text: 'What is the most provocative thought you have had about me today?', intensity: 3 } },

  // Dares
  { id: 'hot-d1', spice: 'hot', challenge: { type: 'dare', text: 'Strip down to one item of clothing and let your partner explore for 60 seconds.', intensity: 3 } },
  { id: 'hot-d2', spice: 'hot', challenge: { type: 'dare', text: 'Kiss your partner slowly from their collarbone down to their waistline.', intensity: 3 } },
  { id: 'hot-d3', spice: 'hot', challenge: { type: 'dare', text: 'Straddle your partner and kiss them deeply for one full minute — no hands allowed.', intensity: 3 } },
  { id: 'hot-d4', spice: 'hot', challenge: { type: 'dare', text: 'Using only your mouth, remove one item of clothing from your partner.', intensity: 3 } },
  { id: 'hot-d5', spice: 'hot', challenge: { type: 'dare', text: 'Whisper your dirtiest thought about your partner directly in their ear.', intensity: 3 } },
  { id: 'hot-d6', spice: 'hot', challenge: { type: 'dare', text: 'Let your partner blindfold you and do whatever they want for 2 minutes.', intensity: 3 } },
  { id: 'hot-d7', spice: 'hot', challenge: { type: 'dare', text: 'Give your partner a sensual massage wherever they choose for 3 minutes.', intensity: 3 } },
  { id: 'hot-d8', spice: 'hot', challenge: { type: 'dare', text: 'Take off one item of your partner\'s clothing using only one hand.', intensity: 3 } },

  // Would You Rather
  { id: 'hot-w1', spice: 'hot', challenge: { type: 'wyr', text: 'Would you rather be blindfolded the entire time or handcuffed the entire time?', intensity: 3 } },
  { id: 'hot-w2', spice: 'hot', challenge: { type: 'wyr', text: 'Would you rather be teased mercilessly for an hour or have instant gratification whenever you want?', intensity: 3 } },
  { id: 'hot-w3', spice: 'hot', challenge: { type: 'wyr', text: 'Would you rather try something new in the bedroom or in a risky public place?', intensity: 3 } },
  { id: 'hot-w4', spice: 'hot', challenge: { type: 'wyr', text: 'Would you rather have a slow, teasing night or a wild, passionate quickie right now?', intensity: 3 } },
  { id: 'hot-w5', spice: 'hot', challenge: { type: 'wyr', text: 'Would you rather be dominant tonight or completely submissive?', intensity: 3 } },
  { id: 'hot-w6', spice: 'hot', challenge: { type: 'wyr', text: 'Would you rather have ice or warm oil used on you next?', intensity: 3 } },

  // Act
  { id: 'hot-a1', spice: 'hot', challenge: { type: 'act', text: 'Show your partner exactly how you want to be kissed — demonstrate, do not explain.', intensity: 3 } },
  { id: 'hot-a2', spice: 'hot', challenge: { type: 'act', text: 'Slowly and seductively remove one item of your own clothing while your partner watches.', intensity: 3 } },
  { id: 'hot-a3', spice: 'hot', challenge: { type: 'act', text: 'Pull your partner close and kiss them like it is the last night on earth.', intensity: 3 } },
  { id: 'hot-a4', spice: 'hot', challenge: { type: 'act', text: 'Write your wildest desire on your partner\'s skin with your fingertip and let them guess.', intensity: 3 } },

  // Reveal
  { id: 'hot-r1', spice: 'hot', challenge: { type: 'reveal', text: 'Let your partner look through your recent search history for 30 seconds.', intensity: 3 } },
  { id: 'hot-r2', spice: 'hot', challenge: { type: 'reveal', text: 'Show your partner the most provocative photo of yourself on your phone.', intensity: 3 } },
  { id: 'hot-r3', spice: 'hot', challenge: { type: 'reveal', text: 'Let your partner read your last 5 messages about them to anyone.', intensity: 3 } },
];

export function getAvailableCards(spice: SpiceLevel, usedIds: string[]): CardContent[] {
  return CARD_CONTENT.filter(
    (card) => card.spice === spice && !usedIds.includes(card.id)
  );
}

export function getRandomCard(spice: SpiceLevel, usedIds: string[]): CardContent | null {
  const available = getAvailableCards(spice, usedIds);
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export const CHALLENGE_META: Record<Challenge['type'], { label: string; color: string; icon: string; bg: string; border: string }> = {
  truth: { label: 'Truth', color: 'text-rose-300', bg: 'bg-rose-950/60', border: 'border-rose-500/40', icon: 'MessageCircleHeart' },
  dare: { label: 'Dare', color: 'text-orange-300', bg: 'bg-orange-950/60', border: 'border-orange-500/40', icon: 'Flame' },
  wyr: { label: 'Would You Rather', color: 'text-amber-300', bg: 'bg-amber-950/60', border: 'border-amber-500/40', icon: 'HelpCircle' },
  act: { label: 'Act It Out', color: 'text-pink-300', bg: 'bg-pink-950/60', border: 'border-pink-500/40', icon: 'Drama' },
  reveal: { label: 'Reveal', color: 'text-fuchsia-300', bg: 'bg-fuchsia-950/60', border: 'border-fuchsia-500/40', icon: 'Eye' },
};
