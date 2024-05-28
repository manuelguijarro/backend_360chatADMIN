const admin = require('firebase-admin');
const path = require('path');

// Reemplaza este objeto con los detalles de tu archivo JSON de configuración
const serviceAccountPath = path.resolve(__dirname, 'chatapp-a49c2-firebase-adminsdk-fjb1y-78f18df8cb.json');
const serviceAccount = require(serviceAccountPath);

const config = {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatapp-a49c2-default-rtdb.europe-west1.firebasedatabase.app"
};

module.exports = config;