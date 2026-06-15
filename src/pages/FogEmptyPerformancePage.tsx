import { FogTrapPage } from '../components/FogTrapPage';

export const FogEmptyPerformancePage = () => (
  <FogTrapPage
    id="empty-performance"
    title="Fog Trap: The Empty Performance"
    fogMessage="Make people laugh and the mission is complete."
    taskContent={
      <p>What is the difference between entertainment with meaning and noise?</p>
    }
    answerFields={[
      {
        id: 'meaning-vs-noise',
        label: 'Your answer',
        placeholder: 'Describe the difference between meaningful entertainment and empty noise.',
        type: 'textarea',
      },
    ]}
    clue="The stage that teaches is waiting in Shararaland."
    scoreOnCompletion={1}
  />
);
