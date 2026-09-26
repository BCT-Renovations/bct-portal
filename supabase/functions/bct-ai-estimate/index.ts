const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store'
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST required' }), { status: 405, headers: cors });
  }

  try {
    const u = Deno.env.get('SUPABASE_URL') || '';
    const k = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const auth = req.headers.get('authorization') || '';
    if (!u || !k) throw new Error('Supabase environment unavailable');
    if (!auth) return new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401, headers: cors });

    const h = { apikey: k, authorization: auth, 'content-type': 'application/json' };
    const rpc = async (n: string, a: Record<string, unknown> = {}) => {
      const r = await fetch(`${u}/rest/v1/rpc/${n}`, { method: 'POST', headers: h, body: JSON.stringify(a) });
      const t = await r.text();
      let d: unknown;
      try { d = t ? JSON.parse(t) : null; } catch { d = t; }
      if (!r.ok) throw new Error(typeof d === 'object' && d && 'message' in d ? String(d.message) : String(d || n + ' failed'));
      return d;
    };

    if (await rpc('is_bct_admin') !== true) {
      return new Response(JSON.stringify({ error: 'BCT admin required' }), { status: 403, headers: cors });
    }

    const b = await req.json().catch(() => ({}));
    const a = String(b.action || 'state').toLowerCase();
    let d: unknown;

    if (a === 'preview') {
      if (!b.project_id) throw new Error('project_id is required');
      d = await rpc('bct_admin_ai_estimate_preview', { p_project_id: String(b.project_id) });
    } else if (a === 'generate') {
      if (!b.project_id) throw new Error('project_id is required');
      d = await rpc('bct_admin_generate_ai_estimate', { p_project_id: String(b.project_id) });
    } else if (a === 'review') {
      if (!b.run_id) throw new Error('run_id is required');
      d = await rpc('bct_admin_review_ai_estimate', {
        p_run_id: String(b.run_id),
        p_decision: String(b.decision || ''),
        p_notes: b.notes ?? null
      });
    } else if (a === 'update_estimate') {
      if (!b.estimate_id) throw new Error('estimate_id is required');
      d = await rpc('bct_admin_update_estimate', {
        p_estimate_id: String(b.estimate_id),
        p_ai_summary: b.scope_summary ?? null,
        p_assumptions: b.assumptions ?? null,
        p_internal_notes: b.internal_notes ?? null,
        p_discount_percent: b.discount_percent ?? null
      });
    } else if (a === 'save_item') {
      if (!b.estimate_id) throw new Error('estimate_id is required');
      d = await rpc('bct_admin_save_estimate_item', {
        p_estimate_id: String(b.estimate_id),
        p_item_id: b.item_id ?? null,
        p_item_type: String(b.item_type || 'other'),
        p_description: String(b.description || ''),
        p_customer_description: b.customer_description ?? null,
        p_quantity: Number(b.quantity ?? 1),
        p_unit: String(b.unit || 'ea'),
        p_internal_unit_cost: Number(b.internal_unit_cost ?? 0),
        p_customer_unit_price: Number(b.customer_unit_price ?? 0),
        p_internal_notes: b.internal_notes ?? null,
        p_sort_order: Number(b.sort_order ?? 0)
      });
    } else if (a === 'recalculate') {
      if (!b.estimate_id) throw new Error('estimate_id is required');
      d = await rpc('bct_admin_recalculate_estimate', { p_estimate_id: String(b.estimate_id) });
    } else if (a === 'approve_customer') {
      if (!b.estimate_id) throw new Error('estimate_id is required');
      d = await rpc('bct_admin_approve_customer_estimate', { p_estimate_id: String(b.estimate_id) });
    } else if (a === 'feedback') {
      if (!b.run_id) throw new Error('run_id is required');
      d = await rpc('bct_admin_add_ai_estimate_feedback', {
        p_run_id: String(b.run_id),
        p_final_total: b.final_total ?? null,
        p_accuracy_rating: b.accuracy_rating ?? null,
        p_notes: b.notes ?? null
      });
    } else if (a === 'set_rate') {
      if (!b.service_code) throw new Error('service_code is required');
      d = await rpc('bct_admin_set_estimate_rate', {
        p_service_code: String(b.service_code),
        p_unit: String(b.unit || ''),
        p_default_quantity: Number(b.default_quantity),
        p_low_unit_cost: Number(b.low_unit_cost),
        p_high_unit_cost: Number(b.high_unit_cost),
        p_notes: b.notes ?? null
      });
    } else if (a === 'state') {
      d = await rpc('bct_admin_ai_estimating_state', { p_project_id: b.project_id ? String(b.project_id) : null });
    } else {
      throw new Error('Unknown action');
    }

    return new Response(JSON.stringify({ ok: true, action: a, data: d }), { status: 200, headers: cors });
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: String((e as { message?: unknown })?.message || e || 'Unexpected error') }),
      { status: 400, headers: cors }
    );
  }
});
