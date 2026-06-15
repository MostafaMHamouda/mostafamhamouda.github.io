import { ChallengePage } from '../components/ChallengePage';

export const EntrepreneurshipChallengePage = () => (
  <ChallengePage
    worldName="Entrepreneurship World"
    challengeTitle="Entrepreneurship World: The Market of Needs"
    themeColor="red"
    guardianName="Riyada"
    loreIntro="In Entrepreneurship World, bright ideas fade quickly when they are built for admiration instead of need. The Market of Needs only opens for teams that can hear the real problem beneath the noise."
    digitalPuzzle={
      <>
        <p>
          A team wants to launch a study-planning app. Early reactions sound positive, but usage disappears after two days.
        </p>
        <div>
          <p className="font-medium text-white">Rank these signals from most urgent to investigate to least urgent:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-200/82">
            <li>Users say the reminders feel generic.</li>
            <li>The team designed features before interviewing trainees.</li>
            <li>Only one teammate spoke to potential users.</li>
            <li>Success was measured by downloads instead of repeated use.</li>
          </ul>
        </div>
        <p>Then write the one need you would test first.</p>
      </>
    }
    answerFields={[
      {
        id: 'signal-ranking',
        label: 'Signal ranking',
        placeholder: 'Order the signals from most urgent to least urgent.',
        type: 'textarea',
      },
      {
        id: 'core-need',
        label: 'Need to test first',
        placeholder: 'What real problem are we solving for trainees?',
        type: 'textarea',
      },
    ]}
    interactiveTaskTitle="Need Lens"
    interactiveTaskInstructions={
      <div>
        <p>Choose one office workflow and write:</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-200/82">
          <li>Who feels the friction most.</li>
          <li>What they are trying to achieve.</li>
          <li>What proof would show your idea is useful.</li>
        </ol>
      </div>
    }
    guardianInstructions={
      <div>
        <p>Go to Riyada, Guardian of Enterprise.</p>
        <p className="mt-2">Share the need you chose and how you would validate it.</p>
        <p className="mt-2">If your answer is grounded in a real human need, Riyada will give you the code.</p>
      </div>
    }
    correctCode="NEED-BUILDS"
    unlockWorldKey="entrepreneurshipUnlocked"
    unlockWorldSlug="entrepreneurship"
    scoreOnCompletion={6}
    streamName="Red Stream of Initiative"
    successMessage="The Red Pulse of Initiative returns. Entrepreneurship World has been restored."
    mapPieceMessage="Every challenge hides an opportunity."
    hintText="Do not start from the idea. Start from the friction someone actually feels."
  />
);
