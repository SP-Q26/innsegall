// POST /innsegall/events — Ingest operational events into innsegall_events.
// Paste into API group innsegall_ops · turn OFF default user/JWT auth on this route.
//
// Xano → Settings → Environment variables (names must match $env.* below):
//
//   sk_live_innsegall_ops_  = <prod secret · e.g. sk_live_innsegall_ops_<openssl rand -base64 32>>
//   sk_test_innsegall_ops_  = <preview secret · optional>
//
// If you ONLY have sk_live_innsegall_ops_, drop the || $env.sk_test… branch in step 0.
//
// Vercel XANO_API_KEY = same secret string as the matching Xano env value.
// Header: X-API-Key (see web/lib/xano-forward.mjs)
//
// Headers: $env.$http_headers|get:"x-api-key" — NOT http.headers (parser error).

query "innsegall/events" verb=POST {
  api_group = "innsegall_ops"

  input {
    text event filters=trim
    json payload
    date? day?
    text? engine_version?
    text source filters=trim
    timestamp? received_at?
  }

  stack {
    // 0. Auth · X-API-Key handshake (not Meta API key · not user JWT)
    var $api_key {
      value = ($env.$http_headers|get:"x-api-key"|to_text|trim)|first_notempty:($env.$http_headers|get:"X-API-Key"|to_text|trim)
    }

    precondition (($api_key == $env.sk_live_innsegall_ops_) || ($api_key == $env.sk_test_innsegall_ops_)) {
      error_type = "accessdenied"
      error = "Unauthorized: Invalid Vercel Handshake Token"
    }

    // 1. Validate event type
    var $allowed_events {
      value = [
        "install_ping"
        "scout_aggregate"
        "marketing_ping"
        "issue_spotlight"
        "checkout_complete"
        "clan_subscription"
        "clan_renewal"
      ]
    }

    precondition ($allowed_events|some:$$ == $input.event) {
      error_type = "inputerror"
      error = "Event type '" ~ $input.event ~ "' is not allowed."
    }

    // 2. Security: forbidden keys in payload (no PII · no card bodies)
    var $payload_keys {
      value = $input.payload|keys
    }

    var $forbidden_keys {
      value = ["email", "path", "hostname", "html", "card_json", "customer_email"]
    }

    var $violations {
      value = $payload_keys|intersect:$forbidden_keys
    }

    precondition (($violations|count) == 0) {
      error_type = "inputerror"
      error = "Payload contains forbidden keys: " ~ ($violations|join:", ")
    }

    // 3. Derived fields
    var $day_val {
      value = $input.day ?? (now|format_timestamp:"Y-m-d":"UTC")
    }

    var $ev_val {
      value = $input.engine_version ?? ($input.payload|get:"engine_version")
    }

    // 4. Insert
    db.add innsegall_events {
      data = {
        event         : $input.event
        payload       : $input.payload
        day           : $day_val
        engine_version: $ev_val
        source        : $input.source
      }
    } as $record
  }

  response = {ok: true, id: $record.id}
}
