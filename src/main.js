import { mountDashboard } from './presentation/dashboard.js'
import { startLiveTicker } from './modules/live-ticker/liveTicker.js'
import { startReportExporter } from './modules/report-exporter/reportExporter.js'
import { startIntegrityMonitor } from './modules/integrity-monitor/integrityMonitor.js'

mountDashboard(document.querySelector('#app'))
startLiveTicker()
startReportExporter()
startIntegrityMonitor()
