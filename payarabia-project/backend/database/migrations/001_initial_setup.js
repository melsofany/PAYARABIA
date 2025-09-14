const mongoose = require('mongoose');

// Migration to create initial indexes and collections
const runMigration = async () => {
  try {
    console.log('Running migration: 001_initial_setup');
    
    const db = mongoose.connection.db;
    
    // Create collections if they don't exist
    const collections = ['users', 'admins', 'transactions', 'tickets', 'exchangerates', 'commissions'];
    
    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        console.log(`Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code !== 48) { // Collection already exists
          console.error(`Error creating collection ${collectionName}:`, error);
        }
      }
    }
    
    // Create indexes for better performance
    const indexes = [
      // Users indexes
      { collection: 'users', index: { email: 1 }, options: { unique: true } },
      { collection: 'users', index: { phone: 1 }, options: { unique: true } },
      { collection: 'users', index: { status: 1 } },
      { collection: 'users', index: { createdAt: -1 } },
      { collection: 'users', index: { 'usdtWallet.address': 1 }, options: { sparse: true } },
      
      // Admins indexes
      { collection: 'admins', index: { email: 1 }, options: { unique: true } },
      { collection: 'admins', index: { role: 1 } },
      { collection: 'admins', index: { isActive: 1 } },
      
      // Transactions indexes
      { collection: 'transactions', index: { user: 1, createdAt: -1 } },
      { collection: 'transactions', index: { transactionNumber: 1 }, options: { unique: true } },
      { collection: 'transactions', index: { status: 1 } },
      { collection: 'transactions', index: { type: 1 } },
      { collection: 'transactions', index: { createdAt: -1 } },
      { collection: 'transactions', index: { 'blockchain.txHash': 1 }, options: { sparse: true } },
      { collection: 'transactions', index: { recipient: 1 } },
      
      // Tickets indexes
      { collection: 'tickets', index: { user: 1, createdAt: -1 } },
      { collection: 'tickets', index: { ticketNumber: 1 }, options: { unique: true } },
      { collection: 'tickets', index: { status: 1 } },
      { collection: 'tickets', index: { priority: 1 } },
      { collection: 'tickets', index: { category: 1 } },
      { collection: 'tickets', index: { assignedTo: 1 } },
      { collection: 'tickets', index: { createdAt: -1 } },
      { collection: 'tickets', index: { 'voiceCall.callId': 1 }, options: { sparse: true } },
      
      // Exchange rates indexes
      { collection: 'exchangerates', index: { fromCurrency: 1, toCurrency: 1 }, options: { unique: true } },
      { collection: 'exchangerates', index: { isActive: 1 } },
      
      // Commissions indexes
      { collection: 'commissions', index: { type: 1 }, options: { unique: true } },
      { collection: 'commissions', index: { isActive: 1 } }
    ];
    
    for (const { collection, index, options } of indexes) {
      try {
        await db.collection(collection).createIndex(index, options || {});
        console.log(`Created index on ${collection}:`, index);
      } catch (error) {
        if (error.code !== 85) { // Index already exists
          console.error(`Error creating index on ${collection}:`, error);
        }
      }
    }
    
    console.log('Migration 001_initial_setup completed successfully');
  } catch (error) {
    console.error('Migration 001_initial_setup failed:', error);
    throw error;
  }
};

module.exports = runMigration;