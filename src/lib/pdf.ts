interface WorkoutSet {
  weight: number
  reps: number
  rpe?: number
  note?: string
}

interface WorkoutExercise {
  name: string
  sets: WorkoutSet[]
}

interface Workout {
  planName?: string
  date: string | number | Date
  duration?: number
  type: string
  exercises: WorkoutExercise[]
}

export async function exportWorkoutToPDF(workout: Workout): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 15
  let y = 20

  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text('Trening Pro', margin, y)
  y += 8

  doc.setFontSize(14)
  doc.text(workout.planName || 'Trening', margin, y)
  y += 7

  // Meta line
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(120)
  const date = new Date(workout.date).toLocaleString('pl-PL', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
  const dur = workout.duration ? `${Math.floor(workout.duration / 60)}m ${workout.duration % 60}s` : '—'
  let totalVol = 0, totalSets = 0
  for (const ex of workout.exercises) {
    for (const s of ex.sets) { totalVol += (s.weight || 0) * (s.reps || 0); totalSets++ }
  }
  doc.text(`${workout.type.toUpperCase()}  ·  ${date}  ·  ${dur}  ·  ${totalSets} serii  ·  ${Math.round(totalVol)} kg wolumenu`, margin, y)
  y += 4
  doc.setTextColor(0)

  // Separator
  doc.setDrawColor(220)
  doc.line(margin, y, W - margin, y)
  y += 8

  // Exercises
  for (const ex of workout.exercises) {
    if (y > 270) { doc.addPage(); y = 20 }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(ex.name, margin, y)
    y += 6

    // Set table
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text('#', margin, y)
    doc.text('Ciężar', margin + 12, y)
    doc.text('Powt.', margin + 40, y)
    doc.text('RPE', margin + 65, y)
    doc.text('Notatka', margin + 85, y)
    y += 4
    doc.setDrawColor(230)
    doc.line(margin, y, W - margin, y)
    y += 4
    doc.setTextColor(30)

    ex.sets.forEach((s, i) => {
      if (y > 280) { doc.addPage(); y = 20 }
      doc.text(`${i + 1}`, margin, y)
      doc.text(`${s.weight} kg`, margin + 12, y)
      doc.text(`${s.reps}`, margin + 40, y)
      doc.text(s.rpe ? `${s.rpe}` : '—', margin + 65, y)
      if (s.note) {
        const lines: string[] = doc.splitTextToSize(s.note, W - margin - 85 - margin)
        doc.text(lines, margin + 85, y)
        y += (lines.length - 1) * 4
      }
      y += 5
    })

    y += 6
  }

  // Footer
  const totalPages = (doc.internal as any).pages.length - 1
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFontSize(8)
    doc.setTextColor(160)
    doc.text(`Trening Pro · strona ${p}/${totalPages}`, W / 2, 290, { align: 'center' })
  }

  const dateSlug = new Date(workout.date).toISOString().slice(0, 10)
  const nameSlug = (workout.planName || 'trening').toLowerCase().replace(/[^a-z0-9]+/g, '-')
  doc.save(`trening-${dateSlug}-${nameSlug}.pdf`)
}
