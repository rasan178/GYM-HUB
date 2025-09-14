const express = require("express");
const { generateWorkoutPlan, generateDietPlan, generatePlanExplanation } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/workout", protect, generateWorkoutPlan);
router.post("/diet", protect, generateDietPlan);
router.post("/explanation", protect, generatePlanExplanation);

module.exports = router;
