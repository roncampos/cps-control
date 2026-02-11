# CPS Control - Integration Reference

**Full integration architecture:** See `../cps-documentation/INTEGRATION.md`

---

## Quick Reference

### **What CPS Control Owns**
- EOS tracking (Rocks progress, Scorecard actuals, Issues IDS)
- Agent coordination (tasks, messages, activities)
- Dashboard UI
- Deal pipeline (leads, properties, buyers, transactions)

### **What cps-documentation Owns**
- QuickBooks integration
- Notion sync
- RAG search
- Slack transcripts
- All external data integrations

---

## Current Status

**Connected:** ❌ Not yet  
**Using:** Static seed data  
**Next Step:** Connect to cps-documentation HTTP API

---

## Development Protocol

Before building new features:
1. Check `../cps-documentation/INTEGRATION.md`
2. If you need data from external systems → request API endpoint
3. Never duplicate integrations (QuickBooks, Notion, etc.)

---

## API Endpoints (When Ready)

```
http://localhost:8000/api/notion/rocks?quarter=2026-Q1
http://localhost:8000/api/notion/scorecard?week=2026-W06
http://localhost:8000/api/quickbooks/cash-position
http://localhost:8000/api/rag/search?query=...
```

See full spec in `../cps-documentation/INTEGRATION.md`

---

**Last Updated:** 2026-02-11
