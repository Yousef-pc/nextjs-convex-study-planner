import StudyPlannerPlugin from "./study-planner/study-planner";
import WordBankPlugin from "./word-bank/word-bank";

export const pluginRegistry: Record<string, React.ComponentType> = {
  "study-planner": StudyPlannerPlugin,
  "word-bank": WordBankPlugin,
};