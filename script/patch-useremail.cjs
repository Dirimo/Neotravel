const sqlite3 = require('sqlite3');
const path = require('path');
const os = require('os');
const dbPath = path.join(os.homedir(), '.n8n', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.get('SELECT id, name, nodes FROM workflow_entity WHERE name = ?', ['NeoTravel — Agent Devis'], (err, row) => {
    if (err) throw err;
    if (!row) { console.log('Workflow not found'); return; }
    const nodes = JSON.parse(row.nodes);
    const devisNode = nodes.find(n => n.name === 'calculer_devis');
    if (devisNode) {
      if (!devisNode.parameters.bodyParameters) {
        devisNode.parameters.bodyParameters = { parameters: [] };
      }
      const params = devisNode.parameters.bodyParameters.parameters;
      const hasEmail = params.find(p => p.name === 'userEmail');
      if (!hasEmail) {
        params.push({
          name: 'userEmail',
          value: '={{ $(\'When chat message received\').item.json.body.userEmail }}',
          parameterType: 'fixed'
        });
        db.run('UPDATE workflow_entity SET nodes = ? WHERE id = ?', [JSON.stringify(nodes), row.id], (err) => {
          if (err) throw err;
          console.log('Successfully updated the n8n database with userEmail parameter!');
        });
      } else {
        console.log('userEmail parameter already exists in the database.');
      }
    } else {
      console.log('calculer_devis node not found');
    }
  });
});
