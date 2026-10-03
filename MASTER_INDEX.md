# Master Index and Source-Coverage Map

This file prevents silent information loss during decomposition.

## Authoritative source documents

1. `archive/originals/South_Africa_LinkedIn_Hiring_Signal_Engine.md`
2. `archive/originals/Talent_Tree_Agreed_Clients_and_Vacancy_Source_Map.md`

The original documents remain evidence/reference material. Modular files are compiled runtime instructions and must not silently contradict the originals.

## Module mapping

| Source topic | Runtime home |
|---|---|
| Purpose / hiring-signal radar | README.md + channels/linkedin/strategy.md |
| Geographic scope | channels/linkedin/strategy.md |
| R420k threshold | core/qualification.md |
| Excluded role families | core/qualification.md |
| Priority / senior role logic | core/qualification.md |
| LinkedIn signal dictionary | channels/linkedin/strategy.md |
| Early-signal dictionary | channels/linkedin/strategy.md |
| Search matrix / lanes | channels/linkedin/strategy.md |
| Image/PDF/carousel inspection | channels/linkedin/strategy.md |
| Raw signal / vacancy schema | schemas/discovered-job.schema.json |
| Employer attribution | core/employer-attribution.md |
| Deduplication | core/deduplication.md |
| Existing-client priority | sources/agreed-clients.yaml + source-governance.md |
| Mandatory agencies | channels/agencies/strategy.md |
| 350-source universe governance | sources/source-governance.md + channels/jobboards/strategy.md |
| Evidence labels | core/evidence-standard.md |
| Contact / stakeholder layer | schemas/final-opportunity.schema.json + enrichment worker |
| Final operating workflow | runtime/*.md |
| Self-learning signals / query yield | DEFERRED: future state store |
| Dashboard / KPI persistence | DEFERRED: future data layer |

## Explicitly deferred — not lost

The following topics are intentionally not implemented as live state in V1 because they require persistent storage rather than prompt text:

- query run history;
- watched-author history and scoring;
- false-positive rates;
- signal phrase yield;
- query yield;
- previous canonical vacancy state;
- employer hypothesis history;
- persistent evidence graph;
- dashboard KPI history.

They remain in the archived source documents and will be moved into the future data layer after the discovery workers are validated.

## Open decisions

Do not silently resolve these by editing worker prompts:

1. **Technology scope:** the LinkedIn source specification explicitly includes technology/data roles. Any later decision to separate pure software/data engineering into another taxonomy must be made as a deliberate policy change.
2. **Agreed-client out-of-taxonomy roles:** the source map says meaningful agreed-client vacancies may still be recorded even where they fall outside the general commercial scraper taxonomy.
3. **Rieses Food Imports and Angaza identity:** both require identity confirmation before automatic entity matching.
4. **Old Mutual:** the specific contracting entity/business unit covered by the agreement remains to be confirmed.
