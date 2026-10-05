const ML_API_URL =
    process.env.ML_API_URL || "http://localhost:8000/predict";

async function predictTriage(patientData) {
    try {
        console.log("Calling ML API:", ML_API_URL);

        const response = await fetch(ML_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(patientData),
        });

        const result = await response.json();

        if (!response.ok || result.status !== "success") {
            throw new Error(
                result.message || "ML prediction failed"
            );
        }

        return result;

    } catch (error) {
        console.error("ML API Error:", error.message);
        throw error;
    }
}

module.exports = {
    predictTriage,
};