// Renderizado del panel de Exportador de Reportes. La estructura marca
// explícitamente qué sección faltó (07_report_exporter.md §5) en vez de
// omitirla silenciosamente.

// Acoplamiento consciente (Fase 4): reportExporter.js no expone un flag
// de "pendiente", solo entrega el string ya formado. Esta vista compara
// contra el mismo texto literal que ese módulo usa como PENDING_LABEL
// para poder mostrarlo como badge — si ese texto cambiara ahí sin
// actualizar esta constante, el badge simplemente dejaría de pintarse
// (no rompe nada funcional), pero quedaría desincronizado visualmente.
const PENDING_LABEL_TEXT = 'Por definir'

function buildCell(value) {
  const td = document.createElement('td')
  if (value === PENDING_LABEL_TEXT) {
    const badge = document.createElement('span')
    badge.className = 'ds-badge ds-badge--neutral'
    badge.textContent = value
    td.appendChild(badge)
  } else {
    td.textContent = value
  }
  return td
}

function buildRow(row) {
  const tr = document.createElement('tr')
  tr.dataset.gameId = row.id
  tr.append(
    buildCell(row.matchup),
    buildCell(row.score),
    buildCell(row.stadiumText),
    buildCell(row.teamCodesText),
    buildCell(row.date),
  )
  return tr
}

export function renderReport(container, { rows, missingResources }) {
  if (!container) return

  // missingResources solo contiene etiquetas fijas de RESOURCE_LABELS
  // (Partidos/Equipos/Estadios en reportExporter.js), nunca datos de la
  // API: seguro insertarlas vía innerHTML igual que el resto del esqueleto.
  const missingNotice = missingResources.length
    ? `<p class="report-missing-notice">No se pudo cargar: ${missingResources.join(', ')}.</p>`
    : ''

  const hasGames = rows !== null

  const tableOrMessage = hasGames
    ? `
      <table class="report-table">
        <thead>
          <tr>
            <th>Partido</th>
            <th>Marcador</th>
            <th>Estadio</th>
            <th>Cód. equipos</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `
    : `<p class="report-missing-notice">No se pudo generar el reporte: no fue posible cargar los partidos.</p>`

  // El botón está disponible en cuanto al menos un recurso cargó (07 §6).
  const atLeastOneResourceLoaded = hasGames || missingResources.length < 3
  const exportButton = atLeastOneResourceLoaded
    ? `<button type="button" class="report-export-button ds-button ds-button--primary">Exportar</button>`
    : ''

  container.innerHTML = `
    <div class="report-exporter-printable">
      ${missingNotice}
      ${tableOrMessage}
      ${exportButton}
    </div>
  `

  // Filas con datos reales de la API: se insertan por separado vía
  // createElement/textContent, nunca como HTML crudo.
  if (hasGames) {
    const tbody = container.querySelector('.report-table tbody')
    for (const row of rows) tbody.appendChild(buildRow(row))
  }

  const button = container.querySelector('.report-export-button')
  if (button) {
    button.addEventListener('click', () => window.print())
  }
}
