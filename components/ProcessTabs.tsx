'use client';

import { useRef, useState, type KeyboardEvent } from 'react';

const steps = [
  { name: 'Discover', title: 'First, the right questions.', text: 'We get to know your business, your goals and the challenge behind the brief. A good conversation is the start of good work.' },
  { name: 'Shape', title: 'A plan with a clear purpose.', text: 'We turn what we’ve learned into a sensible scope, useful priorities and a direction we can agree on together.' },
  { name: 'Build', title: 'Bring the idea to life.', text: 'Design, build, refine and share progress as we get the details ready for the real world.' },
  { name: 'Evolve', title: 'Keep the good things growing.', text: 'Launch is a beginning. Ongoing support and careful improvements help your technology move with your business.' },
];

/** WAI-ARIA tabs: arrow keys move between tabs, Home/End jump to the ends, only the active tab is in the tab order. */
export default function ProcessTabs() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = steps.length - 1;
    const next = { ArrowRight: index === last ? 0 : index + 1, ArrowLeft: index === 0 ? last : index - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <>
      <div className="process-tabs" role="tablist" aria-label="Our working process">
        {steps.map((step, index) => (
          <button
            key={step.name}
            ref={node => { tabRefs.current[index] = node; }}
            className="process-tab"
            id={`step${index + 1}`}
            role="tab"
            type="button"
            aria-selected={active === index}
            aria-controls={`panel${index + 1}`}
            tabIndex={active === index ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={event => onKeyDown(event, index)}
          >
            <span className="mono step-no">0{index + 1} /</span>
            <span className="step-name">{step.name}</span>
            <span className="step-arrow" aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
      {steps.map((step, index) => (
        <div
          key={step.name}
          className="process-panel"
          id={`panel${index + 1}`}
          role="tabpanel"
          aria-labelledby={`step${index + 1}`}
          tabIndex={0}
          hidden={active !== index}
        >
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </div>
      ))}
    </>
  );
}
