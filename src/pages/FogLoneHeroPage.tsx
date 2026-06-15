import { FogTrapPage } from '../components/FogTrapPage';

export const FogLoneHeroPage = () => (
  <FogTrapPage
    id="lone-hero"
    title="Fog Trap: The Lone Hero"
    fogMessage="The fastest hero does not need a team."
    taskContent={
      <>
        <p>The Pathfinder and Scanner cannot answer this one.</p>
        <p>Ask the quietest person in your team to choose your next direction.</p>
      </>
    }
    answerFields={[
      {
        id: 'person-name',
        label: 'Quiet team member name',
        placeholder: 'Who chose the next direction?',
        type: 'text',
      },
      {
        id: 'direction-chosen',
        label: 'Direction chosen',
        placeholder: 'What direction did they choose?',
        type: 'textarea',
      },
    ]}
    clue="Alone, you are bright. Together, you are balance."
    scoreOnCompletion={1}
  />
);
