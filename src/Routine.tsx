import type { draftRoutine } from './questionnaire'

export function Routine({ routine }: { routine: ReturnType<typeof draftRoutine> }) {
  return <>
    <p>الگوی اولیه پوست: <strong>{routine.pattern}</strong></p>
    {routine.review && <p>پیش از انتخاب محصول، با متخصص درباره حساسیت‌ها و شرایطتان صحبت کنید.</p>}
    <div className="columns">
      {[['صبح', routine.morning], ['شب', routine.evening]].map(([label, steps]) =>
        <section className="card" key={String(label)}><h3>{label}</h3>
          <ol>{(steps as string[]).map(step => <li key={step}>{step}</li>)}</ol>
        </section>
      )}
    </div>
  </>
}
