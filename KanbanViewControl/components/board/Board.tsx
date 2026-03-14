import * as React from "react";
import { useContext, useMemo } from "react";
import { CommandBar, Column, QuickFilters } from "..";
import {
  DragDropContext,
  DropResult,
  ResponderProvided,
} from "@hello-pangea/dnd";
import { BoardContext } from "../../context/board-context";
import { useDnD } from "../../hooks/useDnD";
import { pluralizedLogicalNames } from "../../lib/utils";

const Board = () => {
  const { context, generalConfig, boardConfig, cardConfig, columns, selectedEntity, activeView, draggingRef } =
    useContext(BoardContext);
  const { onDragEnd } = useDnD(columns);

  const allowCardMove = useMemo(() => {
    return cardConfig.allowCardMove !== false;
  }, [cardConfig.allowCardMove]);

  const handleDragStart = () => {
    draggingRef.current = true;
  };

  const handleCardDrag = async (result: DropResult, _: ResponderProvided) => {
    try {
      const field = activeView?.uniqueName;
      const targetColumnId = result.destination?.droppableId;
      const targetColumn = activeView?.columns?.find((column) => column.id == targetColumnId);
      const columnName = targetColumn?.title;

      const targetValue: any = targetColumnId === "unallocated" ? null : targetColumnId;

      const dataType = activeView?.dataType;
      const isLookup = typeof dataType === "string" && (dataType === "Customer" || dataType === "Owner" || dataType.startsWith("Lookup."));
      const updatePayload: any = {};

      if (isLookup) {
        if (targetValue !== null && targetColumn) {
          const entityTypeStr = (targetColumn as any).entityType;
          if (entityTypeStr) {
            updatePayload[`${field}@odata.bind`] = `/${pluralizedLogicalNames(entityTypeStr)}(${targetColumn.id})`;
          }
        } else {
          // Attempting to clear the lookup
          updatePayload[field as string] = null;
        }
      } else {
        updatePayload[field as string] = targetValue;
      }

      const logicalName = pluralizedLogicalNames(selectedEntity as string);
      const record = {
        updateFieldName: field as string,
        update: updatePayload,
        logicalName: logicalName,
        entityName: selectedEntity,
        id: result.draggableId,
        columnName,
      };

      await onDragEnd(result, record);
      context.parameters.dataset.refresh();
    } finally {
      setTimeout(() => {
        draggingRef.current = false;
      }, 150);
    }
  };

  const hideViews = generalConfig.hideViewBy === true;

  const hideEmptyColumns = boardConfig.hideEmptyColumns === true;

  const expandBoardToFullWidth = boardConfig.expandBoardToFullWidth === true;

  const minColumnWidthPx = useMemo(() => {
    const n = Number(boardConfig.minColumnWidth);
    if (Number.isNaN(n) || n < 200 || n > 1200) return undefined;
    return n;
  }, [boardConfig.minColumnWidth]);

  const maxColumnWidthPx = useMemo(() => {
    const n = Number(boardConfig.maxColumnWidth);
    if (Number.isNaN(n) || n < 200 || n > 2000) return undefined;
    return n;
  }, [boardConfig.maxColumnWidth]);

  const columnWidthsMap = useMemo(() => {
    const arr = boardConfig.columnWidths ?? [];
    const map = new Map<string, number>();
    for (const item of arr) {
      if (item?.id != null && typeof item.width === "number") {
        const w = Math.min(1200, Math.max(200, item.width));
        map.set(String(item.id), w);
      }
    }
    return map;
  }, [boardConfig.columnWidths]);

  const visibleColumns = useMemo(() => {
    if (!columns) return [];
    if (!hideEmptyColumns) return columns;
    return columns.filter((col) => (col.cards?.length ?? 0) > 0);
  }, [columns, hideEmptyColumns]);

  const columnsContent = visibleColumns.map((column) => (
    <Column
      key={column.id}
      column={column}
      widthPx={columnWidthsMap.get(column.id.toString())}
    />
  ));

  return (
    <div className="main-container">
      <QuickFilters />
      {!hideViews && <CommandBar />}
      <div className="kanban-container">
        <div
          className={`columns-wrapper${expandBoardToFullWidth ? " columns-wrapper--full-width" : ""}`}
          style={{
            ...(minColumnWidthPx != null ? { "--min-column-width": `${minColumnWidthPx}px` } : {}),
            ...(maxColumnWidthPx != null ? { "--max-column-width": `${maxColumnWidthPx}px` } : {}),
          } as React.CSSProperties}
        >
          {allowCardMove ? (
            <DragDropContext onDragStart={handleDragStart} onDragEnd={handleCardDrag}>
              {columnsContent}
            </DragDropContext>
          ) : (
            columnsContent
          )}
          {visibleColumns.length === 0 && (
            <div className="no-columns">
              <div className="no-data-content">
                <span className="no-data-text">No records found</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Board;
