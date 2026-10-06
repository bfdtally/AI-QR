export const questions = [
  'When I use AI to help me study, I ask it to explain ideas I do not understand rather than simply give me the answer.',
  'I check important information produced by AI against my textbook, course materials, instructor guidance, or another reliable source.',
  'I use AI to practice learning—for example, generating quizzes, flashcards, practice questions, examples, or explanations.',
  'Before submitting AI-assisted work, I make sure I can explain the ideas in my own words without relying on AI.',
  'I make my own decisions about what to keep, change, or reject when AI gives me information or creates something for me.',
] as const;
export const questionLabels = ['Ask for explanations', 'Check reliable sources', 'Practice learning', 'Explain in my own words', 'Make my own decisions'];
export const programs = ['Elementary Education', 'Mathematics Education', 'Science Education', 'Social Science Education', 'Physical Education', 'Health, Leisure & Fitness', 'Other / Undecided'] as const;
export const scale = ['Never', 'Sometimes', 'Often', 'Almost Always'] as const;
export const categories = ['AI Study Strategist', 'AI Explorer', 'AI Shortcut Surfer', 'AI Rookie'] as const;
export const descriptions = [
  'You are using AI as a learning partner rather than simply an answer machine.',
  'You are finding productive ways to use AI, but there are opportunities to make your studying more active and intentional.',
  'AI is helping you move quickly, but speed can sometimes replace learning. Shift more of the thinking back to yourself.',
  'You are beginning to develop an AI study strategy. The goal is not simply to use AI more—it is to use it more intentionally.',
] as const;
export const nextSteps = [
  'Keep asking “why?” Try teaching an AI-assisted idea to a classmate, then check what you still need to understand.',
  'Turn your next AI explanation into a practice quiz. Answer from memory before checking the feedback.',
  'Before asking AI, try the problem yourself. Then ask for a hint or an explanation of the next step.',
  'Start with one idea from class. Ask AI to explain it, check your course materials, and put it into your own words.',
] as const;
export function scoreResponses(responses: readonly number[]) {
  if (responses.length !== 5 || responses.some(v => !Number.isInteger(v) || v < 1 || v > 4)) {
    throw new Error('Please answer all five questions using the 1–4 scale.');
  }
  const total = responses.reduce((sum, n) => sum + n, 0);
  const index = total >= 17 ? 0 : total >= 13 ? 1 : total >= 9 ? 2 : 3;
  return { total, category: categories[index], description: descriptions[index], nextStep: nextSteps[index] };
}
