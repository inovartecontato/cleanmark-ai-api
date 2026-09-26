# CleanMark AI — Web-to-Markdown API for LLMs & RAG

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live_Demo-Try_Now_Free-10b981?style=for-the-badge&logo=render)](https://cleanmark-ai-api.onrender.com)
[![RapidAPI](https://img.shields.io/badge/RapidAPI-Subscribe_Pro_%249.99-0055FF?style=for-the-badge&logo=rapidapi)](https://rapidapi.com/inovartecontato/api/cleanmark-ai-web-to-markdown1)
[![Status](https://img.shields.io/badge/API_Status-100%25_Uptime-success?style=for-the-badge)](https://cleanmark-ai-api.onrender.com/v1/health)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Turn any webpage into clean, structured Markdown optimized for LLMs, vector embeddings, and autonomous AI agents.**  
*Strip HTML bloat, eliminate cookie notices, and save up to **70% on LLM token costs**.*

[🌐 Live Interactive Demo](https://cleanmark-ai-api.onrender.com) • [🔑 Get Free API Key](https://rapidapi.com/inovartecontato/api/cleanmark-ai-web-to-markdown1) • [📖 Documentation](#quickstart)

</div>

---

## ⚡ Why CleanMark AI?

When building RAG (Retrieval-Augmented Generation) pipelines, feeding raw HTML directly into OpenAI (`text-embedding-3-small`), Claude, or Cohere wastes thousands of dollars:
* **HTML Bloat:** Scripts, inline CSS, SVG paths, and cookie banners inflate your token count by 3x to 5x.
* **Overpriced Competitors:** Alternative tools charge **$50.00/mo** (Firecrawl) or **$20.00/mo** (Jina Reader) with strict rate limits.

**CleanMark AI delivers sub-second extraction at an 80% lower cost.**

---

## 📊 Comparison vs Competitors

| Feature | ⚡ CleanMark AI | 🦀 Firecrawl | 🦊 Jina Reader |
| :--- | :---: | :---: | :---: |
| **Starter Price** | **$9.99 / month** | $50.00 / month | $20.00 / month |
| **Requests Included** | **500,000 / month** | 3,000 / month | Rate limited |
| **Free Tier** | **100 req/mo (Free forever)** | 500 total | Strict throttle |
| **Token & Time Metrics** | ✅ **Built-in** | ❌ Extra config | ❌ Not included |
| **Email & Spam Validator** | ✅ **Included (/v1/validate-email)** | ❌ None | ❌ None |
| **Setup Time** | **< 60 seconds** | 10+ minutes | Custom setup |

---

## 🚀 Quickstart

### Python (Requests / LangChain)

```python
import requests

url = "https://cleanmark-ai-web-to-markdown1.p.rapidapi.com/v1/extract"

payload = {
    "url": "https://en.wikipedia.org/wiki/Artificial_intelligence"
}

headers = {
    "x-rapidapi-key": "YOUR_RAPIDAPI_KEY",
    "x-rapidapi-host": "cleanmark-ai-web-to-markdown1.p.rapidapi.com",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()

print(f"Title: {data['title']}")
print(f"Tokens: {data['metrics']['estimated_tokens']}")
print(f"Clean Markdown:\n{data['markdown'][:300]}...")
```

### TypeScript / Node.js

```typescript
const response = await fetch("https://cleanmark-ai-web-to-markdown1.p.rapidapi.com/v1/extract", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-rapidapi-key": "YOUR_RAPIDAPI_KEY",
    "x-rapidapi-host": "cleanmark-ai-web-to-markdown1.p.rapidapi.com"
  },
  body: JSON.stringify({
    url: "https://en.wikipedia.org/wiki/Artificial_intelligence"
  })
});

const data = await response.json();
console.log(data.markdown);
```

### cURL

```bash
curl -X POST "https://cleanmark-ai-web-to-markdown1.p.rapidapi.com/v1/extract" \
  -H "Content-Type: application/json" \
  -H "x-rapidapi-key: YOUR_RAPIDAPI_KEY" \
  -H "x-rapidapi-host: cleanmark-ai-web-to-markdown1.p.rapidapi.com" \
  -d '{"url": "https://en.wikipedia.org/wiki/Artificial_intelligence"}'
```

---

## 📡 Endpoints

### 1. `POST /v1/extract`
Extracts main article text into clean Markdown with full token metrics.
* **Body:** `{"url": "https://example.com"}`
* **Response:**
```json
{
  "success": true,
  "url": "https://example.com",
  "title": "Example Domain",
  "markdown": "# Example Domain\n\nThis domain is for use in illustrative examples in documents...",
  "metrics": {
    "word_count": 218,
    "reading_time_minutes": 2,
    "estimated_tokens": 290
  }
}
```

### 2. `POST /v1/validate-email`
Validates syntax, detects temporary/disposable inboxes, and checks live DNS MX records.
* **Body:** `{"email": "test@mailinator.com"}`
* **Response:**
```json
{
  "email": "test@mailinator.com",
  "is_valid_format": true,
  "is_disposable": true,
  "is_free_provider": false,
  "domain": "mailinator.com",
  "mx_found": true
}
```

---

## 💳 Pricing & Subscriptions

| Plan | Price | Monthly Limit | Features |
| :--- | :---: | :---: | :--- |
| **Basic** | **$0.00** | 100 requests | Full API access, community support |
| **PRO Developer** | **$9.99 / mo** | 500,000 requests | Sub-second latency, 99.9% SLA, email support |

👉 **[Subscribe to Pro on RapidAPI Hub](https://rapidapi.com/inovartecontato/api/cleanmark-ai-web-to-markdown1)**

---

## 📄 License
MIT License. Created by [inovartecontato](https://github.com/inovartecontato).
