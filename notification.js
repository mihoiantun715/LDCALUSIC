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
            <div class="notification-modal" id="notificationModal">
                <div class="notification-icon" id="notificationIcon">
                    <i class="fas fa-check"></i>
                </div>
                <h3 class="notification-title" id="notificationTitle">Obavijest</h3>
                <p class="notification-message" id="notificationMessage"></p>
                <div class="notification-buttons" id="notificationButtons"></div>
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
    }

    close() {
        const overlay = document.getElementById('notificationOverlay');
        overlay.classList.remove('show');
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
