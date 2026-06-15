import { FogTrapPage } from '../components/FogTrapPage';

export const FogPerfectAnswerPage = () => (
  <FogTrapPage
    id="perfect-answer"
    title="Fog Trap: The Perfect Answer"
    fogMessage="Fog loves fast answers. Choose quickly. Do not waste time asking better questions."
    taskContent={
      <>
        <p>This question is missing context:</p>
        <p className="font-medium text-white">"What is the best activity for the team?"</p>
        <p>Write two questions you need before answering.</p>
      </>
    }
    answerFields={[
      {
        id: 'question-one',
        label: 'Question one',
        placeholder: 'What do we need to know first?',
        type: 'textarea',
      },
      {
        id: 'question-two',
        label: 'Question two',
        placeholder: 'What second question would reduce confusion?',
        type: 'textarea',
      },
    ]}
    clue="The team that asks better questions finds the blue path. Look for the gate of Education World."
    scoreOnCompletion={1}
  />
);
