
from typing import Literal, get_args

ClientType = Literal["B2B", "B2C"]
Language = Literal["fr", "ar"]
Theme = Literal["light", "dark", "system"]
InvoiceStatus = Literal["draft", "issued", "paid", "cancelled"]
InvoiceEventType = Literal["issued", "paid", "unpaid", "cancelled"]
PaymentRail = Literal["cash", "bank_transfer", "cheque", "ccp", "card"]

PAYMENT_RAIL_LABELS = {
    "cash": "Cash",
    "bank_transfer": "Bank transfer",
    "cheque": "Cheque",
    "ccp": "CCP (postal account)",
    "card": "Bank card",
}

# a rail without a label fails at startup (KeyError), not in the frontend
PAYMENT_RAIL_OPTIONS = [
    {"value": v, "label": PAYMENT_RAIL_LABELS[v]} for v in get_args(PaymentRail)
]

LOOKUPS = {
    "client_types": list(get_args(ClientType)),
    "languages": list(get_args(Language)),
    "themes": list(get_args(Theme)),
    "invoice_statuses": list(get_args(InvoiceStatus)),
    "invoice_event_types": list(get_args(InvoiceEventType)),
    "payment_rails": PAYMENT_RAIL_OPTIONS,
}