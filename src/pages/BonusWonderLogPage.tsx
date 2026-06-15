import { BonusQuestPage } from '../components/BonusQuestPage';

export const BonusWonderLogPage = () => (
  <BonusQuestPage
    id="wonder-log"
    title="Bonus Quest: Wonder Log"
    instructions={
      <p>Write one question your team wants to explore during the Learnova training journey.</p>
    }
    answerFields={[
      {
        id: 'wonder-question',
        label: 'Question to explore',
        placeholder: 'What question does your team want to keep exploring?',
        type: 'textarea',
      },
    ]}
    successMessage="A new Question Light has appeared."
  />
);
