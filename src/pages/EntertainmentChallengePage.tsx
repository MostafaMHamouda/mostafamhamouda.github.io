import { ChallengePage } from '../components/ChallengePage';

export const EntertainmentChallengePage = () => (
  <ChallengePage
    worldName="Entertainment World"
    challengeTitle="Entertainment World: The Story Loom"
    themeColor="gold"
    guardianName="Sharara"
    loreIntro="In Entertainment World, attention is not captured by noise alone. The Story Loom glows only when a message gains rhythm, emotion, and shape that people can carry with them."
    digitalPuzzle={
      <>
        <p>A team presented useful information, but the room forgot it within minutes.</p>
        <div>
          <p className="font-medium text-white">Rank the missing story elements from most damaging to least damaging:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-200/82">
            <li>There was no relatable character or audience point of view.</li>
            <li>The ending did not leave a clear takeaway.</li>
            <li>The sequence jumped to facts before creating curiosity.</li>
            <li>The team used details without emotional contrast.</li>
          </ul>
        </div>
        <p>Then write one line that would make the audience want to keep listening.</p>
      </>
    }
    answerFields={[
      {
        id: 'story-ranking',
        label: 'Story element ranking',
        placeholder: 'Explain the order you chose.',
        type: 'textarea',
      },
      {
        id: 'hook-line',
        label: 'One opening hook line',
        placeholder: 'Write a line that creates curiosity.',
        type: 'textarea',
      },
    ]}
    interactiveTaskTitle="Spark Thread"
    interactiveTaskInstructions={
      <div>
        <p>Build a 20-second micro-story with three parts:</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-200/82">
          <li>A beginning that creates curiosity.</li>
          <li>A middle that raises tension or surprise.</li>
          <li>An ending that leaves one memorable insight.</li>
        </ol>
      </div>
    }
    guardianInstructions={
      <div>
        <p>Go to Sharara, Guardian of Expression.</p>
        <p className="mt-2">Perform or read your strongest version of the micro-story.</p>
        <p className="mt-2">If it carries light, shape, and feeling, Sharara will give you the code.</p>
      </div>
    }
    correctCode="STORY-LIGHTS"
    unlockWorldKey="entertainmentUnlocked"
    unlockWorldSlug="entertainment"
    scoreOnCompletion={6}
    streamName="Yellow Stream of Expression"
    successMessage="The Golden Weave of Imagination shines again. Entertainment World has been restored."
    mapPieceMessage="Creativity gives light to the human spirit."
    hintText="Facts matter less if no one feels the reason to remember them."
  />
);
