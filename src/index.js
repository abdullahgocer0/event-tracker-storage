import { db, addDoc, collection, doc, setDoc, getDoc } from './firebase.js';

// Function to generate a unique session ID
export function generateSessionId() {
    return 'session-' + Math.random().toString(36).substr(2, 9);
}

// Helper function to generate a Gherkin-like sentence for an event
export function generateEventSentence(event) {
    const eventType = event.type;
    const elementType = event.target.tagName.toLowerCase();
    const elementId = event.target.id ? ` with id '${event.target.id}'` : '';
    const elementValue = event.target.value ? ` and value '${event.target.value}'` : '';
    const elementClass = event.target.className ? ` and class '${event.target.className}'` : '';
    const mouseCoordinates = eventType.startsWith('mouse') ? ` at (${event.clientX}, ${event.clientY})` : '';

    return `User triggered ${eventType} on ${elementType}${elementId}${elementClass}${elementValue}${mouseCoordinates}.`;
}

// Helper function to generate an event description object
export function generateEventDescription(event) {
    const eventType = event.type;
    const elementType = event.target.tagName.toLowerCase();
    const elementId = event.target.id || null;
    const elementValue = event.target.value || null;
    const elementClass = event.target.className || null;
    const timestamp = new Date().toISOString();
    const url = window.location.href;
    const xpath = getXPath(event.target);
    const mouseCoordinates = eventType.startsWith('mouse') ? { x: event.clientX, y: event.clientY } : null;
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

// Helper function to get the XPath of an element
export function getXPath(element) {
    if (element.id !== '') {
        return `id("${element.id}")`;
    }
    if (element === document.body) {
        return element.tagName;
    }

    let ix = 0;
    const siblings = element.parentNode.childNodes;
    for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i];
        if (sibling === element) {
            return `${getXPath(element.parentNode)}/${element.tagName}[${ix + 1}]`;
        }
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
            ix++;
        }
    }
    return null;
}

// Generate a session ID for the current session
const sessionId = generateSessionId();

// Function to handle events and store their descriptions in Firestore
async function handleEvent(event) {
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

// Function to attach global event listeners
export function attachGlobalListeners() {
    const eventsToWatch = ['click', 'input', 'change'];
    eventsToWatch.forEach(eventType => {
        document.addEventListener(eventType, handleEvent);
    });
}

// Function to detach global event listeners
export function detachGlobalListeners() {
    const eventsToWatch = ['click', 'input', 'change'];
    eventsToWatch.forEach(eventType => {
        document.removeEventListener(eventType, handleEvent);
    });
}

// Function to fetch the listening parameter from Firestore
export async function fetchListeningParameter() {
    const docRef = doc(db, 'settings', 'listeningParameter');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data().shouldListen;
    } else {
        // varsayılan değer
        return false;
    }
}

// Function to set the listening parameter in Firestore
export async function setListeningParameter(value) {
    const docRef = doc(db, 'settings', 'listeningParameter');
    await setDoc(docRef, { shouldListen: value });
}

// Function to initialize event listeners based on the parameter
export async function initializeListeners() {
    const shouldListen = await fetchListeningParameter();
    if (shouldListen) {
        attachGlobalListeners();
    } else {
        detachGlobalListeners();
    }
}

// Initialize listeners on script load
initializeListeners();
