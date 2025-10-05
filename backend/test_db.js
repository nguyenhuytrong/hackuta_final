require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Expense = require('./models/Expense');
const Income = require('./models/Income');

async function testDB() {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // 2️⃣ Create a test user (if not exists)
    let user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      user = new User({
        fullName: 'Test User',
        email: 'test@example.com',
        password: '123456',
        goal_expense: 1000,
      });
      await user.save();
      console.log('🆕 Test user created');
    } else {
      console.log('✅ Test user already exists');
    }

    // 3️⃣ Create sample expense + income
    const expense = new Expense({
      userId: user._id,
      category: 'Food',
      amount: 25,
    });
    const income = new Income({
      userId: user._id,
      source: 'Salary',
      amount: 1000,
    });

    await expense.save();
    await income.save();

    console.log('💰 Sample expense & income saved');

    // 4️⃣ Retrieve and show
    const expenses = await Expense.find({ userId: user._id });
    const incomes = await Income.find({ userId: user._id });

    console.log('🧾 Expenses:', expenses);
    console.log('💵 Incomes:', incomes);

    // 5️⃣ Close connection
    await mongoose.connection.close();
    console.log('🔒 Connection closed');
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

testDB();
