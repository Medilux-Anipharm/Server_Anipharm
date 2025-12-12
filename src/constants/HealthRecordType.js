const HEALTH_CONCERNS = {
  MEAL: "meal",
  WATER: "water",
  URINE: "urine",
  FECES: "feces",
  ACTIVITY: "activity",
  WEIGHT: "weight",
  SYMPTOMS: "symptoms",
};

const HEALTH_CONCERN_LABELS = {
  [HEALTH_CONCERNS.MEAL]: "식사",
  [HEALTH_CONCERNS.WATER]: "음수",
  [HEALTH_CONCERNS.URINE]: "배변",
  [HEALTH_CONCERNS.FECES]: "배변",
  [HEALTH_CONCERNS.ACTIVITY]: "활동량",
  [HEALTH_RECORD_TYPES.WEIGHT]: "체중",
  [HEALTH_RECORD_TYPES.SYMPTOMS]: "증상",
};

module.exports = {
  HEALTH_RECORD_TYPES,
  HEALTH_CONCERN_LABELS,
};
