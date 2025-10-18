import { useEffect } from "react";
import { db } from "./db";
import { anchors as seedAnchors, routines as seedRoutines } from "./calmData";

export function useDbSeeder() {
  useEffect(() => {
    const seed = async () => {
      const anchorCount = await db.anchors.count();
      if (anchorCount === 0) {
        const anchorsToSeed = Object.entries(seedAnchors).flatMap(
          ([group, list]) =>
            list.map((text) => ({
              text,
              group,
              isFavorite: 0,
              favoriteRank: null,
            }))
        );
        await db.anchors.bulkAdd(anchorsToSeed);
      } else {
        for (const [group, list] of Object.entries(seedAnchors)) {
          for (const text of list) {
            const existing = await db.anchors.where({ text, group }).first();
            if (!existing) {
              await db.anchors.add({
                text,
                group,
                isFavorite: 0,
                favoriteRank: null,
              });
            }
          }
        }
      }

      const routineCount = await db.routines.count();
      if (routineCount === 0) {
        const routinesToSeed = Object.entries(seedRoutines).map(
          ([name, steps]) => ({
            name,
            steps,
          })
        );
        await db.routines.bulkAdd(routinesToSeed);
      } else {
        for (const [name, steps] of Object.entries(seedRoutines)) {
          const existing = await db.routines.where({ name }).first();
          if (!existing) {
            await db.routines.add({ name, steps });
          }
        }
      }
    };

    db.on("ready", seed);

    return () => db.on("ready").unsubscribe(seed);
  }, []);
}
