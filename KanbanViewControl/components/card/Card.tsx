import * as React from "react";
import { Text } from "@fluentui/react/lib/Text";
import { OpenRegular } from "@fluentui/react-icons";
import CardHeader from "./CardHeader";
import CardBody from "./CardBody";
import { CardInfo, CardItem } from "../../interfaces";
import { CardDetails, CardDetailsList } from "./CardDetails";
import { useMemo, useCallback, useRef } from "react";
import { BoardContext } from "../../context/board-context";
import { useContext } from "react";

export type HighlightType = "left" | "right" | "cornerTopRight" | "cornerBottomRight" | "cornerTopLeft" | "cornerBottomLeft";

export interface BooleanFieldHighlightConfig {
  logicalName: string;
  color: string;
  /** Highlight type: left/right border or diagonal corner (top-left, top-right, bottom-left, bottom-right). Default "left". First match per type wins. */
  type?: HighlightType;
}

export interface FieldWidthConfig {
  logicalName: string;
  width: number;
}

interface IProps {
  item: CardItem;
  draggable?: boolean;
}

/** Only true for boolean-like truthy values. False, 0, "false", "no" etc. do not count as true. */
function isBooleanTruthy(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value === "string" && /^(1|true|yes|ja)$/i.test(value.trim())) return true;
  return false;
}

/** True if value looks like a boolean (type or common string/number representations). */
function looksLikeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return true;
  if (value === 0 || value === 1) return true;
  if (typeof value === "string" && /^(0|1|true|false|yes|no|ja|nein)$/i.test(value.trim())) return true;
  return false;
}

/** True if the config set contains the field (by full column name). Use for all field-based config sets. */
function setMatchesField(set: Set<string>, fieldName: string): boolean {
  return set.has(fieldName);
}

/** Returns the value for the field from the map (by full column name). Use for all field-based config maps. */
function mapGetByField<K>(map: Map<string, K>, fieldName: string): K | undefined {
  return map.get(fieldName);
}

