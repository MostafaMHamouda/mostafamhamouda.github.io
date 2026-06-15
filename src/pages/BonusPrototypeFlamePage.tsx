import { BonusQuestPage } from '../components/BonusQuestPage';

export const BonusPrototypeFlamePage = () => (
  <BonusQuestPage
    id="prototype-flame"
    title="Bonus Quest: Prototype Flame"
    instructions={
      <p>Choose one small idea from today’s game and suggest how to test it in 10 minutes or less.</p>
    }
    answerFields={[
      {
        id: 'idea',
        label: 'Idea',
        placeholder: 'What small idea do you want to test?',
        type: 'textarea',
      },
      {
        id: 'test',
        label: '10-minute test',
        placeholder: 'How would you test it in 10 minutes or less?',
        type: 'textarea',
      },
    ]}
    successMessage="The Prototype Flame burns brighter when ideas are tested."
  />
);
