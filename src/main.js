import './presentation/designSystem.css'
import { mountDashboard } from './presentation/dashboard.js'
import { mountLogin } from './presentation/login.js'
import { mountAccessibilityWidget } from './presentation/accessibilityWidget.js'
import { startLiveTicker } from './modules/live-ticker/liveTicker.js'
import { startReportExporter } from './modules/report-exporter/reportExporter.js'
import { startIntegrityMonitor } from './modules/integrity-monitor/integrityMonitor.js'
import { startBilingualSearch } from './modules/bilingual-search/bilingualSearch.js'
import { startKnockoutTree } from './modules/knockout-tree/knockoutTree.js'

const root = document.querySelector('#app')

// Fuera de las 3 zonas del Dashboard (dashboard_design.md §6): se aplica antes de pintar nada más.
mountAccessibilityWidget(document.body)
mountDashboard(root)

// 03_business_rules.md §1: los módulos no arrancan hasta que el login obtiene el token.
mountLogin(root, () => {
  startLiveTicker()
  startReportExporter()
  startIntegrityMonitor()
  startBilingualSearch()
  startKnockoutTree()
})
