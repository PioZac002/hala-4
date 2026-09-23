const OUT = [
  { h: 'Rezerwacja', p: 'Wybierasz auto i termin w formularzu poniżej. Oddzwaniamy, żeby potwierdzić godzinę odbioru.' },
  { h: 'Obchód', p: 'W hali obchodzimy auto razem. Pięć zdjęć, stan licznika i paliwa trafiają do protokołu.' },
  { h: 'Podpis', p: 'Podpisujemy protokół oboje. Dostajesz kluczyk i różową kopię z cennikiem i warunkami.' },
]

const BACK = [
  { h: 'Powrót do hali', p: 'Wracasz z pełnym bakiem, w godzinach z rezerwacji albo po uzgodnieniu.' },
  { h: 'Ten sam obchód', p: 'Robimy te same pięć ujęć i porównujemy je ze zdjęciami z wydania.' },
  { h: 'Drugi podpis', p: 'Podpisujemy ten sam protokół drugi raz. Blokada kaucji znika z karty.' },
]

function Column({ title, steps, start }: { title: string; steps: typeof OUT; start: number }) {
  return (
    <div className="flow__col">
      <h3 className="flow__title">{title}</h3>
      <ol className="flow__steps" start={start}>
        {steps.map((s, i) => (
          <li key={s.h}>
            <span className="flow__n" aria-hidden="true">
              {start + i}
            </span>
            <div>
              <h4>{s.h}</h4>
              <p>{s.p}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function Handover() {
  return (
    <section id="odbior" className="sheet-section flow" aria-labelledby="flow-title">
      <div className="section-head">
        <h2 id="flow-title" className="display display--section">
          Odbiór i zwrot
        </h2>
        <p className="section-lead">
          Jeden protokół, dwa podpisy. Przy zwrocie porównujemy auto ze zdjęciami z wydania, więc nie ma sporu o to, skąd się
          wzięła rysa.
        </p>
      </div>
      <div className="flow__grid">
        <Column title="Wydanie" steps={OUT} start={1} />
        <div className="flow__fold" aria-hidden="true" />
        <Column title="Zwrot" steps={BACK} start={4} />
      </div>
    </section>
  )
}
