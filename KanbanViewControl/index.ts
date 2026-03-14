import * as React from "react";
import { IInputs, IOutputs } from "./generated/ManifestTypes";
import App from "./App";
import { IGeneralConfig, IBoardConfig, ICardConfig, IFieldConfig, IFilterSortConfig, IBpfConfig } from "./interfaces/IConfigInterfaces";

export class KanbanViewControl implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private control: ComponentFramework.ReactControl<IInputs, IOutputs>;

    constructor() { }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        _: ComponentFramework.Dictionary
    ): void {
        context.mode.trackContainerResize(true);
    }
    private safeParseJSON<T>(jsonString: string | null | undefined, defaultValue: T): T {
        if (!jsonString || jsonString.trim() === "") return defaultValue;
        try {
            return JSON.parse(jsonString) as T;
        } catch (e) {
            console.error("Kanban PCF: Failed to parse configuration JSON", e, jsonString);
            return defaultValue;
        }
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        const generalConfig = this.safeParseJSON<IGeneralConfig>(context.parameters.generalConfig?.raw, {});
        const boardConfig = this.safeParseJSON<IBoardConfig>(context.parameters.boardConfig?.raw, {});
        const cardConfig = this.safeParseJSON<ICardConfig>(context.parameters.cardConfig?.raw, {});
        const fieldConfig = this.safeParseJSON<IFieldConfig>(context.parameters.fieldConfig?.raw, {});
        const filterSortConfig = this.safeParseJSON<IFilterSortConfig>(context.parameters.filterSortConfig?.raw, {});
        const bpfConfig = this.safeParseJSON<IBpfConfig>(context.parameters.bpfConfig?.raw, {});

        return React.createElement(App, { 
            context,  
            generalConfig,
            boardConfig,
            cardConfig,
            fieldConfig,
            filterSortConfig,
            bpfConfig
        });

    }

    public getOutputs(): IOutputs {
        return { };
    }

    public destroy(): void {
        this.control.destroy()
    }
}
