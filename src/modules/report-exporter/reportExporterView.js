// Renderizado del panel de Exportador de Reportes. La estructura marca
// explícitamente qué sección faltó (07_report_exporter.md §5) en vez de
// omitirla silenciosamente.
export function renderReport(container, { rows, missingResources }) {
  if (!container) return

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
        <tbody>
          ${rows
            .map(
              (row) => `
            <tr data-game-id="${row.id}">
              <td>${row.matchup}</td>
              <td>${row.score}</td>
              <td>${row.stadiumText}</td>
              <td>${row.teamCodesText}</td>
              <td>${row.date}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `
    : `<p class="report-missing-notice">No se pudo generar el reporte: no fue posible cargar los partidos.</p>`

  // El botón está disponible en cuanto al menos un recurso cargó (07 §6).
  const atLeastOneResourceLoaded = hasGames || missingResources.length < 3
  const exportButton = atLeastOneResourceLoaded
    ? `<button type="button" class="report-export-button">Exportar</button>`
    : ''

  container.innerHTML = `
    <div class="report-exporter-printable">
      ${missingNotice}
      ${tableOrMessage}
      ${exportButton}
    </div>
  `

  const button = container.querySelector('.report-export-button')
  if (button) {
    button.addEventListener('click', () => window.print())
  }
}
