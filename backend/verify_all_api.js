const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function verifyAll() {
    try {
        console.log("🚀 Starting Comprehensive API Verification...");

        // 1. Register
        const username = `audituser_${Date.now()}`;
        console.log(`\n1️⃣ Registering ${username}...`);
        const regRes = await axios.post(`${BASE_URL}/auth/register`, {
            companyName: "Audit Corp",
            username: username,
            email: `${username}@example.com`,
            password: "password123",
            whatsappNumber: "9876543210"
        });
        const token = regRes.data.token;
        console.log("✅ Registration Successful");

        // 2. Configure Slots
        console.log("\n2️⃣ Configuring Slots (2W:5, 4W:5, Big:2)...");
        await axios.put(`${BASE_URL}/user/vehicle-config`,
            { twoWheeler: 5, fourWheeler: 5, bigVehicle: 2 },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("✅ Configuration Successful");

        // 3. Check Initial Dashboard
        console.log("\n3️⃣ Checking Initial Dashboard...");
        let dashRes = await axios.get(`${BASE_URL}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        let stats = dashRes.data.data;
        console.log(`Stats: Total=${stats.totalSlots}, Free=${stats.freeSlots}, Filled=${stats.filledSlots}`);
        if (stats.totalSlots !== 12 || stats.freeSlots !== 12) throw new Error("Incorrect Initial Stats");

        // 4. Allocate Slot (2W-1)
        console.log("\n4️⃣ Allocating Slot 2W-1...");
        const allocReq = await axios.post(`${BASE_URL}/allocations/allocate`, {
            vehicleNumber: "AUDIT-001",
            vehicleType: "2W",
            ownerName: "Auditor",
            ownerPhone: "9000000000",
            slotNumber: "2W-1"
        }, { headers: { Authorization: `Bearer ${token}` } });

        const allocationId = allocReq.data.allocationId;
        const otp = allocReq.data.mockOtp;
        console.log(`✅ Allocation ID: ${allocationId}, OTP: ${otp}`);

        // 5. Verify Allocation
        console.log("\n5️⃣ Verifying Allocation...");
        await axios.post(`${BASE_URL}/allocations/verify-allocate`, {
            allocationId, otp
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log("✅ Allocation Verified");

        // 6. Check Dashboard (After Allocation)
        console.log("\n6️⃣ Checking Dashboard After Allocation...");
        dashRes = await axios.get(`${BASE_URL}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        stats = dashRes.data.data;
        console.log(`Stats: Total=${stats.totalSlots}, Free=${stats.freeSlots}, Filled=${stats.filledSlots}, Entry=${stats.todaysEntry}`);
        if (stats.filledSlots !== 1 || stats.freeSlots !== 11 || stats.todaysEntry !== 1) throw new Error("Stats not updated after allocation");

        // 7. Calculate Exit
        console.log("\n7️⃣ Calculating Exit for AUDIT-001...");
        const exitCalc = await axios.post(`${BASE_URL}/allocations/calculate-exit`, {
            vehicleNumber: "AUDIT-001"
        }, { headers: { Authorization: `Bearer ${token}` } });
        const amount = exitCalc.data.data.amount;
        console.log(`✅ Amount: ₹${amount}`);

        // 8. Complete Exit
        console.log("\n8️⃣ Completing Exit...");
        await axios.post(`${BASE_URL}/allocations/complete-exit`, {
            vehicleNumber: "AUDIT-001",
            otp: otp,
            amount: amount,
            durationHours: exitCalc.data.data.durationHours
        }, { headers: { Authorization: `Bearer ${token}` } });
        console.log("✅ Exit Completed");

        // 9. Check Dashboard (Final)
        console.log("\n9️⃣ Checking Final Dashboard...");
        dashRes = await axios.get(`${BASE_URL}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        stats = dashRes.data.data;
        console.log(`Stats: Total=${stats.totalSlots}, Free=${stats.freeSlots}, Filled=${stats.filledSlots}, Revenue=₹${stats.todaysRevenue}`);
        if (stats.filledSlots !== 0 || stats.freeSlots !== 12 || stats.todaysRevenue !== amount) throw new Error("Stats not updated after exit");

        console.log("\n🎉 ALL TESTS PASSED! API and Data Persistence are fully verified.");

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

verifyAll();
