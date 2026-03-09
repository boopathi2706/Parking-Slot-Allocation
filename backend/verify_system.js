const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let token = '';
let allocationId = '';
let vehicleNumber = 'TEST-001';
let slotNumber = '';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runVerification() {
    try {
        console.log("🚀 Starting System Verification...");

        // 1. Register User
        console.log("\n1️⃣ Registering Company...");
        try {
            const regRes = await axios.post(`${BASE_URL}/auth/register`, {
                companyName: "Test Corp",
                username: `admin${Math.floor(Math.random() * 1000)}`,
                email: `test${Math.floor(Math.random() * 1000)}@example.com`,
                password: "password123",
                whatsappNumber: "1234567890"
            });
            token = regRes.data.token;
            console.log("✅ Registration Successful");
        } catch (e) {
            console.error("❌ Registration Failed:", e.response?.data || e.message);
            return;
        }

        // 2. Initialize Slots (Vehicle Config)
        console.log("\n2️⃣ Initializing Slots...");
        try {
            await axios.post(`${BASE_URL}/slots/init`, {
                twoWheeler: 5, fourWheeler: 5, bigVehicle: 2
            });
            console.log("✅ Slots Initialized");
        } catch (e) {
            console.error("❌ Slot Init Failed:", e.response?.data || e.message);
        }

        // 3. Allocate Slot
        console.log("\n3️⃣ Requesting Allocation (2W)...");
        let otp = '';
        try {
            const allocRes = await axios.post(`${BASE_URL}/allocations/allocate`, {
                ownerName: "Tester",
                ownerPhone: "9999999999",
                vehicleNumber: vehicleNumber,
                vehicleType: "2W",
                slotNumber: "2W-1"
            });
            allocationId = allocRes.data.allocationId;
            otp = allocRes.data.mockOtp;
            console.log(`✅ Allocation Requested. Mock OTP: ${otp}`);
        } catch (e) {
            console.error("❌ Allocation Request Failed:", e.response?.data || e.message);
            return;
        }

        // 4. Verify Allocation
        console.log("\n4️⃣ Verifying Allocation...");
        try {
            await axios.post(`${BASE_URL}/allocations/verify-allocate`, {
                allocationId, otp
            });
            console.log("✅ Allocation Verified");
        } catch (e) {
            console.error("❌ Allocation Verify Failed:", e.response?.data || e.message);
        }

        // 5. Check Dashboard (Should have 1 filled)
        console.log("\n5️⃣ Checking Dashboard Stats...");
        try {
            const dashRes = await axios.get(`${BASE_URL}/dashboard/stats`);
            const stats = dashRes.data.data;
            if (stats.occupiedSlots === 1) console.log("✅ Dashboard Occupancy Correct: 1");
            else console.error(`❌ Dashboard Incorrect: ${stats.occupiedSlots} occupied (Expected 1)`);
        } catch (e) {
            console.error("❌ Dashboard Check Failed:", e.message);
        }

        // 6. Calculate Exit (Deallocate)
        console.log("\n6️⃣ Calculating Exit...");
        let exitOtp = '';
        let exitAmount = 0;
        let exitHours = 0;
        try {
            const exitRes = await axios.post(`${BASE_URL}/allocations/calculate-exit`, { vehicleNumber });
            exitOtp = exitRes.data.mockOtp;
            exitAmount = exitRes.data.data.amount;
            exitHours = exitRes.data.data.durationHours;
            console.log(`✅ Exit Calculated. Amount: ₹${exitAmount}. Mock OTP: ${exitOtp}`);
        } catch (e) {
            console.error("❌ Exit Calc Failed:", e.response?.data || e.message);
            return;
        }

        // 7. Complete Exit
        console.log("\n7️⃣ Completing Deallocation...");
        try {
            await axios.post(`${BASE_URL}/allocations/complete-exit`, {
                vehicleNumber,
                otp: exitOtp,
                amount: exitAmount,
                durationHours: exitHours
            });
            console.log("✅ Deallocation Successful");
        } catch (e) {
            console.error("❌ Deallocation Failed:", e.response?.data || e.message);
        }

        console.log("\n🎉 Verification Completed Successfully!");

    } catch (error) {
        console.error("❌ Script Error:", error.message);
    }
}

runVerification();
