const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../../models/User');
const Admin = require('../../models/Admin');
const ExchangeRate = require('../../models/ExchangeRate');
const Commission = require('../../models/Commission');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/payarabia');
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create sample users
    const users = [
      {
        fullName: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '+966501234567',
        password: 'password123',
        dateOfBirth: new Date('1990-01-01'),
        isVerified: true,
        status: 'active',
        wallet: {
          balance: 5000.00,
          currency: 'SAR'
        },
        usdtWallet: {
          address: '0x1234567890abcdef1234567890abcdef12345678',
          balance: 100.25
        }
      },
      {
        fullName: 'سارة أحمد',
        email: 'sara@example.com',
        phone: '+966501234568',
        password: 'password123',
        dateOfBirth: new Date('1992-05-15'),
        isVerified: true,
        status: 'active',
        wallet: {
          balance: 2500.75,
          currency: 'SAR'
        },
        usdtWallet: {
          address: '0x9876543210fedcba9876543210fedcba98765432',
          balance: 50.00
        }
      },
      {
        fullName: 'محمد علي',
        email: 'mohammed@example.com',
        phone: '+966501234569',
        password: 'password123',
        dateOfBirth: new Date('1988-12-10'),
        isVerified: false,
        status: 'pending',
        wallet: {
          balance: 0,
          currency: 'SAR'
        }
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

const seedAdmins = async () => {
  try {
    // Clear existing admins
    await Admin.deleteMany({});
    console.log('Cleared existing admins');

    // Create sample admins
    const admins = [
      {
        fullName: 'مدير النظام',
        email: 'admin@payarabia.com',
        password: 'admin123',
        role: 'super_admin',
        permissions: [
          'users_management',
          'transactions_management',
          'support_management',
          'finance_management',
          'settings_management',
          'reports_access'
        ],
        profile: {
          phone: '+966501234500',
          department: 'الإدارة العامة'
        }
      },
      {
        fullName: 'فريق الدعم',
        email: 'support@payarabia.com',
        password: 'support123',
        role: 'support',
        permissions: [
          'support_management',
          'users_management'
        ],
        profile: {
          phone: '+966501234501',
          department: 'الدعم الفني'
        }
      }
    ];

    const createdAdmins = await Admin.insertMany(admins);
    console.log(`Created ${createdAdmins.length} admins`);
    return createdAdmins;
  } catch (error) {
    console.error('Error seeding admins:', error);
  }
};

const seedExchangeRates = async () => {
  try {
    // Clear existing exchange rates
    await ExchangeRate.deleteMany({});
    console.log('Cleared existing exchange rates');

    // Create sample exchange rates
    const exchangeRates = [
      {
        fromCurrency: 'SAR',
        toCurrency: 'USD',
        rate: 0.2667,
        source: 'api'
      },
      {
        fromCurrency: 'SAR',
        toCurrency: 'EUR',
        rate: 0.2450,
        source: 'api'
      },
      {
        fromCurrency: 'SAR',
        toCurrency: 'USDT',
        rate: 0.2667,
        source: 'blockchain'
      },
      {
        fromCurrency: 'USD',
        toCurrency: 'SAR',
        rate: 3.7500,
        source: 'api'
      },
      {
        fromCurrency: 'USD',
        toCurrency: 'USDT',
        rate: 1.0000,
        source: 'blockchain'
      },
      {
        fromCurrency: 'EUR',
        toCurrency: 'SAR',
        rate: 4.0800,
        source: 'api'
      }
    ];

    const createdRates = await ExchangeRate.insertMany(exchangeRates);
    console.log(`Created ${createdRates.length} exchange rates`);
    return createdRates;
  } catch (error) {
    console.error('Error seeding exchange rates:', error);
  }
};

const seedCommissions = async () => {
  try {
    // Clear existing commissions
    await Commission.deleteMany({});
    console.log('Cleared existing commissions');

    // Create sample commissions
    const commissions = [
      {
        type: 'local_transfer',
        name: 'عمولة التحويل المحلي',
        description: 'عمولة التحويل بين المستخدمين داخل المملكة',
        rate: 0.5,
        rateType: 'percentage',
        minimumAmount: 1,
        currency: 'SAR',
        applicableTo: ['individual', 'business', 'premium']
      },
      {
        type: 'international_transfer',
        name: 'عمولة التحويل الدولي',
        description: 'عمولة التحويل إلى خارج المملكة',
        rate: 2.0,
        rateType: 'percentage',
        minimumAmount: 10,
        currency: 'SAR',
        applicableTo: ['individual', 'business', 'premium']
      },
      {
        type: 'currency_exchange',
        name: 'عمولة تحويل العملة',
        description: 'عمولة تحويل العملات',
        rate: 1.0,
        rateType: 'percentage',
        minimumAmount: 5,
        currency: 'SAR',
        applicableTo: ['individual', 'business', 'premium']
      },
      {
        type: 'deposit',
        name: 'عمولة الإيداع',
        description: 'عمولة إيداع الأموال في المحفظة',
        rate: 0,
        rateType: 'percentage',
        minimumAmount: 0,
        currency: 'SAR',
        applicableTo: ['individual', 'business', 'premium']
      },
      {
        type: 'withdrawal',
        name: 'عمولة السحب',
        description: 'عمولة سحب الأموال من المحفظة',
        rate: 1.5,
        rateType: 'percentage',
        minimumAmount: 5,
        currency: 'SAR',
        applicableTo: ['individual', 'business', 'premium']
      }
    ];

    const createdCommissions = await Commission.insertMany(commissions);
    console.log(`Created ${createdCommissions.length} commissions`);
    return createdCommissions;
  } catch (error) {
    console.error('Error seeding commissions:', error);
  }
};

const runSeeds = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seeding...');
    
    await seedUsers();
    await seedAdmins();
    await seedExchangeRates();
    await seedCommissions();
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds();
}

module.exports = {
  seedUsers,
  seedAdmins,
  seedExchangeRates,
  seedCommissions,
  runSeeds
};