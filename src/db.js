import Dexie from "dexie";

export const db = new Dexie("CalmKitDB");

db.version(2).stores({
  logs: "++id, time, trigger, emotion, intensity, anchor",
  anchors: "++id, &text, group, isFavorite, favoriteRank",
  routines: "++id, &name, steps",
});
