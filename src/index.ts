const axios = require('axios');
import { response } from 'express';
import './styles.css'; // CSS dosyasını içe aktarın
function loadFontAwesome() {
    const link = document.createElement('link');
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
}
var sessionId: string;

// Session ID oluşturma ve saklama
function initializeSessionId() {
    sessionId = generateSessionId();
    console.log('Session ID created:', sessionId);
}

export function generateSessionId() {
    return 'session-' + Math.random().toString(36).substr(2, 9);
}

export function generateEventSentence(event: Event): string {
    const eventType = event.type;
    const elementType = (event.target as HTMLElement).tagName.toLowerCase();
    const elementId = (event.target as HTMLElement).id ? ` with id '${(event.target as HTMLElement).id}'` : '';
    const elementValue = (event.target as HTMLInputElement).value ? ` and value '${(event.target as HTMLInputElement).value}'` :  (event.target as HTMLInputElement).innerText || '';
    const elementClass = (event.target as HTMLElement).className ? ` and class '${(event.target as HTMLElement).className}'` : '';
    const mouseCoordinates = eventType.startsWith('mouse') ? ` at (${(event as MouseEvent).clientX}, ${(event as MouseEvent).clientY})` : '';
    const xpath=getXPath(event.target as HTMLElement)
    
    return `User triggered ${eventType} on ${elementType}${xpath}${elementValue}${mouseCoordinates}.`;
}

export function generateEventDescription(event: Event) {
    const eventType = event.type;
    const elementType = (event.target as HTMLElement).tagName.toLowerCase();
    const elementId = (event.target as HTMLElement).id || null;
    const elementValue = (event.target as HTMLInputElement).value || (event.target as HTMLInputElement).innerText || null;
    const elementClass = (event.target as HTMLElement).className || null;
    const timestamp = new Date().toISOString();
    const url = window.location.host;
    const pathX = getXPath(event.target as HTMLElement);
    const mouseCoordinates = eventType.startsWith('mouse') ? { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY } : null;
    const scenarioText = generateEventSentence(event);
    const user="merve";
    const projectId="KLH";

    console.log(scenarioText); // For demonstration purposes

	

    return {
        eventType,
        timestamp,
        elementType,
        elementId,
        elementValue,
        elementClass,
        url,
        pathX,
      //  mouseCoordinates,
         scenarioText,
        user,
        sessionId,
        projectId
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

async function handleEvent(event: Event) {
    const target=event.currentTarget as HTMLElement;
    if(target.id == document.querySelector('#menuButton')?.id ){
    return;
    }
    const description = generateEventDescription(event);
    let url ='';
    if (window.location.href.includes('test')) {
        url = 'https://neotest-701e1c076af2.herokuapp.com/api/test/create';
    } else {
        url = 'https://neotest-701e1c076af2.herokuapp.com/api/prod/create';
    }

    await apiCall(url, description);

   
}

async function apiCall(url: string, body: object) {
    try {
        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('Event sent to API successfully:', body);
        return response;
    } catch (error) {
        console.error('Error sending event to API:', error);
    }
    return null;

   
}

export function attachGlobalListeners() {
    // Blur olayını sadece text input ve textarea elemanlarına ekleyin
    document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), textarea').forEach(element => {
        element.addEventListener('blur', handleEvent);
    });

    // Click olayını button ve select elemanlarına ekleyin
    document.querySelectorAll('button').forEach(element => {
        if(element.id!==document.querySelector('#menuButton')?.id && element.id!==document.querySelector('#startStopButton')?.id ){
            element.addEventListener('click', handleEvent);
        }
    });

    // Change olayını checkbox ve radio elemanlarına ekleyin
    document.querySelectorAll('input[type="checkbox"], input[type="radio"],select').forEach(element => {
        element.addEventListener('change', handleEvent);
    });
    document.querySelectorAll('[role="combobox"][aria-haspopup="listbox"]').forEach(element => {
        element.addEventListener('change', handleEvent);
    });
       // Material-UI Select elemanları için change olayını ekleyin
       document.querySelectorAll('.MuiSelect-select, .MuiMenuItem-root').forEach(element => {
        element.addEventListener('click', handleEvent); // Click olayını kullanıyoruz çünkü MenuItem click olayı tetikler
    });
}

