import { IDropdownOption } from "@fluentui/react/lib/Dropdown";
import { ColumnItem } from "./column.type";

export interface ViewItem extends IDropdownOption {
    type?: string
    uniqueName?: string,
    dataType?: string | number,
    columns?: ColumnItem[],
    records?: any[]
  }