// Custom Notification System

class NotificationManager {
    constructor() {
        this.createNotificationContainer();
    }

    createNotificationContainer() {
        if (document.getElementById('notificationOverlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'notificationOverlay';
        overlay.className = 'notification-overlay';
        overlay.innerHTML = `
            <div class="notification-modal" id="notificationModal" role="dialog" aria-modal="true" aria-labelledby="notificationTitle" aria-describedby="notificationMessage" tabindex="-1">
                <div class="notification-icon" id="notificationIcon">
                    <i class="fas fa-check"></i>
                </div>
                <h3 class="notification-title" id="notificationTitle">Obavijest</h3>
                <p class="notification-message" id="notificationMessage"></p>
                <div id="notificationInputSlot"></div><div class="notification-buttons" id="notificationButtons"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.close();
            }
        });
    }

    show(options) {
        this.close();
        this.previousFocus=document.activeElement;
        document.getElementById('notificationInputSlot').replaceChildren();
        const {
            type = 'info',
            title = 'Obavijest',
            message = '',
            buttons = [{ text: 'U redu', type: 'primary', action: () => this.close() }]
        } = options;

        const overlay = document.getElementById('notificationOverlay');
        const icon = document.getElementById('notificationIcon');
        const titleEl = document.getElementById('notificationTitle');
        const messageEl = document.getElementById('notificationMessage');
        const buttonsContainer = document.getElementById('notificationButtons');

        // Set icon
        const icons = {
            success: 'fa-check',
            error: 'fa-times',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info',
            confirm: 'fa-question'
        };

        icon.className = `notification-icon ${type}`;
        icon.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i>`;

        // Set content
        titleEl.textContent = title;
        messageEl.textContent = message;

        // Create buttons
        buttonsContainer.innerHTML = '';
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `notification-btn ${btn.type || 'primary'}`;
            button.textContent = btn.text;
            button.onclick = () => {
                if (btn.action) btn.action();
                else this.close();
            };
            buttonsContainer.appendChild(button);
        });

        // Show overlay
        overlay.classList.add('show');
        document.getElementById('notificationModal').focus();
    }

    close() {
        const overlay = document.getElementById('notificationOverlay');
        overlay.classList.remove('show');
        if(this.pending){const resolve=this.pending;this.pending=null;resolve(null);}
        this.previousFocus?.focus();
    }

    ask(message,title='Potvrda radnje') {
        return new Promise(resolve=>{
            this.show({type:'confirm',title,message,buttons:[
                {text:'Odustani',type:'secondary',action:()=>this.close()},
                {text:'Potvrdi',type:'primary',action:()=>{this.pending=null;this.close();resolve(true);}}
            ]});this.pending=resolve;
        });
    }
    input(message,value='',options={}) {
        return new Promise(resolve=>{
            const input=document.createElement(options.multiline?'textarea':'input');input.id='notificationInput';input.value=value;input.required=true;
            if(!options.multiline){input.type=options.type||'text';if(options.min!==undefined)input.min=options.min;if(options.max!==undefined)input.max=options.max;if(options.type==='number')input.step='1';}
            input.setAttribute('aria-label',options.label||'Vaš unos');
            const accept=()=>{if(!input.value.trim()||!input.reportValidity())return;this.pending=null;this.close();resolve(input.value.trim());};
            this.show({title:options.title||'Unesite podatke',message,buttons:[{text:'Odustani',type:'secondary',action:()=>this.close()},{text:'Nastavi',type:'primary',action:accept}]});
            document.getElementById('notificationInputSlot').append(input);this.pending=resolve;input.focus();
            input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!options.multiline){e.preventDefault();accept();}});
        });
    }
    success(message, title = 'Uspjeh!') {
        this.show({
            type: 'success',
            title: title,
            message: message,
            buttons: [{ text: 'U redu', type: 'primary' }]
        });
    }

    error(message, title = 'Greška!') {
        this.show({
            type: 'error',
            title: title,
            message: message,
            buttons: [{ text: 'U redu', type: 'primary' }]
        });
    }

    warning(message, title = 'Upozorenje!') {
        this.show({
            type: 'warning',
            title: title,
            message: message,
            buttons: [{ text: 'U redu', type: 'primary' }]
        });
    }

    info(message, title = 'Informacija') {
        this.show({
            type: 'info',
            title: title,
            message: message,
            buttons: [{ text: 'U redu', type: 'primary' }]
        });
    }

    confirm(message, title = 'Potvrda', onConfirm, onCancel) {
        this.show({
            type: 'confirm',
            title: title,
            message: message,
            buttons: [
                { 
                    text: 'Potvrdi', 
                    type: 'primary', 
                    action: () => {
                        this.close();
                        if (onConfirm) onConfirm();
                    }
                },
                { 
                    text: 'Odustani', 
                    type: 'secondary', 
                    action: () => {
                        this.close();
                        if (onCancel) onCancel();
                    }
                }
            ]
        });
    }

    confirmDelete(message, title = 'Potvrda brisanja', onConfirm, onCancel) {
        this.show({
            type: 'warning',
            title: title,
            message: message,
            buttons: [
                { 
                    text: 'Obriši', 
                    type: 'danger', 
                    action: () => {
                        this.close();
                        if (onConfirm) onConfirm();
                    }
                },
                { 
                    text: 'Odustani', 
                    type: 'secondary', 
                    action: () => {
                        this.close();
                        if (onCancel) onCancel();
                    }
                }
            ]
        });
    }
}

// Create global instance
const notify = new NotificationManager();

document.getElementById('notificationOverlay').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();notify.close();}if(e.key==='Tab'){const items=[...document.querySelectorAll('#notificationModal button,#notificationModal input,#notificationModal textarea')];const first=items[0],last=items.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement.id==='notificationModal')){e.preventDefault();last?.focus();}else if(!e.shiftKey&&(document.activeElement===last||document.activeElement.id==='notificationModal')){e.preventDefault();first?.focus();}}});
