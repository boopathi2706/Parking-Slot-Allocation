const axios = require('axios');

const BASE_URL = 'https://parking-slot-allocation.onrender.com/api';

async function testMultiUserSlots() {
    try {
        console.log("🚀 Starting Multi-User Slot Verification...");

        // 1. Register User A
        const userA_name = `userA_${Date.now()}`;
        console.log(`\nRegistering ${userA_name}...`);
        const regA = await axios.post(`${BASE_URL}/auth/register`, {
            companyName: "Company A",
            username: userA_name,
            email: `${userA_name}@example.com`,
            password: "password123",
            whatsappNumber: "1111111111"
        });
        const tokenA = regA.data.token;

        // 2. Register User B
        const userB_name = `userB_${Date.now()}`;
        console.log(`Registering ${userB_name}...`);
        const regB = await axios.post(`${BASE_URL}/auth/register`, {
            companyName: "Company B",
            username: userB_name,
            email: `${userB_name}@example.com`,
            password: "password123",
            whatsappNumber: "2222222222"
        });
        const tokenB = regB.data.token;

        // 3. Configure User A Slots (creates 2W-1)
        console.log(`\nConfiguring slots for ${userA_name}...`);
        await axios.put(`${BASE_URL}/user/vehicle-config`,
            { twoWheeler: 2, fourWheeler: 2, bigVehicle: 1 },
            { headers: { Authorization: `Bearer ${tokenA}` } }
        );
        console.log(`✅ ${userA_name} configured slots successfully.`);

        // 4. Configure User B Slots (tries to create 2W-1)
        console.log(`Configuring slots for ${userB_name}...`);
        const resB = await axios.put(`${BASE_URL}/user/vehicle-config`,
            { twoWheeler: 2, fourWheeler: 2, bigVehicle: 1 },
            { headers: { Authorization: `Bearer ${tokenB}` } }
        );
        console.log(`✅ ${userB_name} configured slots successfully.`);

        console.log("\n🎉 Verification Successful! Multi-user slot isolation is working.");

    } catch (error) {
        console.error("\n❌ Verification Failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
    }
}

testMultiUserSlots();
