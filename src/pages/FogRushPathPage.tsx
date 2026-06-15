import { FogTrapPage } from '../components/FogTrapPage';

export const FogRushPathPage = () => (
  <FogTrapPage
    id="rush-path"
    title="Fog Trap: The Rush Path"
    fogMessage="Move fast. The first direction is always right."
    taskContent={
      <>
        <p>Show symbol sequence:</p>
        <p className="font-medium text-white">Question → Spark → Build → Path → Question → Spark → ?</p>
        <p>What comes next?</p>
      </>
    }
    answerFields={[
      {
        id: 'next-symbol',
        label: 'What comes next?',
        placeholder: 'Type the next symbol in the sequence.',
        type: 'text',
      },
    ]}
    correctAnswer="Build"
    clue="Observation opens the green path. Find the Listening Compass."
    wrongAnswerMessage="Fog smiles. Look again at the pattern."
    successMessage="Observation opens the green path. Find the Listening Compass."
    scoreOnCompletion={1}
  />
);