/** True if the value is non-empty (for non-boolean fields: "has a value" = highlight). */
function hasValue(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (typeof value === "object" && "value" in value) return hasValue((value as CardInfo).value);
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

/** Max mouse movement (px) below which an event still counts as a click. Above = text selection/drag, card does not open. */
const CLICK_MOVE_THRESHOLD_PX = 5;

const Card = ({ item, draggable = true }: IProps) => {
  const { context, activeView, openFormWithLoading, openEntityInNewTab, showOpenInNewTabButton, cardConfig, fieldConfig } = useContext(BoardContext);
  const mouseDownPosRef = useRef<{ x: number; y: number } | null>(null);

  const onCardClick = useCallback(() => {
    openFormWithLoading(context.parameters.dataset.getTargetEntityType(), item.id.toString());
  }, [context, item.id, openFormWithLoading]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!draggable) {
      mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [draggable]);

  const onCardClickWithMoveCheck = useCallback(
    (e: React.MouseEvent) => {
      if (!draggable && mouseDownPosRef.current) {
        const dx = e.clientX - mouseDownPosRef.current.x;
        const dy = e.clientY - mouseDownPosRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        mouseDownPosRef.current = null;
        if (distance > CLICK_MOVE_THRESHOLD_PX) {
          return;
        }
      }
      onCardClick();
    },
    [draggable, onCardClick]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onCardClick();
      }
    },
    [onCardClick]
  );

  const hideColumnFieldOnCard = cardConfig.hideColumnFieldOnCard === true;

  const hiddenFieldsOnCardSet = useMemo(() => {
    return new Set(fieldConfig.hiddenFieldsOnCard ?? []);
  }, [fieldConfig.hiddenFieldsOnCard]);

  const htmlFieldsOnCardSet = useMemo(() => {
    return new Set(fieldConfig.htmlFieldsOnCard ?? []);
  }, [fieldConfig.htmlFieldsOnCard]);

  const hideLabelForFieldsOnCardSet = useMemo(() => {
    return new Set(fieldConfig.hideLabelForFieldsOnCard ?? []);
  }, [fieldConfig.hideLabelForFieldsOnCard]);

  const booleanFieldHighlights = useMemo((): BooleanFieldHighlightConfig[] => {
    const list = fieldConfig.booleanFieldHighlights ?? [];
    const validTypes: HighlightType[] = ["left", "right", "cornerTopRight", "cornerBottomRight", "cornerTopLeft", "cornerBottomLeft"];
    return list.map(e => {
      const typeRaw = e.type != null ? String(e.type).trim() : "left";
      const type = validTypes.includes(typeRaw as HighlightType) ? (typeRaw as HighlightType) : "left";
      return { logicalName: e.logicalName, color: e.color, type };
    });
  }, [fieldConfig.booleanFieldHighlights]);

  const fieldWidthsOnCardMap = useMemo((): Map<string, number> => {
    const list = fieldConfig.fieldWidthsOnCard ?? [];
    const map = new Map<string, number>();
    for (const e of list) {
       map.set(e.logicalName, e.width);
    }
    return map;
  }, [fieldConfig.fieldWidthsOnCard]);

  const lookupFieldsAsPersonaOnCardSet = useMemo(() => {
    return new Set(fieldConfig.lookupFieldsAsPersonaOnCard ?? []);
  }, [fieldConfig.lookupFieldsAsPersonaOnCard]);

  const lookupFieldsPersonaIconOnlyOnCardSet = useMemo(() => {
    return new Set(fieldConfig.lookupFieldsPersonaIconOnlyOnCard ?? []);
  }, [fieldConfig.lookupFieldsPersonaIconOnlyOnCard]);

  const showEmailAndPhoneAsLinks = fieldConfig.showEmailAndPhoneAsLinks === true;

  const ellipsisFieldsOnCardSet = useMemo(() => {
    return new Set(fieldConfig.ellipsisFieldsOnCard ?? []);
  }, [fieldConfig.ellipsisFieldsOnCard]);

  const fieldDisplayNamesOnCardMap = useMemo((): Map<string, string> => {
    const list = fieldConfig.fieldDisplayNamesOnCard ?? [];
    const map = new Map<string, string>();
    for (const e of list) {
      if (e && e.logicalName && e.displayName) {
        map.set(e.logicalName.trim(), e.displayName.trim());
      }
    }
    return map;
  }, [fieldConfig.fieldDisplayNamesOnCard]);

  const highlights = useMemo(() => {
    const result: { left?: string; right?: string; cornerTopRight?: string; cornerBottomRight?: string; cornerTopLeft?: string; cornerBottomLeft?: string } = {};
    const done = { left: false, right: false, cornerTopRight: false, cornerBottomRight: false, cornerTopLeft: false, cornerBottomLeft: false };
    const itemKeys = Object.keys(item);
    for (const { logicalName, color, type = "left" } of booleanFieldHighlights) {
      if (done[type]) continue;
      const itemKey = itemKeys.find((k) => k === logicalName);
      if (itemKey == null) continue;
      const field = item[itemKey];
      if (field == null) continue;
      const value = field && typeof field === "object" && "value" in field ? (field as CardInfo).value : field;
      const matches = looksLikeBoolean(value) ? isBooleanTruthy(value) : hasValue(value);
      if (!matches) continue;
      result[type] = color;
      done[type] = true;
    }
    return result;
  }, [item, booleanFieldHighlights]);

  const columnFieldKey = activeView?.key;

  const cardDetails = useMemo(() => {
    return Object.entries(item)?.filter((i) => {
      if (i[0] === "title" || i[0] === "tag" || i[0] === "id" || i[0] === "column") return false;
      if (hideColumnFieldOnCard && columnFieldKey && i[0] === columnFieldKey) return false;
      if (setMatchesField(hiddenFieldsOnCardSet, i[0])) return false;
      return true;
    });
  }, [item, hideColumnFieldOnCard, columnFieldKey, hiddenFieldsOnCardSet]);

  const isClickable = !draggable;

  const hasAnyHighlight = highlights.left ?? highlights.right ?? highlights.cornerTopRight ?? highlights.cornerBottomRight ?? highlights.cornerTopLeft ?? highlights.cornerBottomLeft;
  const highlightClass =
    (highlights.left ? " card-container--highlight-left" : "") +
    (highlights.right ? " card-container--highlight-right" : "") +
    (highlights.cornerTopRight ? " card-container--highlight-corner-top-right" : "") +
    (highlights.cornerBottomRight ? " card-container--highlight-corner-bottom-right" : "") +
    (highlights.cornerTopLeft ? " card-container--highlight-corner-top-left" : "") +
    (highlights.cornerBottomLeft ? " card-container--highlight-corner-bottom-left" : "");
  const highlightStyle = hasAnyHighlight
    ? {
        ...(highlights.left && { ["--card-highlight-left" as string]: highlights.left }),
        ...(highlights.right && { ["--card-highlight-right" as string]: highlights.right }),
        ...(highlights.cornerTopRight && { ["--card-highlight-corner-top-right" as string]: highlights.cornerTopRight }),
        ...(highlights.cornerBottomRight && { ["--card-highlight-corner-bottom-right" as string]: highlights.cornerBottomRight }),
        ...(highlights.cornerTopLeft && { ["--card-highlight-corner-top-left" as string]: highlights.cornerTopLeft }),
        ...(highlights.cornerBottomLeft && { ["--card-highlight-corner-bottom-left" as string]: highlights.cornerBottomLeft }),
      }
    : undefined;

  return (
    <div
      className={`card-container${draggable ? "" : " no-drag"}${highlightClass}`}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onMouseDown={isClickable ? onMouseDown : undefined}
      onClick={isClickable ? onCardClickWithMoveCheck : undefined}
      onKeyDown={isClickable ? onKeyDown : undefined}
      style={highlightStyle}
    >
      {(highlights.cornerTopRight ?? highlights.cornerBottomRight ?? highlights.cornerTopLeft ?? highlights.cornerBottomLeft) && (
        <>
          {highlights.cornerTopRight && <span className="card-corner-highlight card-corner-highlight--top-right" aria-hidden />}
          {highlights.cornerBottomRight && <span className="card-corner-highlight card-corner-highlight--bottom-right" aria-hidden />}
          {highlights.cornerTopLeft && <span className="card-corner-highlight card-corner-highlight--top-left" aria-hidden />}
          {highlights.cornerBottomLeft && <span className="card-corner-highlight card-corner-highlight--bottom-left" aria-hidden />}
        </>
      )}
      <CardHeader>
        <Text className="card-title" nowrap>
          {item?.title?.value}
        </Text>
        {showOpenInNewTabButton && (
          <button
            type="button"
            className="card-open-new-tab-btn"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              openEntityInNewTab(context.parameters.dataset.getTargetEntityType(), item.id.toString());
            }}
            aria-label="In neuem Tab öffnen"
            title="In neuem Tab öffnen"
          >
            <OpenRegular />
          </button>
        )}
      </CardHeader>
      <CardBody>
        <CardDetailsList>
          {cardDetails?.map((info) => {
            const fieldKey = info[0] as string;
            return (
              <CardDetails
                key={`${fieldKey}-${item.id}`}
                id={item.id}
                fieldName={fieldKey}
                info={info[1] as CardInfo}
                displayLabelOverride={mapGetByField(fieldDisplayNamesOnCardMap, fieldKey)}
                renderAsHtml={setMatchesField(htmlFieldsOnCardSet, fieldKey)}
                hideLabel={setMatchesField(hideLabelForFieldsOnCardSet, fieldKey)}
                widthPercent={mapGetByField(fieldWidthsOnCardMap, fieldKey)}
                lookupAsPersona={setMatchesField(lookupFieldsAsPersonaOnCardSet, fieldKey)}
                lookupPersonaIconOnly={setMatchesField(lookupFieldsPersonaIconOnlyOnCardSet, fieldKey)}
                showEmailAndPhoneAsLinks={showEmailAndPhoneAsLinks}
                textEllipsis={setMatchesField(ellipsisFieldsOnCardSet, fieldKey)}
              />
            );
          })}
        </CardDetailsList>
      </CardBody>
    </div>
  );
}

export default Card;