const { User } = require('./models');
const sequelize = require('./config/db');

async function resetMaster() {
    try {
        console.log('--- PulsePoint Emergency Password Reset ---');
        console.log('Connecting to database...');
        
        await sequelize.authenticate();
        
        const master = await User.findOne({ where: { role: 'Master' } });
        
        if (!master) {
            console.log('❌ No Master account found in database. Re-seeding default...');
            await User.create({
                name: 'Master User',
                username: 'master',
                password: 'master123',
                role: 'Master',
                is_active: true
            });
            console.log('✅ Default Master account recreated.');
        } else {
            console.log(`Found Master account: ${master.username}`);
            master.password = 'master123';
            await master.save();
            console.log('✅ Master password has been reset to: master123');
        }
        
    } catch (error) {
        console.error('❌ Failed to reset password:', error.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

resetMaster();
