const emergencies = require("../data/emergencies");
const { predictTriage } = require("../services/mlService");

async function createEmergency(req, res) {
  try {
    const data = req.body;

    if (!data.age || !data.emergency_type) {
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
      shortness_of_breath:
        data.shortness_of_breath ?? null,

      face_drooping: data.face_drooping ?? null,
      arm_weakness: data.arm_weakness ?? null,
      speech_difficulty:
        data.speech_difficulty ?? null,

      poison_type: data.poison_type ?? null,
      vomiting: data.vomiting ?? null,
      seizures: data.seizures ?? null,

      entry_exit_burn:
        data.entry_exit_burn ?? null,
      muscle_spasm:
        data.muscle_spasm ?? null,
      fall_after_shock:
        data.fall_after_shock ?? null,

      water_type:
        data.water_type ?? null,
      water_inhalation:
        data.water_inhalation ?? null,
      cpr_required:
        data.cpr_required ?? null,

      fall_height:
        data.fall_height ?? null,
      head_injury:
        data.head_injury ?? null,

      animal_type:
        data.animal_type ?? null,
      bite_location:
        data.bite_location ?? null,
      venomous:
        data.venomous ?? null,

      weapon_involved:
        data.weapon_involved ?? null,

      injury_location:
        data.injury_location ?? null,
      visible_injury:
        data.visible_injury ?? null,
    };

    // ============================================================
    // GET REAL ML PREDICTION
    // ============================================================

    console.log("Sending patient data to ML model...");

    const mlResult = await predictTriage(patientData);

    console.log(
      "ML Prediction:",
      mlResult.predicted_priority
    );

    // ============================================================
    // CREATE EMERGENCY RECORD
    // ============================================================

    const emergency = {
      id: `EMG-${1001 + emergencies.length}`,

      // Patient information
      patient_name:
        data.patient_name || "Emergency Patient",

      phone:
        data.phone || null,

      age:
        data.age,

      // ML input features
      emergency_type:
        data.emergency_type,

      incident_location:
        data.incident_location || null,

      bleeding:
        data.bleeding ?? null,

      conscious:
        data.conscious ?? null,

      breathing:
        data.breathing ?? null,

      accident_level:
        data.accident_level ?? null,

      visible_fracture:
        data.visible_fracture ?? null,

      trapped:
        data.trapped ?? null,

      injury_type:
        data.injury_type ?? null,

      pain_level:
        data.pain_level ?? null,

      chest_pain:
        data.chest_pain ?? null,

      sweating:
        data.sweating ?? null,

      shortness_of_breath:
        data.shortness_of_breath ?? null,

      face_drooping:
        data.face_drooping ?? null,

      arm_weakness:
        data.arm_weakness ?? null,

      speech_difficulty:
        data.speech_difficulty ?? null,

      poison_type:
        data.poison_type ?? null,

      vomiting:
        data.vomiting ?? null,

      seizures:
        data.seizures ?? null,

      entry_exit_burn:
        data.entry_exit_burn ?? null,

      muscle_spasm:
        data.muscle_spasm ?? null,

      fall_after_shock:
        data.fall_after_shock ?? null,

      water_type:
        data.water_type ?? null,

      water_inhalation:
        data.water_inhalation ?? null,

      cpr_required:
        data.cpr_required ?? null,

      fall_height:
        data.fall_height ?? null,

      head_injury:
        data.head_injury ?? null,

      animal_type:
        data.animal_type ?? null,

      bite_location:
        data.bite_location ?? null,

      venomous:
        data.venomous ?? null,

      weapon_involved:
        data.weapon_involved ?? null,

      injury_location:
        data.injury_location ?? null,

      visible_injury:
        data.visible_injury ?? null,

      // ==========================================================
      // REAL ML RESULT
      // ==========================================================

      triage_priority:
        mlResult.predicted_priority,

      triage_probabilities:
        mlResult.probabilities,

      // ==========================================================
      // SYSTEM INFORMATION
      // ==========================================================

      status: "Received",

      ambulance_id:
        null,

      hospital_id:
        null,

      created_at:
        new Date().toISOString(),
    };

    // Save emergency
    emergencies.push(emergency);

    // ============================================================
    // RESPONSE
    // ============================================================

    res.status(201).json({
      success: true,

      message:
        "Emergency received and triage prediction completed",

      emergency,

      ml_prediction: {
        priority:
          mlResult.predicted_priority,

        probabilities:
          mlResult.probabilities,
      },
    });

  } catch (error) {
    console.error(
      "Emergency creation error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create emergency",
      error:
        error.message,
    });
  }
}


// ============================================================
// GET ALL EMERGENCIES
// ============================================================

function getEmergencies(req, res) {
  res.json({
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

  res.json({
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