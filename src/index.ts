import { db, addDoc, collection, doc, setDoc, getDoc } from './firebase';

export function generateSessionId(): string {
    return 'session-' + Math.random().toString(36).substr(2, 9);
}

export function generateEventSentence(event: Event): string {
    const eventType = event.type;
    const elementType = (event.target as HTMLElement).tagName.toLowerCase();
    const elementId = (event.target as HTMLElement).id ? ` with id '${(event.target as HTMLElement).id}'` : '';
    const elementValue = (event.target as HTMLInputElement).value ? ` and value '${(event.target as HTMLInputElement).value}'` : '';
    const elementClass = (event.target as HTMLElement).className ? ` and class '${(event.target as HTMLElement).className}'` : '';
    const mouseCoordinates = eventType.startsWith('mouse') ? ` at (${(event as MouseEvent).clientX}, ${(event as MouseEvent).clientY})` : '';

    return `User triggered ${eventType} on ${elementType}${elementId}${elementClass}${elementValue}${mouseCoordinates}.`;
}

export function generateEventDescription(event: Event) {
    const eventType = event.type;
    const elementType = (event.target as HTMLElement).tagName.toLowerCase();
    const elementId = (event.target as HTMLElement).id || null;
    const elementValue = (event.target as HTMLInputElement).value || null;
    const elementClass = (event.target as HTMLElement).className || null;
    const timestamp = new Date().toISOString();
    const url = window.location.href;
    const xpath = getXPath(event.target as HTMLElement);
    const mouseCoordinates = eventType.startsWith('mouse') ? { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY } : null;
    const sentence = generateEventSentence(event);

    return {
        eventType,
        timestamp,
        elementType,
        elementId,
        elementValue,
        elementClass,
        url,
        xpath,
        mouseCoordinates,
        sentence
    };
}

export function getXPath(element: HTMLElement): string | null {
    if (element.id !== '') {
        return `id("${element.id}")`;
    }
    if (element === document.body) {
        return element.tagName;
    }

    let ix = 0;
    const siblings = element.parentNode?.childNodes;
    if (siblings) {
        for (let i = 0; i < siblings.length; i++) {
            const sibling = siblings[i] as HTMLElement;
            if (sibling === element) {
                return `${getXPath(element.parentNode as HTMLElement)}/${element.tagName}[${ix + 1}]`;
            }
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
                ix++;
            }
        }
    }
    return null;
}

const sessionId = generateSessionId();

async function handleEvent(event: Event) {
    const description = generateEventDescription(event);
    try {
        await addDoc(collection(db, 'eventLogs'), {
            sessionId,
            ...description
        });
        console.log('Event logged:', description);
    } catch (e) {
        console.error('Error adding document: ', e);
    }
}

export function attachGlobalListeners() {
    // Blur olayını sadece text input ve textarea elemanlarına ekleyin
    document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), textarea').forEach(element => {
        element.addEventListener('blur', handleEvent);
    });

    // Click olayını button elemanlarına ekleyin
    document.querySelectorAll('button').forEach(element => {
        element.addEventListener('click', handleEvent);
    });

    // Change olayını checkbox ve select elemanlarına ekleyin
    document.querySelectorAll('input[type="checkbox"], input[type="radio"], select').forEach(element => {
        element.addEventListener('change', handleEvent);
    });
}

export function detachGlobalListeners() {
    // Blur olayını sadece text input ve textarea elemanlarından kaldırın
    document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), textarea').forEach(element => {
        element.removeEventListener('blur', handleEvent);
    });

    // Click olayını button elemanlarından kaldırın
    document.querySelectorAll('button').forEach(element => {
        element.removeEventListener('click', handleEvent);
    });

    // Change olayını checkbox ve select elemanlarından kaldırın
    document.querySelectorAll('input[type="checkbox"], input[type="radio"], select').forEach(element => {
        element.removeEventListener('change', handleEvent);
    });
}

export async function fetchListeningParameter() {
    const docRef = doc(db, 'settings/listeningParameter'); // Belge yolunu düzeltin
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data().shouldListen;
    } else {
        return false;
    }
}

export async function setListeningParameter(value: boolean) {
    const docRef = doc(db, 'settings/listeningParameter'); // Belge yolunu düzeltin
    await setDoc(docRef, { shouldListen: value });
}

export async function initializeListeners() {
    const shouldListen = await fetchListeningParameter();
    if (shouldListen) {
        attachGlobalListeners();
    } else {
        detachGlobalListeners();
    }
}

initializeListeners();

// Lazy load firebase
document.addEventListener('DOMContentLoaded', () => {
    import('./firebase').then(module => {
        console.log('Firebase module loaded', module);
    }).catch(err => {
        console.error('Failed to load firebase module', err);
    });
});
