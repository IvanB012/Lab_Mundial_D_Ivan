// Renderizado del panel de Exportador de Reportes (07_report_exporter.md §5); compara contra el PENDING_LABEL de reportExporter.js.
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

// missingResources solo trae etiquetas fijas de RESOURCE_LABELS, nunca datos de la API: seguro vía innerHTML.
function buildMissingNotice(missingResources) {
  return missingResources.length
    ? `<p class="report-missing-notice">No se pudo cargar: ${missingResources.join(', ')}.</p>`
    : ''
}

function buildTableOrMessage(hasGames) {
  if (!hasGames) {
    return `<p class="report-missing-notice">No se pudo generar el reporte: no fue posible cargar los partidos.</p>`
  }
  return `
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
}

// El botón está disponible en cuanto al menos un recurso cargó (07 §6).
function buildExportButton(hasGames, missingResources) {
  const atLeastOneResourceLoaded = hasGames || missingResources.length < 3
  return atLeastOneResourceLoaded
    ? `<button type="button" class="report-export-button ds-button ds-button--primary">Exportar</button>`
    : ''
}

// Filas con datos reales de la API: van por separado vía createElement/textContent, nunca como HTML crudo.
function populateRows(container, rows) {
  const tbody = container.querySelector('.report-table tbody')
  for (const row of rows) tbody.appendChild(buildRow(row))
}

function wireExportButton(container) {
  const button = container.querySelector('.report-export-button')
  if (button) button.addEventListener('click', () => window.print())
}

export function renderReport(container, { rows, missingResources }) {
  if (!container) return

  const hasGames = rows !== null
  container.innerHTML = `
    <div class="report-exporter-printable">
      ${buildMissingNotice(missingResources)}
      ${buildTableOrMessage(hasGames)}
      ${buildExportButton(hasGames, missingResources)}
    </div>
  `

  if (hasGames) populateRows(container, rows)
  wireExportButton(container)
}
