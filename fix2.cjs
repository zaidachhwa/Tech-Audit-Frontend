const fs = require('fs');
let content = fs.readFileSync('c:/nexcore/Tech-Audit/Tech-Audit-Frontend/src/App.jsx', 'utf8');

content = content.replace(
  '<Route path="add-reports"        element={<AddReport2 />} />\n          <Route path="performance-reports" element={<AdminPerformanceReports />} />',
  '<Route path="add-reports"        element={<AddReport2 />} />\n          <Route path="assign-task"        element={<AssignTask />} />\n          <Route path="performance-reports" element={<AdminPerformanceReports />} />'
);

fs.writeFileSync('c:/nexcore/Tech-Audit/Tech-Audit-Frontend/src/App.jsx', content);
console.log('Fixed App.jsx again');
