/**
 * On Deck Scribe — Public Index — KN-Q1 / BP018
 * ===============================================
 * Re-exports the entire On Deck Scribe API surface.
 */

export * from "./state_file.js";
export * from "./serial.js";
export * from "./reader.js";
export * from "./writer.js";
export * from "./substrate_writeback.js";
export * from "./wrasse_triggers.js";

// Auto-register substrate write-back (KN-Q3): every ODS mutation triggers Pheromone entry.
import { registerWriteBack } from "./writer.js";
import { writeBackOnDeckEvent } from "./substrate_writeback.js";
registerWriteBack(writeBackOnDeckEvent);
