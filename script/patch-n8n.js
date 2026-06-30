import sqlite3 from 'sqlite3'
import path from 'path'
import os from 'os'

const dbPath = path.join(os.homedir(), '.n8n', 'database.sqlite')
console.log('Patching DB:', dbPath)

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening DB:', err)
    process.exit(1)
  }
})

db.serialize(() => {
  db.all("SELECT id, name, nodes FROM workflow_entity", (err, rows) => {
    if (err) throw err;
    let found = false;
    for (const row of rows) {
      if (row.nodes && row.nodes.includes('4000')) {
        found = true;
        const newNodes = row.nodes.replace(/127\.0\.0\.1:4000/g, '127.0.0.1:3001').replace(/localhost:4000/g, 'localhost:3001');
        db.run("UPDATE workflow_entity SET nodes = ? WHERE id = ?", [newNodes, row.id], function(err) {
          if (err) throw err;
          console.log(`Updated workflow ${row.name} (${row.id}) to use port 3001`);
        });
      }
    }
    if (!found) {
      console.log('No workflows needed patching.');
    }
  });
})
