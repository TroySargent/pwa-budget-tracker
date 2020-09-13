let db;
let request = indexedDB.open("banking", 1);

request.onupgradeneeded = function(event) { 
    // Save the IDBDatabase interface 
    db = event.target.result;
  
    // Create an objectStore for this database
    db.createObjectStore("pendingTransactions", {"autoIncrement": true});
};

request.onerror = function(event) {
  console.log(event);
};

request.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

function saveRecord(record) {
    let transaction = db.transaction(["pendingTransactions"], 'readwrite').objectStore("pendingTransactions")
    transaction.add(record);
  };

  function checkDatabase() {
    let transaction = db.transaction(["pendingTransactions"], 'readwrite').objectStore("pendingTransactions");
    let allRecords = transaction.getAll();
    console.log(allRecords)
  
    allRecords.onsuccess = function () {
      if (allRecords.result.length > 0) {
        fetch('/api/transaction/bulk', {
          method: 'POST',
          body: JSON.stringify(allRecords.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
          },
        })
          .then((response) => response.json())
          .then(() => {
            // if successful, open a transaction on your pending db
            // access your pending object store
            // clear all items in your store
            let transaction = db.transaction(["pendingTransactions"], 'readwrite').objectStore("pendingTransactions");
            transaction.clear();
          });
      }
    };
  }

window.addEventListener('online', checkDatabase);