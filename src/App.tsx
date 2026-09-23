import { useEffect, useRef, useState } from 'react'
import { Assistant } from './components/Assistant'
import { Masthead } from './components/Masthead'
import { Walkaround } from './hero/Walkaround'
import { Booking } from './sections/Booking'
import { CarbonCopy } from './sections/Copy'
import { Fleet } from './sections/Fleet'
import { Handover } from './sections/Handover'
import { Stub } from './sections/Stub'
import { scrollToId, startSmoothScroll, useReducedMotion } from './scroll'

export default function App() {
  const reduced = useReducedMotion()
  const [carId, setCarId] = useState('golf-r')
  const [serial, setSerial] = useState(417)
  const [asking, setAsking] = useState(false)
  const askBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => startSmoothScroll(), [reduced])

  const book = (id: string) => {
    setCarId(id)
    scrollToId('rezerwacja')
  }

  return (
    <>
      <a className="skip" href="#rezerwacja">
        Przejdź do rezerwacji
      </a>
      <Masthead serial={serial} asking={asking} onAsk={() => setAsking((a) => !a)} askRef={askBtn} />
      <main id="top">
        <Walkaround carId={carId} onCar={setCarId} reduced={reduced} />
        <Fleet carId={carId} onSelect={setCarId} onBook={book} />
        <CarbonCopy carId={carId} onCar={setCarId} />
        <Handover />
        <Booking
          carId={carId}
          onCar={setCarId}
          serial={serial}
          onFiled={() => setSerial((s) => s + 1)}
          onAsk={() => setAsking(true)}
        />
      </main>
      <Assistant open={asking} onClose={() => setAsking(false)} carId={carId} triggerRef={askBtn} />
      <Stub />
    </>
  )
}
