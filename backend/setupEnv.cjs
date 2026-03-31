const fs = require('fs');
const content = `PORT=5000\nDATABASE_URL="file:./dev.db"\nJWT_SECRET="the_memory_knot_super_secret"\nEMAIL_HOST="smtp.gmail.com"\nEMAIL_PORT="587"\nEMAIL_USER="dadhichr260@gmail.com"\nEMAIL_PASS=""\nFRONTEND_URL="http://localhost:8080"\n`;
fs.writeFileSync('.env', content);
console.log('.env created');
