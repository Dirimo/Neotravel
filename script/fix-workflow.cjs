const fs = require('fs');
const workflow = JSON.parse(fs.readFileSync('n8n/workflow.json', 'utf8'));

// Fix memory node
const memory = workflow.nodes.find(n => n.name === 'Window Buffer Memory');
if (memory) {
  memory.parameters.sessionKey = '={{ $json.body.sessionId }}';
}

// Fix devis node
const devis = workflow.nodes.find(n => n.name === 'calculer_devis');
if (devis) {
  const emailParam = devis.parameters.bodyParameters.parameters.find(p => p.name === 'userEmail');
  if (emailParam) {
    emailParam.value = '={{ $(\'When chat message received\').first().json.body.userEmail }}';
  }
}

fs.writeFileSync('NeoTravel — Agent Devis (Fixed).json', JSON.stringify(workflow, null, 2));
console.log('Fixed workflow created!');
