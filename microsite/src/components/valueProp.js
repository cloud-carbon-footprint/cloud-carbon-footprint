import React from 'react'
import styles from './valuePropStyles.module.css'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

const cardContents = [
  {
    title: 'Reduce Cost',
    description:
      'Know where to target your optimizations, such as reducing ' +
      'the number and size of servers and requests. This decreases your usage and saves you money.',
    icon: 'img/trending_down-black-24dp.svg',
    iconAlt: 'Trending down icon',
  },
  {
    title: 'Meet Sustainability Goals',
    description:
      'Measure your emissions over time and see what workloads are ' +
      'the dirtiest. Switch usage to regions with greener energy to meet your targets.',
    icon: 'img/bar_chart-black-24dp.svg',
    iconAlt: 'Bar chart icon',
  },
  {
    title: 'Satisfy Investors and Employees',
    description:
      'Demonstrate a commitment to sustainability and enable ' +
      'stakeholders to measure cloud carbon emissions to inform decision making.',
    icon: 'img/fact_check-black-24dp.svg',
    iconAlt: 'Fact check icon',
  },
  {
    title: 'Ground Up Sustainability',
    description:
      'Enable engineers to monitor emissions and usage daily. This allows for ' +
      'iteratively updating practices and choices to optimize for emissions and cost reduction.',
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
