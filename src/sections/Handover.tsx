import { useI18n, type Key } from '../i18n'

const OUT: [Key, Key][] = [
  ['flow.out1.h', 'flow.out1.p'],
  ['flow.out2.h', 'flow.out2.p'],
  ['flow.out3.h', 'flow.out3.p'],
]

const BACK: [Key, Key][] = [
  ['flow.back1.h', 'flow.back1.p'],
  ['flow.back2.h', 'flow.back2.p'],
  ['flow.back3.h', 'flow.back3.p'],
]

function Column({ title, steps, start }: { title: string; steps: [Key, Key][]; start: number }) {
  const { t } = useI18n()
  return (
    <div className="flow__col">
      <h3 className="flow__title">{title}</h3>
      <ol className="flow__steps" start={start}>
        {steps.map(([head, body], i) => (
          <li key={head}>
            <span className="flow__n" aria-hidden="true">
              {start + i}
            </span>
            <div>
              <h4>{t(head)}</h4>
              <p>{t(body)}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function Handover() {
  const { t } = useI18n()
  return (
    <section id="odbior" className="sheet-section flow" aria-labelledby="flow-title">
      <div className="section-head">
        <h2 id="flow-title" className="display display--section">
          {t('flow.title')}
        </h2>
        <p className="section-lead">{t('flow.lead')}</p>
      </div>
      <div className="flow__grid">
        <Column title={t('flow.out')} steps={OUT} start={1} />
        <div className="flow__fold" aria-hidden="true" />
        <Column title={t('flow.back')} steps={BACK} start={4} />
      </div>
    </section>
  )
}
