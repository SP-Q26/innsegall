// GET /innsegall/issue_spotlight — Export recent issue_spotlight rows for publish flywheel.
// API group innsegall_ops · same X-API-Key auth as POST /innsegall/events.
// Turn OFF default user/JWT auth on this route.
//
// Vercel / operator:
//   XANO_ISSUE_SPOTLIGHT_URL=https://{instance}.xano.io/api:innsegall_ops/innsegall/issue_spotlight
//   XANO_API_KEY=<same value as sk_live_innsegall_ops_>
//
// Or omit XANO_ISSUE_SPOTLIGHT_URL · scripts derive URL from XANO_EVENTS_URL.

query "innsegall/issue_spotlight" verb=GET {
  api_group = "innsegall_ops"

  input {
    int days?=14 filters=min:1|max:90
  }

  stack {
    var $api_key {
      value = ($env.$http_headers|get:"x-api-key"|to_text|trim)|first_notempty:($env.$http_headers|get:"X-API-Key"|to_text|trim)
    }

    precondition (($api_key == $env.sk_live_innsegall_ops_) || ($api_key == $env.sk_test_innsegall_ops_)) {
      error_type = "accessdenied"
      error = "Unauthorized: Invalid Vercel Handshake Token"
    }

    var $cutoff {
      value = (now|transform_timestamp:"-" ~ $input.days ~ " days"|format_timestamp:"Y-m-d":"UTC")
    }

    db.query innsegall_events {
      where = $db.innsegall_events.event == "issue_spotlight" && $db.innsegall_events.day >= $cutoff
      sort = {innsegall_events.day: "desc"}
      return = {type: "list"}
    } as $rows
  }

  response = $rows
}
