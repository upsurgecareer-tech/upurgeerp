const fs = require('fs');
let file = fs.readFileSync('d:/webapp/frontend/src/pages/HRMS/Employees.jsx', 'utf8');

const regex2 = /<TextField([^>]*)value=\{form\.([^}]+)\}([^>]*)\/>/g;
let modifiedCount = 0;

file = file.replace(regex2, (match, before, field, after) => {
  if (match.includes('error=')) return match;
  modifiedCount++;
  return `<TextField${before}value={form.${field}}${after} error={!!validationErrors.${field}} helperText={validationErrors.${field}} />`;
});

const regex1 = /<TextField([^>]*)value=\{form\.([^}]+)\}([^>]*)>/g;
file = file.replace(regex1, (match, before, field, after) => {
  if (match.includes('error=')) return match;
  modifiedCount++;
  return `<TextField${before}value={form.${field}}${after} error={!!validationErrors.${field}} helperText={validationErrors.${field}}>`;
});

if (modifiedCount > 0) {
  fs.writeFileSync('d:/webapp/frontend/src/pages/HRMS/Employees.jsx', file);
  console.log('Modified', modifiedCount, 'TextFields.');
} else {
  console.log('No TextFields modified.');
}