export function detachGlobalListeners() {
    // Blur olayını sadece text input ve textarea elemanlarından kaldırın
    document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), textarea').forEach(element => {
        element.removeEventListener('blur', handleEvent);
    });

    // Click olayını button ve select elemanlarından kaldırın
    document.querySelectorAll('button').forEach(element => {
        element.removeEventListener('click', handleEvent);
    });

    // Change olayını checkbox ve radio elemanlarından kaldırın
    document.querySelectorAll('input[type="checkbox"], input[type="radio"],select').forEach(element => {
        element.removeEventListener('change', handleEvent);
    });
    document.querySelectorAll('[role="combobox"][aria-haspopup="listbox"]').forEach(element => {
        element.removeEventListener('change', handleEvent);
    });
         // Material-UI Select elemanları için change olayını ekleyin
         document.querySelectorAll('.MuiSelect-select, .MuiMenuItem-root').forEach(element => {
            element.removeEventListener('click', handleEvent); // Click olayını kullanıyoruz çünkü MenuItem click olayı tetikler
        });
}

// Uyarı mesajını oluşturma fonksiyonu
export function showNotification(message: string, onYes: () => void, onNo: () => void) {
    // Eğer uyarı mesajı daha önce oluşturulmamışsa, oluşturun
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.innerHTML = `
            <div id="notification-text"></div>
            <div id="notification-buttons">
                <button class="notification-button yes">Evet</button>
                <button class="notification-button no">Hayır</button>
            </div>
        `;
        document.body.appendChild(container);

        container.querySelector('.yes')?.addEventListener('click', () => {
            onYes();
            hideNotification();

            const menuButton = document.getElementById('menuButton');
            if (menuButton) {
                menuButton.style.display = 'block';
            }
        });

        container.querySelector('.no')?.addEventListener('click', () => {
            onNo();
            hideNotification();
        });
    }

    // Mesajı ve butonları güncelleyin
    container.querySelector('#notification-text')!.textContent = message;

    // Uyarı mesajını gösterin
    container.classList.add('show');
}

export function showNotification2() {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.id = 'notification';

    const message = document.createElement('p');
    message.innerText = 'Do you want to continue?';
    notification.appendChild(message);

    const yesButton = document.createElement('button');
    yesButton.id = 'yesButton';
    yesButton.innerText = 'Yes';
    notification.appendChild(yesButton);

    const noButton = document.createElement('button');
    noButton.id = 'noButton';
    noButton.innerText = 'No';
    notification.appendChild(noButton);

    document.body.appendChild(notification);

    noButton.addEventListener('click', () => {
        notification.style.display = 'none';
        const menuButton = document.getElementById('menuButton');
        if (menuButton) {
            menuButton.style.display = 'block';
        }
    });

    yesButton.addEventListener('click', () => {
        alert('Yes button clicked!');
        notification.remove();
    });
}
// Uyarı mesajını gizleme fonksiyonu
function hideNotification() {
    const container = document.getElementById('notification-container');
    if (container) {
        container.classList.remove('show');
        setTimeout(() => {
            container!.style.display = 'none';
        }, 300); // Animasyonun bitmesini bekleyin
    }
}
export async function fetchListeningParameter(origin:string) {
   const response= await apiCall('https://neotest-701e1c076af2.herokuapp.com/api/count/check/scenario-open', {
        "url": origin
    })
    if(response==null){
        alert(origin + ' bulunamadı ')
    }
    return response.data.isOpen;
}

export async function setListeningParameter(postUrl:string,origin:string) {
    //url finish/scenario ise parameteti kapatır
    //url start/scenario ise parameteti açar
    const response= await apiCall(postUrl, {
        "url": origin
    })
    return response.data.isOpen;
}
window.addEventListener('beforeunload', storeEventDescriptions);
function storeEventDescriptions() {
    setListeningParameter('https://neotest-701e1c076af2.herokuapp.com/api/count/finish/scenario',window.location.href);
}

