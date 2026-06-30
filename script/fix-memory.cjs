const sqlite3 = require('sqlite3');
const path = require('path');
const os = require('os');
const dbPath = path.join(os.homedir(), '.n8n', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.get('SELECT id, name, nodes FROM workflow_entity WHERE name = ?', ['NeoTravel — Agent Devis'], (err, row) => {
    if (err) throw err;
    const nodes = JSON.parse(row.nodes);
    const memory = nodes.find(n => n.name === 'Window Buffer Memory');
    if (memory) {
      memory.parameters.sessionKey = '={{ $json.body.sessionId }}';
      db.run('UPDATE workflow_entity SET nodes = ? WHERE id = ?', [JSON.stringify(nodes), row.id], (err) => {
        if (err) throw err;
        console.log('Fixed memory sessionKey!');
      });
    }
  });
});
