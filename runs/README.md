# Runs

Optional archive of past recruitment-intelligence outputs and run metadata.

This directory is **not a sourcing channel**.

A future runtime may store or export:

- run summaries;
- stage coverage ledgers;
- source coverage;
- failed/access-limited searches;
- canonical opportunity snapshots;
- query-yield summaries;
- regression/audit artifacts.

Do not store candidate personal data, private contact data or sensitive client material here unless the repository/storage location is appropriately private and governed.


## Publication

A run payload stored here is a checkpoint, not proof of publication and not the final deliverable.

Publish/re-publish a private run payload with:

```bash
npm run rec:publish -- runs/<RUN-ID>/publication-payload.json
```

Do not commit payloads containing candidate personal data, private contacts or sensitive client information merely to make publication easier.
