/**
 * ArcadeVerse Contributor Code Linter - Static Code Auditor
 * Runs static checks on files, aggregates warnings and errors with line locations.
 */
(function(window) {
  'use strict';

  class AstChecker {
    constructor() {
      this.rules = window.ArcadeLinterRules || [];
    }

    lintFile(code, extension) {
      const findings = [];
      for (const rule of this.rules) {
        try {
          const matches = rule.test(code, extension);
          matches.forEach(m => {
            findings.push({
              ruleId: rule.id,
              ruleName: rule.name,
              severity: rule.severity,
              line: m.line,
              message: m.message
            });
          });
        } catch (err) {
          console.error(`Rule ${rule.id} failed:`, err);
        }
      }
      return findings;
    }

    lintProject(files) {
      const report = {
        totalFiles: Object.keys(files).length,
        errors: 0,
        warnings: 0,
        fileReports: {}
      };

      for (const [filename, content] of Object.entries(files)) {
        const ext = filename.split('.').pop().toLowerCase();
        const findings = this.lintFile(content, ext);

        findings.forEach(f => {
          if (f.severity === 'error') report.errors++;
          if (f.severity === 'warning') report.warnings++;
        });

        report.fileReports[filename] = findings;
      }

      return report;
    }
  }

  window.ArcadeAstChecker = new AstChecker();
})(window);
