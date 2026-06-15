import { BonusQuestPage } from '../components/BonusQuestPage';

export const BonusBadgeConstellationPage = () => (
  <BonusQuestPage
    id="badge-constellation"
    title="Bonus Quest: Badge Constellation"
    instructions={
      <>
        <p>
          Each team member gives another member one growth badge based on something they noticed during the quest.
        </p>
        <div>
          <p className="font-medium text-white">Badge examples:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-100/82">
            <li>Brave Question Badge</li>
            <li>Clear Voice Badge</li>
            <li>Calm Thinker Badge</li>
            <li>Creative Spark Badge</li>
            <li>Team Bond Badge</li>
            <li>Careful Observer Badge</li>
          </ul>
        </div>
      </>
    }
    answerFields={[
      {
        id: 'badge-one',
        label: 'Badge one and why',
        placeholder: 'Who received it, what badge, and why?',
        type: 'textarea',
      },
      {
        id: 'badge-two',
        label: 'Badge two and why',
        placeholder: 'Who received it, what badge, and why?',
        type: 'textarea',
      },
    ]}
    successMessage="Your team added new stars to the Badge Constellation."
  />
);
