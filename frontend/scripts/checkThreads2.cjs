const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccountPath = 'c:/ALLFIX-2.0/backend/src/main/resources/serviceAccountKey.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkThreads() {
  console.log("Checking chat_threads collection...");
  const snapshot = await db.collection('chat_threads').get();
  
  if (snapshot.empty) {
    console.log("No matching documents in chat_threads.");
    return;
  }  

  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}

checkThreads().catch(console.error);
