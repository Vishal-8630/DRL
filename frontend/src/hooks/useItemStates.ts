import { useCallback, useState } from "react";

export type ItemState<T> = {
    localItem: T;
    drafts: Partial<T>;
    editing: Set<keyof T>;
    isOpen: boolean;
}

export const useItemStates = <T extends { _id: string }>(items: T[]) => {
    const [itemStates, setItemStates] = useState<Record<string, ItemState<T>>>(() => {
        const initial: Record<string, ItemState<T>> = {};
        items.forEach((item) => {
            initial[item._id] = {
                localItem: { ...item },
                drafts: {},
                editing: new Set(),
                isOpen: false,
            }
        });
        return initial;
    });

    const updateItem = useCallback((id: string, updatedItem: Partial<ItemState<T>>) => {
        setItemStates((prev) => ({
            ...prev,
            [id]: { ...prev[id], ...updatedItem }
        }));
    }, []);

    const updateDraft = useCallback((id: string, key: keyof T, value: string) => {
        setItemStates((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                drafts: { ...prev[id].drafts, [key]: value }
            }
        }));
    }, []);

    const toggleEditing = useCallback((id: string, key: keyof T) => {
        setItemStates((prev) => {
            const editing = new Set(prev[id].editing);
            if (editing.has(key)) editing.delete(key);
            else editing.add(key);
            return { ...prev, [id]: { ...prev[id], editing } };
        });
    }, []);

    const toggleOpen = useCallback((id: string) => {
        setItemStates((prev) => ({
            ...prev,
            [id]: { ...prev[id], isOpen: !prev[id].isOpen }
        }));
    }, []);

    return { itemStates, updateItem, updateDraft, toggleEditing, toggleOpen };
}