const emergencies = require("../data/emergencies");
const { predictTriage } = require("../services/mlService");

async function createEmergency(req, res) {
  try {
    const data = req.body;

    if (
      data.age === undefined ||
      data.age === null ||
      data.age === "" ||
      !data.emergency_type
    ) {
      return res.status(400).json({
        success: false,
        message: "Age and emergency type are required",
      });
    }

    // ============================================================
    // CREATE PATIENT DATA FOR ML MODEL
    // ============================================================

    const patientData = {
      age: data.age,
      emergency_type: data.emergency_type,
      incident_location: data.incident_location || null,

      bleeding: data.bleeding ?? null,
      conscious: data.conscious ?? null,
      breathing: data.breathing ?? null,

      accident_level: data.accident_level ?? null,
      visible_fracture: data.visible_fracture ?? null,
      trapped: data.trapped ?? null,
      injury_type: data.injury_type ?? null,
      pain_level: data.pain_level ?? null,

      chest_pain: data.chest_pain ?? null,
      sweating: data.sweating ?? null,
      shortness_of_breath: data.shortness_of_breath ?? null,

      face_drooping: data.face_drooping ?? null,
      arm_weakness: data.arm_weakness ?? null,
      speech_difficulty: data.speech_difficulty ?? null,

      poison_type: data.poison_type ?? null,
      vomiting: data.vomiting ?? null,
      seizures: data.seizures ?? null,

      entry_exit_burn: data.entry_exit_burn ?? null,
      muscle_spasm: data.muscle_spasm ?? null,
      fall_after_shock: data.fall_after_shock ?? null,

      water_type: data.water_type ?? null,
      water_inhalation: data.water_inhalation ?? null,
      cpr_required: data.cpr_required ?? null,

      fall_height: data.fall_height ?? null,
      head_injury: data.head_injury ?? null,

      animal_type: data.animal_type ?? null,
      bite_location: data.bite_location ?? null,
      venomous: data.venomous ?? null,

      weapon_involved: data.weapon_involved ?? null,

      injury_location: data.injury_location ?? null,
      visible_injury: data.visible_injury ?? null,
    };

    // ============================================================
    // GET ML PREDICTION
    // ============================================================

    console.log("Sending patient data to ML model...");

    const mlResult = await predictTriage(patientData);

    const priority = mlResult.predicted_priority;

    console.log("ML Prediction:", priority);

    // ============================================================
    // GENERAL PRECAUTIONS BASED ON ML PREDICTION
    // ============================================================

    let precautions = [];

    if (priority === "Non-Urgent") {
      precautions = [
        "Monitor the patient's symptoms and overall condition.",
        "Allow the patient to rest in a safe, comfortable position.",
        "Seek advice from a qualified healthcare professional if symptoms persist.",
        "Do not delay medical assessment if the condition worsens.",
        "If breathing difficulty, chest pain, unconsciousness, severe bleeding, or sudden weakness occurs, seek emergency medical help immediately.",
      ];
    } else if (priority === "Urgent") {
      precautions = [
        "Arrange prompt medical assessment.",
        "Keep the patient safe and monitor their condition.",
        "Avoid unnecessary movement if a serious injury is suspected.",
        "If symptoms worsen or a life-threatening sign appears, seek emergency medical help immediately.",
      ];
    } else if (priority === "Critical") {
      precautions = [
        "Treat this as a potential medical emergency and seek immediate emergency assistance.",
        "Follow the emergency dispatcher's instructions.",
        "Monitor breathing and responsiveness.",
        "If the patient is unresponsive and not breathing normally, follow the dispatcher's CPR instructions.",
        "Do not give food, drink, or medication unless instructed by a qualified professional.",
      ];
    } else {
      precautions = [
        "The predicted priority was not recognized. Arrange assessment by a qualified healthcare professional.",
        "Do not rely on the model prediction alone to determine whether the patient is safe.",
        "Seek emergency medical help immediately if severe or rapidly worsening symptoms occur.",
      ];
    }

    // ============================================================
    // CREATE EMERGENCY RECORD
    // ============================================================

    const emergency = {
      id: `EMG-${1001 + emergencies.length}`,

      // Patient information
      patient_name: data.patient_name || "Emergency Patient",
      phone: data.phone || null,
      age: data.age,

      // Emergency information
      emergency_type: data.emergency_type,
      incident_location: data.incident_location || null,

      // ML input features
      bleeding: data.bleeding ?? null,
      conscious: data.conscious ?? null,
      breathing: data.breathing ?? null,

      accident_level: data.accident_level ?? null,
      visible_fracture: data.visible_fracture ?? null,
      trapped: data.trapped ?? null,
      injury_type: data.injury_type ?? null,
      pain_level: data.pain_level ?? null,

      chest_pain: data.chest_pain ?? null,
      sweating: data.sweating ?? null,
      shortness_of_breath: data.shortness_of_breath ?? null,

      face_drooping: data.face_drooping ?? null,
      arm_weakness: data.arm_weakness ?? null,
      speech_difficulty: data.speech_difficulty ?? null,

      poison_type: data.poison_type ?? null,
      vomiting: data.vomiting ?? null,
      seizures: data.seizures ?? null,

      entry_exit_burn: data.entry_exit_burn ?? null,
      muscle_spasm: data.muscle_spasm ?? null,
      fall_after_shock: data.fall_after_shock ?? null,

      water_type: data.water_type ?? null,
      water_inhalation: data.water_inhalation ?? null,
      cpr_required: data.cpr_required ?? null,

      fall_height: data.fall_height ?? null,
      head_injury: data.head_injury ?? null,

      animal_type: data.animal_type ?? null,
      bite_location: data.bite_location ?? null,
      venomous: data.venomous ?? null,

      weapon_involved: data.weapon_involved ?? null,

      injury_location: data.injury_location ?? null,
      visible_injury: data.visible_injury ?? null,

      // ML prediction
      triage_priority: priority,
      triage_probabilities: mlResult.probabilities,

      // Precautions based on predicted priority
      precautions: precautions,

      // System information
      status: "Received",
      ambulance_id: null,
      hospital_id: null,
      created_at: new Date().toISOString(),
    };

    // Save emergency in the current in-memory data store
    emergencies.push(emergency);

    // ============================================================
    // RESPONSE
    // ============================================================

    return res.status(201).json({
      success: true,
      message: "Emergency received and triage prediction completed",

      emergency,

      ml_prediction: {
        priority: priority,
        probabilities: mlResult.probabilities,
        precautions: precautions,
      },
    });
  } catch (error) {
    console.error("Emergency creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create emergency",
      error: error.message,
    });
  }
}

// ============================================================
// GET ALL EMERGENCIES
// ============================================================

function getEmergencies(req, res) {
  return res.json({
    success: true,
    count: emergencies.length,
    emergencies,
  });
}

// ============================================================
// GET ONE EMERGENCY
// ============================================================

function getEmergency(req, res) {
  const emergency = emergencies.find(
    (item) => item.id === req.params.id
  );

  if (!emergency) {
    return res.status(404).json({
      success: false,
      message: "Emergency not found",
    });
  }

  return res.json({
    success: true,
    emergency,
  });
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  createEmergency,
  getEmergencies,
  getEmergency,
};
