import { Scan, FlaskConical, Banknote } from 'lucide-react';
import styles from './HowItWorks.module.css';

const steps = [
  {
    number: '01',
    icon: <Scan size={28} />,
    title: 'Book & Bring In',
    description:
      'Schedule a free appointment at your nearest Goldify kiosk. Bring your gold, diamonds, or platinum jewelry — no prior cleaning or polishing required.',
  },
  {
    number: '02',
    icon: <FlaskConical size={28} />,
    title: 'Hardware Verification',
    description:
      'Our gemologist uses XRF Spectrometry to measure exact gold purity to 3 decimal places, and calibrated digital scales for net weight. GIA iD100 detects natural diamonds. Zero guesswork.',
  },
  {
    number: '03',
    icon: <Banknote size={28} />,
    title: 'Receive Transparent Offer',
    description:
      'Our algorithm generates a firm offer based on live MCX-linked rates and your verified purity — no manual deductions, no hidden \"wastage\" charges. Accept and receive payment instantly.',
  },
];

export default function HowItWorks() {
  return (
    <section className={styles.section} id="how-it-works">
      <div className="container">
        <div className={styles.header}>
          <span className={styles.label}>The Process</span>
          <h2 className={styles.title}>
            How <span className="gold-text">Goldify</span> Works
          </h2>
          <p className={styles.sub}>
            Three steps from appointment to payment. No negotiations, no surprises.
          </p>
        </div>

        <div className={styles.steps}>
          {steps.map((step, idx) => (
            <div key={idx} className={styles.step}>
              <div className={styles.stepNumber}>{step.number}</div>
              <div className={styles.iconWrap}>{step.icon}</div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.description}</p>
              {idx < steps.length - 1 && <div className={styles.connector} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
