# 🗂️ Dynamics 365 Kanban View Control (PCF)

A PowerApps Component Framework (PCF) control that allows users to visualize and manage Dataverse records in a highly customizable Kanban board format.

> **⚠️ Important Configuration Note for Makers**
> To ensure compatibility with the **Dataverse Modern View Designer** (which struggles to save controls with a high number of properties), all configuration for this control has been consolidated into **6 JSON-based properties**. 
> 
> You do not need to provide every setting! If you omit a property from your JSON, the control will simply use its built-in default behavior. **Always ensure your JSON is valid before pasting it.**

---

## 🛠️ Configuration Guide

When adding this control to a view, you will see 6 input properties. Paste the corresponding JSON into these fields to customize the board's behavior.

### 1. General Configuration (`generalConfig`)
Controls default view states, basic behaviors, and notifications.

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `defaultView` | string | `""` | The default column to group by. |
| `hideViewBy` | boolean | `false` | Hides the "View By" selector if `defaultView` is set. |
| `allowCreateNew` | boolean | `true` | Shows the '+' button to create new records on the board. |
| `notificationPosition` | string | `"topEnd"` | Where toast messages appear. Options: `top`, `topStart`, `topEnd`, `bottom`, `bottomStart`, `bottomEnd`. |

**Example:**
```json
{
  "defaultView": "statuscode",
  "hideViewBy": false,
  "allowCreateNew": true,
  "notificationPosition": "bottomEnd"
}
```

---

### 2. Board Configuration (`boardConfig`)
Controls the layout, sizing, and scaling of the Kanban columns.

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `expandBoardToFullWidth` | boolean | `false` | Forces the board to stretch across the available screen width. |
| `hideEmptyColumns` | boolean | `false` | Hides columns that contain 0 cards. |
| `minColumnWidth` | number | `400` | Minimum column width in pixels. |
| `maxColumnWidth` | number | `null` | Maximum column width in pixels (leave null for no limit). |
| `initialCardsVisible` | number | `30` | Number of cards to load initially per column (lazy loads more on scroll). |
| `columnWidths` | array | `[]` | Set specific pixel widths for specific columns by ID. |

**Example:**
```json
{
  "expandBoardToFullWidth": true,
  "hideEmptyColumns": true,
  "minColumnWidth": 350,
  "initialCardsVisible": 50,
  "columnWidths": [
    { "id": "Develop", "width": 280 },
    { "id": "Close", "width": 300 }
  ]
}
```

---

### 3. Card Configuration (`cardConfig`)
Controls how users interact with individual cards.

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `allowCardMove` | boolean | `true` | Allows dragging and dropping cards between columns. |
| `showOpenInNewTabButton` | boolean | `false` | Adds a button to open the record in a new browser tab. |
| `hideColumnFieldOnCard` | boolean | `false` | Hides the field used for grouping (View By) from the card body to save space. |
| `cardMoveValidationFunction` | string | `""` | Global JS function to call before allowing a card move. |
| `cardMoveValidationScript` | string | `""` | Web resource name (e.g., `prefix_/scripts/val.js`) loaded when the view opens. |

**Example:**
```json
{
  "allowCardMove": true,
  "showOpenInNewTabButton": true,
  "hideColumnFieldOnCard": true,
  "cardMoveValidationFunction": "KanbanRules.validateMove",
  "cardMoveValidationScript": "nova_/scripts/kanban_validate.js"
}
```

---

### 4. Field Formatting (`fieldConfig`)
Highly customizable rendering rules for specific fields displayed on the cards. Use the **logical name** of the fields present in your dataset.

* `hiddenFieldsOnCard`: Array of fields loaded but not shown.
* `htmlFieldsOnCard`: Array of fields rendered as sanitized HTML.
* `allowedHtmlTagsOnCard`: Comma-separated tags (e.g., `p,br,b,i,a`).
* `allowedHtmlAttributesOnCard`: Comma-separated attributes (e.g., `href`).
* `hideLabelForFieldsOnCard`: Array of fields where the label is hidden.
* `fieldDisplayNamesOnCard`: Override display names (Array of `{ logicalName, displayName }`).
* `booleanFieldHighlights`: Adds visual markers (Array of `{ logicalName, color, type }`. Types: `left`, `right`, `cornerTopLeft`, etc.).
* `fieldWidthsOnCard`: Set percentage widths for fields (Array of `{ logicalName, width }`).
* `lookupFieldsAsPersonaOnCard`: Displays lookups as Persona avatars.
* `lookupFieldsPersonaIconOnlyOnCard`: Displays Persona as icon only (no text).
* `showEmailAndPhoneAsLinks`: Renders emails as `mailto:` and phones as `tel:`.
* `ellipsisFieldsOnCard`: Array of fields to truncate with an ellipsis.

