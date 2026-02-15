type Persona = 'ghost' | 'space' | 'fairy' | 'neutral';
type Urgency = 'whenever' | 'soon' | 'asap';

interface MessageParams {
  persona: Persona;
  categoryLabel: string;
  eventLabel: string;
  urgency: Urgency;
}

const personaIntros = {
  ghost: '👁️ BigBrother:',
  space: '🛰️ House Ops:',
  fairy: '🧚 House Fairy:',
  neutral: '🔔 System:',
};

const urgencyModifiers = {
  whenever: '',
  soon: ' (when you get a chance)',
  asap: ' (kindly requesting prompt attention)',
};

/**
 * Generate a simple, clean notification message
 * Format: "👁️ BigBrother: Category — Event."
 */
export function generateMessage({ persona, categoryLabel, eventLabel, urgency }: MessageParams): string {
  const intro = personaIntros[persona];
  const urgencyMsg = urgencyModifiers[urgency];

  return `${intro} ${categoryLabel} — ${eventLabel}.${urgencyMsg}`;
}

export const PERSONAS = ['ghost', 'space', 'fairy', 'neutral'] as const;

export const PERSONA_LABELS: Record<Persona, string> = {
  ghost: '👻 Ghost',
  space: '🛰️ Space Station',
  fairy: '🧚 House Fairy',
  neutral: '🔔 Neutral System',
};

export const URGENCY_OPTIONS = [
  { value: 'whenever', label: 'Whenever' },
  { value: 'soon', label: 'Soon' },
  { value: 'asap', label: 'ASAP (still polite)' },
] as const;
