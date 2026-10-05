# Agent BCT Photo Recommendation System — Isolated V46 Test Plan

## Isolation
- Branch: agent-bct-photo-recommendations
- Parent: bct-photo-build
- No production deployment performed by this build.
- Existing bct_gallery_photos storage/table remains the source of photos.
- No second photo-storage bucket or replacement gallery is created.

## Architecture inspection result
Existing V46 photo architecture already provides:
- public.bct_gallery_photos
- private bct-gallery Storage bucket
- Admin Photo Control
- multi-photo upload
- photo category, caption, alt text, work date
- publish/hide controls
- front-page selection/order
- public gallery/full-gallery rendering
- signed URLs for private photo access

Missing capability identified:
- private Agent BCT recommendation records
- recommendation analysis/reason fields
- Admin Use / Reject / Later feedback
- Admin category correction feedback
- isolated recommendation UI and AI adapter

## Required safety tests
1. A recommendation can be created without changing bct_gallery_photos.is_published.
2. A recommendation can be created without changing bct_gallery_photos.show_on_home.
3. Agent BCT cannot write to gallery publication fields.
4. Public/anon users cannot read recommendation rows.
5. Only BCT Admin can create/update recommendation rows.
6. Use records admin_decision=use; Reject records reject; Later records later.
7. Category corrections are stored separately from the Agent suggestion.
8. Marketing permission is not inferred from the recommendation.
9. Test analysis uses no external AI provider.
10. AI analysis is disabled unless OPENAI_API_KEY is explicitly configured.
11. AI analysis returns recommendation data only; it has no publication operation.
12. Existing Photo Control upload/publish/hide/remove workflow remains intact.

## Functional tests
- Run Test Recommendations.
- Select a photo from Photo Control and invoke Agent BCT.
- Verify actual photo appears in the recommendation card.
- Verify category suggestion and confidence.
- Verify photo quality/usefulness.
- Verify marketing value.
- Verify before/after value.
- Verify workmanship visibility.
- Verify recommendation reason.
- Correct category and save a decision.
- Use / Reject / Later each persist.
- Refresh and verify the decision remains.
- Confirm the photo is still hidden unless separately published by the existing Admin Photo Control workflow.

## AI tests after provider configuration
- Send a private signed image URL to the isolated endpoint.
- Confirm JSON-only recommendation output.
- Confirm no publication fields are accepted or written.
- Confirm conservative behavior when the image is ambiguous.
- Confirm model/provider failure leaves the existing gallery unchanged.

## Integration gate
Do not merge or apply the migration to production until all tests above pass in an isolated environment and the Admin explicitly approves integration.