**Example:**
```json
{
  "hiddenFieldsOnCard": ["createdon", "modifiedon"],
  "htmlFieldsOnCard": ["description"],
  "allowedHtmlTagsOnCard": "p,br,b,i,ul,li,a",
  "allowedHtmlAttributesOnCard": "href",
  "hideLabelForFieldsOnCard": ["name", "description"],
  "fieldDisplayNamesOnCard": [
    { "logicalName": "estimatedvalue", "displayName": "Revenue" }
  ],
  "booleanFieldHighlights": [
    { "logicalName": "isrevenueprojected", "color": "#ff0000", "type": "left" }
  ],
  "fieldWidthsOnCard": [
    { "logicalName": "description", "width": 100 },
    { "logicalName": "estimatedvalue", "width": 50 }
  ],
  "lookupFieldsAsPersonaOnCard": ["ownerid"],
  "lookupFieldsPersonaIconOnlyOnCard": [],
  "showEmailAndPhoneAsLinks": true,
  "ellipsisFieldsOnCard": ["name"]
}
```

---

### 5. Filters & Sorting (`filterSortConfig`)
Define quick filters, custom sorting, and powerful filter presets.

#### Filter Preset Syntax Guide:
* **Current User:** `"{{currentUser}}"`
* **Dates:** `"today"`, `"last7"`, `"last30"`, `"currentMonth"`, `"currentYear"`, `"currentWeek"`, `"nextWeek"`, `"nextMonth"`.
* **Date Ranges:** `"YYYY-MM-DD|YYYY-MM-DD"` or `{ "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" }`
* **Numbers:** `"gt:123"` (>), `"lt:456"` (<), `"gte:0"` (>=), `"lte:1000"` (<=), `"between:100|5000"`.

**Example:**
```json
{
  "quickFilterFields": ["statuscode", "ownerid"],
  "quickFilterFieldsInPopup": ["ownerid"],
  "sortFields": ["createdon", "estimatedvalue", "name"],
  "defaultSort": { 
    "field": "createdon", 
    "direction": "desc" 
  },
  "filterPresets": [
    { 
      "id": "my-opportunities", 
      "label": "My Opportunities", 
      "filters": { "ownerid": "{{currentUser}}" } 
    },
    { 
      "id": "high-value", 
      "label": "Revenue > $10k", 
      "filters": { "estimatedvalue": "gt:10000" } 
    },
    { 
      "id": "closing-this-month", 
      "label": "Closing This Month", 
      "filters": { "estimatedclosedate": "currentMonth" } 
    }
  ]
}
```

---

### 6. BPF Configuration (`bpfConfig`)
Manage how Business Process Flows map to Kanban columns.

| Property | Type | Description |
| :--- | :--- | :--- |
| `filteredBusinessProcessFlows` | array | Names of BPFs to filter out/exclude from the board. |
| `businessProcessFlowStepOrder` | array | Force a specific order for BPF stages (Array of `{ id, order }`). |

**Example:**
```json
{
  "filteredBusinessProcessFlows": ["Lead to Opportunity Sales Process"],
  "businessProcessFlowStepOrder": [
    { "id": "Qualify", "order": 1 },
    { "id": "Develop", "order": 2 },
    { "id": "Propose", "order": 3 },
    { "id": "Close", "order": 4 }
  ]
}
```

---

## 🛑 Troubleshooting

**My view won't load / The board is blank!**
The most common cause is invalid JSON in one of the configuration properties. 
1. Copy the JSON from the Dataverse designer.
2. Paste it into a validator like [JSONLint](https://jsonlint.com/).
3. Ensure all property names and string values are wrapped in double quotes (`"`). Single quotes (`'`) are invalid in JSON.
4. Ensure there are no trailing commas at the end of lists or objects.