// set_goal.js
/*
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('./User'); // import User model
const readline = require('readline');
*/

// readline for console input
/*
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('User not found');
      process.exit(0);
    }

    rl.question('Enter your monthly goal expense: ', async (input) => {
      const goal = parseFloat(input);
      if (isNaN(goal) || goal <= 0) {
        console.log('❌ Invalid number. Please enter a positive number.');
        rl.close();
        process.exit(0);
      }

      user.goal_expense = goal;
      await user.save();

      console.log(
        `✅ Updated goal_expense for user: ${user.email}, Goal: $${user.goal_expense}`
      );
      rl.close();
      await mongoose.connection.close();
    });
  } catch (err) {
    console.error(err);
    rl.close();
    await mongoose.connection.close();
  }
})();
*/
