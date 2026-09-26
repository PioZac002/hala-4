import { HALL } from '../data'
import { useI18n } from '../i18n'
import { Scissors } from '../components/Marks'

export function Stub() {
  const { t, loc } = useI18n()
  return (
    <footer className="stub">
      <div className="stub__perf" aria-hidden="true">
        <Scissors />
      </div>
      <div className="stub__grid">
        <p className="stub__mark">Hala&nbsp;4</p>
        <dl className="stub__facts">
          <div>
            <dt>{t('stub.address')}</dt>
            <dd>{loc(HALL.address)}</dd>
          </div>
          <div>
            <dt>{t('stub.hours')}</dt>
            <dd>{loc(HALL.hours)}</dd>
          </div>
          <div>
            <dt>{t('stub.form')}</dt>
            <dd>{t('stub.formValue')}</dd>
          </div>
        </dl>
        <p className="stub__note">{t('stub.note')}</p>
      </div>
    </footer>
  )
}
