export interface IGeneralConfig {
    defaultView?: string;
    hideViewBy?: boolean;
    allowCreateNew?: boolean;
    notificationPosition?: 'top' | 'topStart' | 'topEnd' | 'bottom' | 'bottomStart' | 'bottomEnd';
}

export interface IBoardConfig {
    expandBoardToFullWidth?: boolean;
    minColumnWidth?: number;
    maxColumnWidth?: number;
    initialCardsVisible?: number;
    columnWidths?: { id: string; width: number }[];
    hideEmptyColumns?: boolean;
}

export interface ICardConfig {
    allowCardMove?: boolean;
    showOpenInNewTabButton?: boolean;
    hideColumnFieldOnCard?: boolean;
    cardMoveValidationFunction?: string;
    cardMoveValidationScript?: string;
}

export interface IFieldConfig {
    hiddenFieldsOnCard?: string[];
    htmlFieldsOnCard?: string[];
    allowedHtmlTagsOnCard?: string;
    allowedHtmlAttributesOnCard?: string;
    hideLabelForFieldsOnCard?: string[];
    fieldDisplayNamesOnCard?: { logicalName: string; displayName: string }[];
    booleanFieldHighlights?: { logicalName: string; color: string; type?: string }[];
    fieldWidthsOnCard?: { logicalName: string; width: number }[];
    lookupFieldsAsPersonaOnCard?: string[];
    lookupFieldsPersonaIconOnlyOnCard?: string[];
    showEmailAndPhoneAsLinks?: boolean;
    ellipsisFieldsOnCard?: string[];
}

export interface IFilterSortConfig {
    quickFilterFields?: string[];
    quickFilterFieldsInPopup?: string[];
    sortFields?: string[];
    defaultSort?: { field: string; direction: 'asc' | 'desc' };
    filterPresets?: any[]; // Keep as any[] or define the specific preset interface based on previous docs
}

export interface IBpfConfig {
    filteredBusinessProcessFlows?: string[];
    businessProcessFlowStepOrder?: { id: string; order: number }[];
}
