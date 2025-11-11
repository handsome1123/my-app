const mongoose = require('mongoose');

async function checkAddresses() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/secondhandmfu';
    await mongoose.connect(mongoUri);

    const User = mongoose.model('User', new mongoose.Schema({
      name: String,
      email: String,
      shippingAddresses: [mongoose.Schema.Types.Mixed]
    }));

    const users = await User.find({ shippingAddresses: { $exists: true, $ne: [] } })
      .select('name email shippingAddresses')
      .limit(5);

    console.log('Users with shipping addresses:');
    users.forEach(user => {
      console.log(`\nUser: ${user.name} (${user.email})`);
      console.log(`Addresses: ${JSON.stringify(user.shippingAddresses, null, 2)}`);
    });

    if (users.length === 0) {
      console.log('No users found with shipping addresses. Checking all users...');
      const allUsers = await User.find({}).select('name email shippingAddresses').limit(3);
      allUsers.forEach(user => {
        console.log(`\nUser: ${user.name} (${user.email})`);
        console.log(`Addresses: ${user.shippingAddresses?.length || 0} addresses`);
        if (user.shippingAddresses && user.shippingAddresses.length > 0) {
          console.log(`Address data: ${JSON.stringify(user.shippingAddresses, null, 2)}`);
        }
      });
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

checkAddresses();