export async function initializeListeners() {

     // Uyarı mesajını göster
     showNotification('Test ortamındasın! Dinleme başlatılsın mı? Session-Id : '+ sessionId ,async () => {
      
       await setListeningParameter('https://neotest-701e1c076af2.herokuapp.com/api/count/start/scenario',window.location.href);
       await paramListener(); 

    }, () => {
        setListeningParameter('https://neotest-701e1c076af2.herokuapp.com/api/count/finish/scenario',window.location.href);
    });
}

async function paramListener() {
    const shouldListen = await fetchListeningParameter(window.location.href);
    if (shouldListen) {
        attachGlobalListeners();
    } else {
        detachGlobalListeners();
    }

    //Dinleme parametresi değiştiğinde güncellemek için interval 
    // setInterval(async () => {
    //     const shouldListen = await fetchListeningParameter(window.location.href);
    //     if (shouldListen) {
    //         attachGlobalListeners();
    //     } else {
    //         detachGlobalListeners();
    //     }
    // }, 5000);
}

export function initializeMenu() {
    const menuButton = document.createElement('button');
    menuButton.className = 'menu-button';
    menuButton.id = 'menuButton';
    menuButton.innerHTML = '☰';
    menuButton.style.display = 'block'; // Başlangıçta görünsün
    document.body.appendChild(menuButton);

    const menuContent = document.createElement('div');
    menuContent.className = 'menu-content';
    menuContent.id = 'menuContent';

    //sessiontext eklendi
    const sessionLabel = document.createElement('div');
    sessionLabel.id = 'sessionIdLabel';
    sessionLabel.className = 'sessionId-label';
    sessionLabel.innerHTML = 'Session ID: ' + sessionId;
    menuContent.appendChild(sessionLabel);
    //buton eklendi
    const startStopButton = document.createElement('button');
    startStopButton.id = 'startStopButton';
    startStopButton.className = 'start-stop-button';
    startStopButton.style.backgroundColor='green';
    startStopButton.innerHTML = '<i class="fas fa-play"></i><span style="margin-left:10px;"> Start</span>';
    menuContent.appendChild(startStopButton);

    document.body.appendChild(menuContent);

    menuButton.addEventListener('click', () => {
        if (menuContent.style.display === 'block') {
            menuContent.style.display = 'none';
            menuContent.classList.add('menu-hidden');
            menuButton.classList.add('menu-button-hidden');
        } else {
            menuContent.style.display = 'block';
            menuContent.classList.remove('menu-hidden');
            menuButton.classList.remove('menu-button-hidden');


        }
    });
    menuButton.addEventListener('mouseenter', () => {
        if (menuContent.style.display === 'none') {
            menuContent.classList.remove('menu-hidden');
            menuButton.classList.remove('menu-button-hidden');

        }
    });

    menuButton.addEventListener('mouseleave', () => {
        if (menuContent.style.display === 'none') {
            menuContent.classList.add('menu-hidden');
            menuButton.classList.add('menu-button-hidden');

        }
    });



    startStopButton.addEventListener('click',async() => {
        if (startStopButton.innerHTML.includes('Start')) {
            await setListeningParameter('https://neotest-701e1c076af2.herokuapp.com/api/count/start/scenario',window.location.href);
            await paramListener(); 
            startStopButton.style.backgroundColor='red';
            startStopButton.innerHTML = '<i class="fas fa-stop"></i><span style="margin-left:10px;"> Stop</span>';
        } else {
            await setListeningParameter('https://neotest-701e1c076af2.herokuapp.com/api/count/finish/scenario',window.location.href);
            await paramListener(); 
            startStopButton.style.backgroundColor='green';
            startStopButton.innerHTML = '<i class="fas fa-play"></i><span style="margin-left:10px;"> Start</span>';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeMenu();
    loadFontAwesome();

    //showNotification2();
});

initializeSessionId();
//initializeListeners();
