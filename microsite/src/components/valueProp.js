import React from 'react'
import styles from './valuePropStyles.module.css'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

const cardContents = [
  {
    title: 'Cloud costs are through the roof...',
    description:
      'Instead, identify trends, spikes, and opportunities for cost and carbon reduction.  ' +
      'Prioritize amongst specific optimizations and forecast savings.',
    icon: 'img/trending_down-black-24dp.svg',
    iconAlt: 'Trending down icon',
  },
  {
    title: 'Carbon impact of your cloud use is unaccounted for...',
    description:
      'Measure, monitor and report on your cloud carbon footprint as part of your Scope 3 emissions. ' +
      'Make it a key metric for developers and stakeholders alike in day to day and strategic decision making.',
    icon: 'img/bar_chart-black-24dp.svg',
    iconAlt: 'Bar chart icon',
  },
  {
    title: 'Need to meet sustainability targets...',
    description:
      'Understand your cloud carbon footprint baseline and make specific, ' +
      'targeted reductions to reduce your emissions, such as rightsizing, deleting idle instances, and more.',
    icon: 'img/fact_check-black-24dp.svg',
    iconAlt: 'Fact check icon',
  },
  {
    title: 'Infrastructure inhibits speed to market...',
    description:
      'You can enable faster experimentation and product delivery by reducing cloud waste. ' +
      'Automate green cloud approaches to reduce cycle times. ',
    icon: 'img/legend_toggle-black-24dp.svg',
    iconAlt: 'Legend icon',
  },
]

function ValuePropCard({ title, description, icon, iconAlt }) {
  return (
    <Card className={styles.valuePropCard}>
      <CardContent>
        <div>
          <div className={styles.valuePropCardHeaderContainer}>
            <div className={styles.valuePropCardIconContainer}>
              <img src={icon} alt={iconAlt} />
            </div>
            <div className={styles.valuePropCardTitleContainer}>
              <h3 className={styles.valuePropCardTitle}>{title}</h3>
            </div>
          </div>
          <div className={styles.valuePropCardDescriptionContainer}>
            <p>{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ValueProp() {
  return (
    <section id="measure-and-control-your-impact">
      <div className="home__subsection-box-format">
        <h2 className="home__subsection-title">
          MEASURE AND CONTROL YOUR IMPACT
        </h2>
        <div className={styles.valuePropCardsContainer}>
          {cardContents.map((content, idx) => (
            <ValuePropCard key={idx} {...content} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ValueProp
