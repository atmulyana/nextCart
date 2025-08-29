'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {emptyString} from 'javascript-common';

const Item = React.memo(function Item({
    children,
    className,
    idx,
    overIdx,
    setIndex,
}: {
    children: React.ReactNode,
    className?: string,
    idx: number,
    overIdx: number,
    setIndex: (idx: number, type: number) => any,
}) {
    const ref = React.useRef<HTMLDivElement>(null);
    
    return <div
        ref={ref}
        className={`relative cursor-move ${className ?? emptyString}`}
        draggable
        onDrag={() => {
            if (ref.current) ref.current.style.opacity = '0';
        }}
        onDragEnd={() => {
            if (ref.current) ref.current.style.opacity = '1';
            setIndex(-1, 1);
        }}
        onDragLeave={() => {
            setIndex(-1, 2);
        }}
        onDragOver={ev => {
            ev.preventDefault();
            setIndex(overIdx, 2);
        }}
        onDragStart={ev => {
            //ev.dataTransfer.setData("text/plain", idx + emptyString);
            if (ref.current) {
                ev.dataTransfer.setDragImage(
                    ref.current,
                    ev.nativeEvent.offsetX,
                    ev.nativeEvent.offsetY,
                );

                // if (ref.current) ref.current.style.opacity = '0';
            }
            setIndex(idx, 1);
        }}
        onDrop={ev => {
            ev.preventDefault();
            setIndex(overIdx, 3);
        }}
    >
        {children}
    </div>;
});


type Props = Omit<React.ComponentProps<'div'>, 'children'> & {
    children: Array<
        | React.ReactElement
        | string
        | number
        | bigint
    >,
    itemClassName?: string,
    onSortUpdate?: () => any,
};

export default function SortedList({
    children,
    itemClassName,
    onSortUpdate,
    ...props
}: Props) {
    const {current: flag} = React.useRef({
        dropIdx: -1,
        lastDraggedIdx: -1,
        isJustSorted: false,
    });
    const [items, setItems] = React.useState(children);
    const [draggedIdx, setDraggedIdx] = React.useState(-1);
    const [overIdx, setOverIdx] = React.useState(-1);

    let _draggedIdx = draggedIdx, _overIdx = overIdx,
        isReindexed = draggedIdx >= 0 && overIdx >= 0 && draggedIdx != overIdx;
    const getMappedIdx = (idx: number) => {
        if (idx == _overIdx) idx = _draggedIdx;
        else if (_overIdx < idx && idx < _draggedIdx) idx--;
        else if (_overIdx > idx && idx > _draggedIdx) idx++;
        else if (_draggedIdx == idx) {
            if (idx < _overIdx) idx++;
            else if (idx > _overIdx) idx--;
        }
        return idx;
    }

    React.useEffect(() => {
        setItems(children);
    }, [children]);

    React.useEffect(() => {
        if (flag.isJustSorted) {
            if (onSortUpdate) onSortUpdate();
            flag.isJustSorted = false;
        }
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    React.useEffect(() => {
        if (flag.lastDraggedIdx >= 0 && draggedIdx < 0) { //end of dragging
            if (flag.dropIdx >= 0 && flag.dropIdx != flag.lastDraggedIdx) { //update list
                //eslint-disable-next-line react-hooks/exhaustive-deps
                _draggedIdx = flag.lastDraggedIdx;
                //eslint-disable-next-line react-hooks/exhaustive-deps
                _overIdx = flag.dropIdx;
                const newItems: typeof items = [];
                for (let i = 0; i < items.length; i++) {
                    const oldIdx = getMappedIdx(i);
                    newItems[i] = items[oldIdx];
                }
                flag.isJustSorted = true;
                setItems(newItems);
                flag.dropIdx = -1;
            }

            flag.lastDraggedIdx = -1;
            setOverIdx(-1);
        }
        flag.lastDraggedIdx = draggedIdx;
    }, [draggedIdx]);

    const setIndex = React.useCallback((idx: number, type: number) => {
        switch (type) {
            case 1:
                setDraggedIdx(idx);
                break;
            case 2:
                setOverIdx(idx);
                break;
            case 3:
                flag.dropIdx = idx;
        }
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div {...props}>
        {items.map((_, index) => {
            let idx = index;
            if (isReindexed) idx = getMappedIdx(idx);
            return <Item key={idx}
                className={itemClassName}
                idx={idx}
                overIdx={index}
                setIndex={setIndex}
            >
                {items[idx]}
            </Item>;
        })}
    </div>
} 