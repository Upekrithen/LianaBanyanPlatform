import { Router, Request, Response } from "express";
import { getCooperativeEpoch, getExpiresAt } from "../lib/epoch";
import { getSupabase } from "../lib/supabase";
import { getClientIp, hashIp, publishIpLimiter, publishSidLimiter } from "../lib/rate-limiter";
import { isValidPeanutRoll } from "../types";

const router = Router();

router.post("/", publishIpLimiter, publishSidLimiter, async (req: Request, res: Response) => {
  try {
    if (!isValidPeanutRoll(req.body)) {
      res.status(400).json({ ok: false, error: "invalid PeanutRoll: v must be 1, s must be 32-char hex" });
      return;
    }

    const roll = req.body;
    const cooperativeEpoch = getCooperativeEpoch();
    const expiresAt = getExpiresAt();
    const ipHash = hashIp(getClientIp(req));

    const supabase = getSupabase();
    const { error } = await supabase.from("wan_relay_records").upsert(
      {
        sid: roll.s,
        peanut_roll: roll,
        cooperative_epoch: cooperativeEpoch,
        expires_at: expiresAt.toISOString(),
        published_at: new Date().toISOString(),
        ip_hash: ipHash,
      },
      { onConflict: "sid" },
    );

    if (error) {
      console.error("[publish] supabase error:", error.message);
      res.status(500).json({ ok: false, error: "storage error" });
      return;
    }

    res.json({ ok: true, sid: roll.s });
  } catch (err) {
    console.error("[publish] unexpected error:", err);
    res.status(500).json({ ok: false, error: "internal error" });
  }
});

export default router;
