/**
 * ArcadeVerse Contributor Code Linter - QA Report Exporter
 * Generates formatted GitHub Markdown QA audit summaries for PR descriptions.
 */
(function(window) {
  'use strict';

  class ReportExporter {
    generateMarkdownReport(report) {
      const isPassed = report.errors === 0;
      let md = `### 🛡️ ArcadeVerse Contributor QA Audit Report\n\n`;
      md += `> **Audit Status:** ${isPassed ? '✅ **PASSED COMPLIANCE CHECK**' : '❌ **FAIL: ACTION REQUIRED**'}\n`;
      md += `> - 🚨 **Errors:** ${report.errors}\n`;
      md += `> - ⚠️ **Warnings:** ${report.warnings}\n`;
      md += `> - 📁 **Files Scanned:** ${report.totalFiles}\n\n`;

      md += `| File | Severity | Line | Finding & Advice |\n`;
      md += `| :--- | :---: | :---: | :--- |\n`;

      let hasFindings = false;
      for (const [filename, findings] of Object.entries(report.fileReports)) {
        findings.forEach(f => {
          hasFindings = true;
          const sevIcon = f.severity === 'error' ? '🚨 ERROR' : '⚠️ WARN';
          md += `| \`${filename}\` | ${sevIcon} | L${f.line} | ${f.message} |\n`;
        });
      }

      if (!hasFindings) {
        md += `| *All files* | ✅ Clean | - | No errors or rule violations found. Ready for PR! |\n`;
      }

      md += `\n*Audited by ArcadeVerse In-Browser QA Linter Tool v2.4 (NSOC '26)*\n`;
      return md;
    }

    copyToClipboard(text) {
      if (navigator.clipboard) {
        return navigator.clipboard.writeText(text);
      }
      return Promise.reject(new Error('Clipboard API not available'));
    }
  }

  window.ArcadeReportExporter = new ReportExporter();
})(window);
