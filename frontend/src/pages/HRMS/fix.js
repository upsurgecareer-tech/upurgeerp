const fs = require('fs');
let file = fs.readFileSync('d:/webapp/frontend/src/pages/HRMS/CommunicationManagement.jsx', 'utf8');

const regex = /catch\s*\(e\)\s*\{\s*toast\.error\(e\.response\?\.data\?\.message\s*\|\|\s*'([^']+)'\);\s*\}/g;

file = file.replace(regex, (match, fallback) => {
  return `catch (e) {
      if (e.response?.data?.errors) {
        toast.error(e.response.data.errors.map(err => err.message).join(', '));
      } else {
        toast.error(e.response?.data?.message || '${fallback}');
      }
    }`;
});

fs.writeFileSync('d:/webapp/frontend/src/pages/HRMS/CommunicationManagement.jsx', file);
console.log('Fixed CommunicationManagement.jsx');
