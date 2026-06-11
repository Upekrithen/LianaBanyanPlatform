import { Router, Request, Response } from "express";
import { isExpired } from "../lib/epoch";
import { getSupabase } from "../lib/supabase";
import { resolveIpLimiter } from "../lib/rate-limiter";
import { isValidSid, PeanutRoll } from "../types";

const router = Router();

router.get("/:sid", resolveIpLimiter, async (req: Request, res: Response) => {
  try {
    const { sid } = req.params;

    if (!isValidSid(sid)) {
      res.status(400).json({ error: "invalid SID: must be 32-char hex" });
      return;
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("wan_relay_records")
      .select("peanut_roll, expires_at")
      .eq("sid", sid)
      .maybeSingle();

    if (error) {
      console.error("[resolve] supabase error:", error.message);
      res.status(500).json({ error: "storage error" });
      return;
    }

    if (!data || isExpired(data.expires_at)) {
      res.status(404).json({ error: "not found" });
      return;
    }

    res.status(200).json(data.peanut_roll as PeanutRoll);
  } catch (err) {
    console.error("[resolve] unexpected error:", err);
    res.status(500).json({ error: "internal error" });
  }
});

export default router;
