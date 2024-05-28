const express = require('express');
const firebaseAdmin = require('firebase-admin');
const path = require('path');

// Configurar Firebase
const config = require('./firebase');

try {
  firebaseAdmin.initializeApp(config);
  console.log('Firebase inicializado correctamente');
} catch (error) {
  console.error('Error al inicializar Firebase:', error);
  process.exit(1); // Termina el proceso si hay un error
}

// Inicializar Express.js
const app = express();
const PORT = 3000; // Puerto en el que se ejecutará el servidor

// Función para borrar mensajes antiguos
const deleteOldMessages = async () => {
  const database = firebaseAdmin.firestore();
  const chatroomsRef = database.collection('chatrooms');

  const now = new Date();
  const thresholdTimestamp = firebaseAdmin.firestore.Timestamp.fromDate(new Date(now.getTime() - 360 * 1000)); // 360 segundos en el pasado

  try {
    const chatroomsSnapshot = await chatroomsRef.get();

    for (const chatroomDoc of chatroomsSnapshot.docs) {
      console.log(`Chatroom ID: ${chatroomDoc.id}`);

      // Acceder a la colección "chats" dentro del documento actual de chatrooms
      const chatsRef = chatroomDoc.ref.collection('chats');
      const chatsSnapshot = await chatsRef.get();

      for (const chatDoc of chatsSnapshot.docs) {
        const chatData = chatDoc.data();
        const chatTimestamp = chatData.timestamp;

        // Verificar si el campo de timestamp existe y es del tipo esperado
        if (chatTimestamp && chatTimestamp.toDate) {
          console.log('Chat timestamp:', chatTimestamp.toDate());
          console.log('Threshold timestamp:', thresholdTimestamp.toDate());

          // Comparar los timestamps
          if (chatTimestamp.toDate().getTime() <= thresholdTimestamp.toDate().getTime()) {
            await chatDoc.ref.delete();
            console.log(`Mensaje antiguo eliminado en el chatroom: ${chatroomDoc.id}, mensaje ID: ${chatDoc.id}`);
          } else {
            console.log(`Mensaje antiguo no eliminado en el chatroom: ${chatroomDoc.id}, mensaje ID: ${chatDoc.id}`);
          }
        } else {
          console.error(`Timestamp no válido para el mensaje ID: ${chatDoc.id} en el chatroom: ${chatroomDoc.id}`);
        }
      }
    }
  } catch (error) {
    console.error('Error al borrar mensajes antiguos:', error);
  }
};

// Lógica para hacer peticiones a la base de datos de Firebase cada 10 segundos
setInterval(deleteOldMessages, 10000); // 10000 milisegundos = 10 segundos

// Definir rutas y controladores de Express.js según necesidades
app.get('/', (req, res) => {
  res.send('¡Hola mundo desde Express.js!');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor activo en http://localhost:${PORT}`);
});
