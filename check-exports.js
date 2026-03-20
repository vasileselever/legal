const fs = require('fs');
const pages = ['DreptCivil','DreptComercial','DreptPenal','DreptulFamiliei','DreptImobiliar','DreptulMuncii'];
const base = 'C:/Users/vasileselever/Desktop/projects/Juridic/legal/legal-ui/src/pages/';
pages.forEach(p => {
  const c = fs.readFileSync(base + p + '.tsx', 'utf8');
  const ex = c.match(/export (default |function |const )\w+/g);
  console.log(p + ': ' + JSON.stringify(ex));
  // also print first 80 chars
  console.log('  -> ' + c.slice(0,80).replace(/\n/g,' '));
});
