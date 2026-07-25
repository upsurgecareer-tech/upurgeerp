const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('UpsurgeERP Database Setup (Node.js)');
console.log('========================================\n');

// Common MySQL paths
const mysqlPaths = [
  'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
  'C:\\Program Files\\MySQL\\MySQL Server 8.1\\bin\\mysql.exe',
  'C:\\xampp\\mysql\\bin\\mysql.exe',
  'C:\\wamp64\\bin\\mysql\\mysql8.0.30\\bin\\mysql.exe',
  'C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysql.exe',
  'mysql' // Try system PATH as last resort
];

function findMySql() {
  console.log('Searching for MySQL installation...\n');
  
  for (const mysqlPath of mysqlPaths) {
    try {
      if (mysqlPath === 'mysql') {
        execSync('mysql --version', { stdio: 'ignore' });
        console.log('✅ Found MySQL in system PATH\n');
        return 'mysql';
      } else if (fs.existsSync(mysqlPath)) {
        console.log(`✅ Found MySQL at: ${mysqlPath}\n`);
        return `"${mysqlPath}"`;
      }
    } catch (e) {
      // Continue searching
    }
  }
  
  return null;
}

function createDatabase(mysqlCmd) {
  console.log('Step 1: Creating database...');
  
  try {
    const sqlFile = path.join(__dirname, 'setup_database.sql');
    const command = `${mysqlCmd} -u root -proot < "${sqlFile}"`;
    
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Database created successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to create database\n');
    console.error('Error:', error.message);
    return false;
  }
}

function installDependencies() {
  console.log('Step 2: Installing dependencies...');
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed!\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to install dependencies\n');
    return false;
  }
}

function runMigrations() {
  console.log('Step 3: Running migrations...');
  
  try {
    execSync('npm run migrate', { stdio: 'inherit' });
    console.log('✅ Migrations completed!\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to run migrations\n');
    return false;
  }
}

async function main() {
  // Find MySQL
  const mysqlCmd = findMySql();
  
  if (!mysqlCmd) {
    console.error('❌ MySQL not found!\n');
    console.log('Please install MySQL or add it to your system PATH.\n');
    console.log('Common installation locations:');
    mysqlPaths.slice(0, -1).forEach(p => console.log(`  - ${p}`));
    console.log('\nOr use MySQL Workbench to create database manually.');
    console.log('See MANUAL_SETUP.md for detailed instructions.\n');
    process.exit(1);
  }
  
  // Create database
  if (!createDatabase(mysqlCmd)) {
    console.log('\nTroubleshooting:');
    console.log('1. Check if MySQL service is running: net start | findstr MySQL');
    console.log('2. Verify credentials (username: root, password: root)');
    console.log('3. Try manual setup - see MANUAL_SETUP.md\n');
    process.exit(1);
  }
  
  // Install dependencies
  if (!installDependencies()) {
    process.exit(1);
  }
  
  // Run migrations
  if (!runMigrations()) {
    process.exit(1);
  }
  
  console.log('========================================');
  console.log('Setup Complete! 🎉');
  console.log('========================================\n');
  console.log('You can now start the server with:');
  console.log('  npm run dev\n');
  console.log('API will be available at:');
  console.log('  http://localhost:3000/api/v1\n');
}

main().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
});
