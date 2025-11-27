import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const timeSignatures = [
  { label: '2/4', beatsPerMeasure: 2, noteValue: 4 },
  { label: '3/4', beatsPerMeasure: 3, noteValue: 4 },
  { label: '2/2', beatsPerMeasure: 2, noteValue: 2 },
]

export default function App() {
  const [bpm, setBpm] = useState(180)
  const [isRunning, setIsRunning] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [signature, setSignature] = useState(timeSignatures[0])
  const audioCtxRef = useRef(null)

  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }

    return audioCtxRef.current
  }, [])

  const playClick = useCallback(
    (accent = false) => {
      const ctx = ensureAudioContext()
      if (!ctx) return

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const now = ctx.currentTime

      osc.type = 'square'
      osc.frequency.value = accent ? 1400 : 900

      gain.gain.setValueAtTime(accent ? 0.35 : 0.22, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.12)
    },
    [ensureAudioContext]
  )

  useEffect(() => {
    if (!isRunning) {
      setCurrentBeat(0)
      return
    }

    const intervalMs = 60000 / bpm
    let beat = 0

    const tick = () => {
      beat = (beat % signature.beatsPerMeasure) + 1
      setCurrentBeat(beat)
      playClick(beat === 1)
    }

    tick()
    const id = setInterval(tick, intervalMs)

    return () => clearInterval(id)
  }, [bpm, isRunning, playClick, signature])

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
      }
    }
  }, [])

  const handleBpmChange = (value) => {
    if (Number.isNaN(Number(value))) return
    const clamped = Math.min(240, Math.max(40, Number(value)))
    setBpm(clamped)
  }

  const signatureOptions = useMemo(
    () =>
      timeSignatures.map((sig) => (
        <option key={sig.label} value={sig.label}>
          {sig.label}
        </option>
      )),
    []
  )

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-12">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="label mb-2">Tempo toolkit</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Minimal Metronome
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Set your BPM, pick a time signature, and track each beat with clear sound and a focused visual pulse.
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 shadow-sm">
          Light mode
        </span>
      </header>

      <div className="card-surface control-surface grid gap-10 p-8 lg:grid-cols-2">
        <section className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              Default 180 BPM
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Accented downbeat
            </span>
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              2/4 · 3/4 · 2/2
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="label">Tempo (BPM)</label>
              <div className="flex items-center gap-3">
                <input
                  className="input w-28 text-center text-lg font-semibold"
                  type="number"
                  min={40}
                  max={240}
                  step={1}
                  value={bpm}
                  onChange={(e) => handleBpmChange(e.target.value)}
                />
                <div className="flex-1">
                  <input
                    type="range"
                    min={40}
                    max={240}
                    step={1}
                    value={bpm}
                    onChange={(e) => handleBpmChange(e.target.value)}
                    className="w-full accent-indigo-500"
                  />
                  <div className="mt-1 flex justify-between text-xs text-slate-500">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="label">Time signature</label>
              <select
                className="input cursor-pointer"
                value={signature.label}
                onChange={(e) => {
                  const next = timeSignatures.find((sig) => sig.label === e.target.value)
                  setSignature(next)
                }}
              >
                {signatureOptions}
              </select>
              <p className="text-xs text-slate-500">
                Downbeat is accented each measure. Beats per bar: {signature.beatsPerMeasure}.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className={`btn ${isRunning ? 'btn-ghost' : 'btn-primary'} min-w-[130px]`}
              onClick={() => {
                ensureAudioContext()
                setIsRunning((prev) => !prev)
              }}
            >
              {isRunning ? 'Stop' : 'Start'}
            </button>
            <div className="rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-inner">
              {bpm} BPM · {signature.label}
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center">
          <div className="relative h-full w-full max-w-[420px]">
            <div className="absolute inset-4 rounded-[32px] bg-white/60 backdrop-blur" />
            <div className="absolute inset-0 rounded-[36px] border border-white/70" />

            <div className="relative z-10 flex h-full flex-col items-center justify-center gap-6 py-10">
              <div className="relative flex items-center justify-center">
                <div
                  className={`pulse-ring absolute inset-0 rounded-full bg-indigo-200/50 ${
                    isRunning ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ animationDuration: `${60000 / bpm}ms` }}
                ></div>
                <div className="relative flex h-44 w-44 flex-col items-center justify-center rounded-full bg-white/90 shadow-xl ring-1 ring-slate-200">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Beat</span>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-6xl font-semibold text-slate-900">{currentBeat || '–'}</span>
                    <span className="text-sm text-slate-400">/ {signature.beatsPerMeasure}</span>
                  </div>
                  <div className="mt-3 text-sm text-slate-500">{bpm} BPM</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-5 py-4 shadow-inner">
                {Array.from({ length: signature.beatsPerMeasure }).map((_, idx) => {
                  const beatNumber = idx + 1
                  const isActive = currentBeat === beatNumber
                  return (
                    <div key={beatNumber} className="flex flex-col items-center gap-2 text-xs font-medium text-slate-500">
                      <div className={`meter-dot ${isActive ? 'active' : ''}`} />
                      <span className={isActive ? 'text-indigo-600' : ''}>{beatNumber}</span>
                    </div>
                  )
                })}
              </div>

              <div className="text-center text-sm text-slate-500">
                Clicks are generated locally using the Web Audio API for tight timing. Downbeat is brighter and louder.
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
