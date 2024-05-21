interface MouseCoordinates {
    x: number;
    y: number;
}

interface EventDescription {
    eventType: string;
    timestamp: string;
    elementType: string;
    elementId: string | null;
    elementValue: string | null;
    elementClass: string | null;
    url: string;
    xpath: string | null;
    mouseCoordinates: MouseCoordinates | null;
    sentence: string;
}

export function initializeListeners(): void;
export function setListeningParameter(value: boolean): void;
export function generateSessionId(): string;
export function generateEventSentence(event: Event): string;
export function generateEventDescription(event: Event): EventDescription;
export function getXPath(element: Element): string | null;
export function storeEventDescriptions(sessionId: string, descriptions: EventDescription[]): void;
export function getStoredEventDescriptions(sessionId: string): EventDescription[];
export function fetchListeningParameter(): Promise<boolean>;
export function handleEvent(event: Event): void;
export function attachGlobalListeners(): void;
export function detachGlobalListeners(): void;
