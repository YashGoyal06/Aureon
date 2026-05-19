import re


CATEGORY_RULES = [
    {
        "key": "income",
        "name": "Income",
        "patterns": [
            "salary",
            "payroll",
            "paycheck",
            "credited",
            "deposit",
            "interest",
            "refund",
        ],
        "positive_only": True,
    },
    {
        "key": "dining",
        "name": "Food & Dining",
        "patterns": [
            "zomato",
            "swiggy",
            "mcdonald",
            "domino",
            "pizza",
            "restaurant",
            "cafe",
            "burger",
            "kfc",
            "subway",
            "dining",
        ],
    },
    {
        "key": "coffee",
        "name": "Coffee & Cafes",
        "patterns": ["starbucks", "coffee", "ccd", "barista"],
    },
    {
        "key": "groceries",
        "name": "Groceries",
        "patterns": [
            "grocery",
            "groceries",
            "dmart",
            "bigbasket",
            "blinkit",
            "zepto",
            "walmart",
            "target",
            "whole foods",
            "supermarket",
        ],
    },
    {
        "key": "transportation",
        "name": "Transportation",
        "patterns": [
            "uber",
            "ola",
            "rapido",
            "metro",
            "fuel",
            "petrol",
            "gas",
            "shell",
            "parking",
            "toll",
        ],
    },
    {
        "key": "entertainment",
        "name": "Entertainment",
        "patterns": [
            "netflix",
            "spotify",
            "prime",
            "hotstar",
            "bookmyshow",
            "cinema",
            "movie",
            "youtube",
        ],
    },
    {
        "key": "shopping",
        "name": "Shopping",
        "patterns": [
            "amazon",
            "flipkart",
            "myntra",
            "ajio",
            "nykaa",
            "shopping",
            "store",
            "mall",
        ],
    },
    {
        "key": "healthcare",
        "name": "Healthcare",
        "patterns": [
            "pharmacy",
            "medical",
            "hospital",
            "clinic",
            "doctor",
            "apollo",
            "1mg",
            "pharmeasy",
        ],
    },
    {
        "key": "education",
        "name": "Education",
        "patterns": [
            "school",
            "college",
            "tuition",
            "course",
            "udemy",
            "coursera",
            "book",
            "exam",
        ],
    },
    {
        "key": "housing",
        "name": "Housing",
        "patterns": [
            "rent",
            "maintenance",
            "electricity",
            "water bill",
            "gas bill",
            "mortgage",
            "society",
        ],
    },
]


FALLBACK_CATEGORY = {"key": "miscellaneous", "name": "Miscellaneous"}


def normalize_text(*values):
    text = " ".join(str(value or "") for value in values).lower()
    return re.sub(r"\s+", " ", text).strip()


def categorize_transaction(merchant, note="", amount=None):
    text = normalize_text(merchant, note)
    numeric_amount = None

    try:
        numeric_amount = float(amount) if amount is not None else None
    except (TypeError, ValueError):
        numeric_amount = None

    for rule in CATEGORY_RULES:
        if rule.get("positive_only") and numeric_amount is not None and numeric_amount <= 0:
            continue

        if any(pattern in text for pattern in rule["patterns"]):
            return {
                "category": rule["name"],
                "category_key": rule["key"],
                "confidence": "high",
                "matched_rule": rule["key"],
            }

    if numeric_amount is not None and numeric_amount > 0:
        return {
            "category": "Income",
            "category_key": "income",
            "confidence": "medium",
            "matched_rule": "positive_amount",
        }

    return {
        "category": FALLBACK_CATEGORY["name"],
        "category_key": FALLBACK_CATEGORY["key"],
        "confidence": "low",
        "matched_rule": None,
    }


def should_auto_categorize(category=None, category_key=None):
    generic_values = {"", None, "other", "misc", "miscellaneous", "uncategorized"}
    normalized_category = category.lower() if isinstance(category, str) else category
    normalized_key = category_key.lower() if isinstance(category_key, str) else category_key
    return normalized_key in generic_values or normalized_category in generic_values
