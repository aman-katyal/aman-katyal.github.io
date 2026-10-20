# Project data schema

Each project is one self-contained file in `_data/projects/<id>.yml`. Jekyll
exposes the directory as `site.data.projects`; `index.md` and
`_includes/project_modal.html` aggregate the values and sort them by `order`
before rendering.

## Required fields

| Field        | Type     | Notes                                                                |
| ------------ | -------- | -------------------------------------------------------------------- |
| `id`         | string   | Must match the filename and the `data-project-trigger` value.        |
| `order`      | integer  | Unique display order; lower numbers appear first.                    |
| `title`      | string   | Used by the card, modal, and `_includes/project_modal.html` payload. |
| `subtitle`   | string   | Short card subtitle.                                                 |
| `category`   | string   | Modal category label.                                                |
| `badge_type` | string   | Terminal-card badge.                                                 |
| `role`       | string   | Candidate role on the project.                                       |
| `year`       | string   | `YYYY` or `YYYY–YYYY` with an en dash.                               |
| `github`     | string   | Absolute `https://github.com/...` URL.                               |
| `live`       | string   | Internal `/projects/<id>/` path or an external HTTPS URL.            |
| `summary`    | string   | Card/modal summary.                                                  |
| `highlights` | string[] | At least three quantified bullets.                                   |
| `skills`     | object   | `languages`, `technologies`, and `protocols` string arrays.          |
| `images`     | object[] | At least one image with exactly one `featured: true`.                |

## Optional fields

| Field        | Type   | Notes                                                                                          |
| ------------ | ------ | ---------------------------------------------------------------------------------------------- |
| `link_label` | string | Link label for an external destination, e.g. `Devpost`.                                        |
| `link_type`  | string | `internal` (default) or `external`; external links open in a new tab and require `link_label`. |

Image objects accept `src`, `label`, `featured`, `position`, and `type`
(`video`). Every `src` must point at a real file under `assets/images/`.

The validation in `tests/data.test.js` enforces required fields, unique order
values, year format, link schemes, image existence, and unknown-key drift.
