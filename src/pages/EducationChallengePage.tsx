import { ChallengePage } from '../components/ChallengePage';

export const EducationChallengePage = () => (
  <ChallengePage
    worldName="Education World"
    challengeTitle="Education World: The Mirror of Misunderstanding"
    themeColor="blue"
    guardianName="Fahim"
    loreIntro="In Education World, the Mirror of Misunderstanding does not simply reveal that an answer is wrong. It reveals why the learner thought that way. To restore this part of the Living Map, your team must look beyond quick answers and search for the question that opens understanding."
    digitalPuzzle={
      <>
        <p>
          A team received a mission and failed to complete it. Their first explanation was:{' '}
          <span className="font-medium text-white">"We did not have enough time."</span>
        </p>
        <div>
          <p className="font-medium text-white">Rank the hidden reasons from most likely to least likely:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-200/82">
            <li>The goal was unclear.</li>
            <li>Roles were not distributed.</li>
            <li>One person dominated the decision.</li>
            <li>The team started before agreeing on success criteria.</li>
          </ul>
        </div>
        <p>Then write one question that could have prevented the failure.</p>
      </>
    }
    answerFields={[
      {
        id: 'reason-ranking',
        label: 'Reason ranking',
        placeholder: 'Example: 1) ... 2) ... 3) ... 4) ...',
        type: 'textarea',
      },
      {
        id: 'preventive-question',
        label: 'One question that could have prevented the failure',
        placeholder: 'What should we clarify before we begin?',
        type: 'textarea',
      },
    ]}
    interactiveTaskTitle="The Question Door"
    interactiveTaskInstructions={
      <div>
        <p>Before solving the next situation, write three questions:</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-200/82">
          <li>One question about the goal.</li>
          <li>One question about the people affected.</li>
          <li>One question about success criteria.</li>
        </ol>
      </div>
    }
    guardianInstructions={
      <div>
        <p>Go to Fahim, Guardian of Knowledge.</p>
        <p className="mt-2">Share your strongest question.</p>
        <p className="mt-2">
          If your question opens clearer understanding, Fahim will give you the code.
        </p>
      </div>
    }
    correctCode="WHY-OPENS"
    unlockWorldKey="educationUnlocked"
    unlockWorldSlug="education"
    scoreOnCompletion={6}
    streamName="Blue Stream of Understanding"
    successMessage="The Blue Stream of Understanding flows again. Education World has been restored."
    mapPieceMessage="Every question opens a new world."
    hintText="Do not solve too fast. Ask what is unclear first."
  />
);
