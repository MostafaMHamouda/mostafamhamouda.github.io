import { ChallengePage } from '../components/ChallengePage';

export const ExplorationChallengePage = () => (
  <ChallengePage
    worldName="Exploration World"
    challengeTitle="Exploration World: The Listening Compass"
    themeColor="green"
    guardianName="Rahhal"
    loreIntro="In Exploration World, wrong turns do not always come from weak courage. Often they come from moving before listening. The Listening Compass points toward growth only when your team notices what others need, fear, and value."
    digitalPuzzle={
      <>
        <p>A team entered a new environment and chose a plan quickly, but trust faded before progress began.</p>
        <div>
          <p className="font-medium text-white">Rank the listening failures from most likely to least likely:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-200/82">
            <li>They explained their plan before hearing local concerns.</li>
            <li>They collected answers but never reflected them back.</li>
            <li>They assumed silence meant agreement.</li>
            <li>They asked what to do, but not what to avoid.</li>
          </ul>
        </div>
        <p>Then write one listening question that would build trust first.</p>
      </>
    }
    answerFields={[
      {
        id: 'listening-ranking',
        label: 'Listening failure ranking',
        placeholder: 'Which failure matters most first, and why?',
        type: 'textarea',
      },
      {
        id: 'trust-question',
        label: 'One trust-building listening question',
        placeholder: 'What should we understand before we act?',
        type: 'textarea',
      },
    ]}
    interactiveTaskTitle="Compass Circle"
    interactiveTaskInstructions={
      <div>
        <p>In pairs, practice a two-minute listening exchange:</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-200/82">
          <li>One person describes a challenge.</li>
          <li>The other may only ask clarifying questions.</li>
          <li>End by reflecting back the concern and one careful next step.</li>
        </ol>
      </div>
    }
    guardianInstructions={
      <div>
        <p>Go to Rahhal, Guardian of Discovery.</p>
        <p className="mt-2">Share the listening question your team chose and the reflection you would give back.</p>
        <p className="mt-2">If your answer shows care before direction, Rahhal will give you the code.</p>
      </div>
    }
    correctCode="PATH-CARE"
    unlockWorldKey="explorationUnlocked"
    unlockWorldSlug="exploration"
    scoreOnCompletion={6}
    streamName="Green Stream of Discovery"
    successMessage="The Green Current of Discovery returns. Exploration World has been restored."
    mapPieceMessage="The unknown is where growth begins."
    hintText="Listen for what matters to others before deciding the path."
  />
);
