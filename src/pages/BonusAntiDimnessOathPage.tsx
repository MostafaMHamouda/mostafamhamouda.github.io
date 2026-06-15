import { BonusQuestPage } from '../components/BonusQuestPage';

export const BonusAntiDimnessOathPage = () => (
  <BonusQuestPage
    id="anti-dimness-oath"
    title="Bonus Quest: Anti-Dimness Oath"
    instructions={
      <>
        <p>Write one team rule that will help you fight Fog during the rest of the training.</p>
        <div>
          <p className="font-medium text-white">Examples:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-100/82">
            <li>Ask before judging.</li>
            <li>Test before scaling.</li>
            <li>Give space to the quiet voice.</li>
            <li>Turn mistakes into maps.</li>
            <li>Keep fun connected to meaning.</li>
          </ul>
        </div>
      </>
    }
    answerFields={[
      {
        id: 'team-rule',
        label: 'Your team rule',
        placeholder: 'Write the oath your team wants to carry forward.',
        type: 'textarea',
      },
    ]}
    successMessage="Your oath has strengthened the Bond."
  />
);
