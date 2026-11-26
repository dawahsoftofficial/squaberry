import Icon from './Icon';
import { processSteps } from '@/lib/process';

/** The four "How we work" steps as cards: gradient icon tile, large step number, title and text. */
export default function ProcessSteps() {
  return (
    <ol className="feature-grid cols-4 steps-grid">
      {processSteps.map((step, index) => (
        <li className="feature-card reveal" key={step.name} style={{ ['--accent' as string]: step.accent }}>
          <span className="feature-top">
            <span className="feature-icon"><Icon name={step.icon} size={26} /></span>
            <span className="feature-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          </span>
          <h3><span className="visually-hidden">Step {index + 1}: </span>{step.name}</h3>
          <p>{step.text}</p>
        </li>
      ))}
    </ol>
  );
}
