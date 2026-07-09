import { mountDashboard } from './presentation/dashboard.js'
import { mountLogin } from './presentation/login.js'
import { startLiveTicker } from './modules/live-ticker/liveTicker.js'
import { startReportExporter } from './modules/report-exporter/reportExporter.js'
import { startIntegrityMonitor } from './modules/integrity-monitor/integrityMonitor.js'
import { startBilingualSearch } from './modules/bilingual-search/bilingualSearch.js'
import { startKnockoutTree } from './modules/knockout-tree/knockoutTree.js'

const root = document.querySelector('#app')

mountDashboard(root)

// 03_business_rules.md §1: el token se obtiene antes de realizar
// cualquier petición de datos — los módulos no arrancan hasta el login.
mountLogin(root, () => {
  startLiveTicker()
  startReportExporter()
  startIntegrityMonitor()
  startBilingualSearch()
  startKnockoutTree()
})
