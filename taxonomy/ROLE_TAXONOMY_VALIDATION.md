# Role Taxonomy Validation

## Confirmed

- The master taxonomy is preserved verbatim in `taxonomy/Talent_Tree_Master_Recruitment_Role_Taxonomy.md`.
- The compiled registry contains **271 role nodes**.
- IDs are continuous from **1 through 271**.
- No duplicate node IDs were detected.
- Node 1 is **Executive Leadership**.
- Node 271 is **Innovation Labs**.

## Internal source discrepancy

The final paragraph of the source states that the taxonomy contains **271 nodes across 35 functional groupings**.

The actual functional headings run from **A through AJ**. Counting those named headings gives **36 functional groupings**.

The build does not silently remove or merge a grouping merely to force the summary count to 35. The machine-readable registry therefore records:

- `role_node_count: 271`
- `functional_group_count: 36`

The original "35 functional groupings" wording remains untouched in the preserved master.

## Authority rule

Until an explicit later taxonomy revision resolves the count discrepancy, the **actual named groups and all 271 nodes** govern.
