import { FogTrapPage } from '../components/FogTrapPage';

export const FogShinyIdeaPage = () => (
  <FogTrapPage
    id="shiny-idea"
    title="Fog Trap: The Shiny Idea"
    fogMessage="This idea looks different. That must mean it is useful."
    taskContent={
      <>
        <div>
          <p className="font-medium text-white">Idea:</p>
          <p className="mt-2">A glowing badge that randomly gives people titles during training.</p>
        </div>
        <div>
          <p>Ask:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-200/82">
            <li>Who benefits from this?</li>
            <li>What need does it solve?</li>
            <li>What could go wrong if we use it too quickly?</li>
          </ul>
        </div>
      </>
    }
    answerFields={[
      {
        id: 'benefit-analysis',
        label: 'Your analysis',
        placeholder: 'Answer the three questions before trusting the idea.',
        type: 'textarea',
      },
    ]}
    clue="Bright ideas need real needs. Search for the Market of Needs."
    scoreOnCompletion={1}
  />
);
