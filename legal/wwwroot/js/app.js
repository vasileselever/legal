// App initialization and utility functions

window.legalRoApp = {
    // Initialize app
    init: function () {
        console.log('LegalRO App initialized');
    },

    // Download file helper
    downloadFile: function (fileName, contentType, base64Data) {
        const linkSource = `data:${contentType};base64,${base64Data}`;
        const downloadLink = document.createElement('a');
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
    },

    // Copy to clipboard
    copyToClipboard: function (text) {
        navigator.clipboard.writeText(text).then(function () {
            return true;
        }, function () {
            return false;
        });
    },

    // Show toast notification
    showToast: function (message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
    },

    // Format currency (RON)
    formatCurrency: function (amount) {
        return new Intl.NumberFormat('ro-RO', {
            style: 'currency',
            currency: 'RON'
        }).format(amount);
    },

    // Format date
    formatDate: function (dateString) {
        return new Intl.DateTimeFormat('ro-RO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    },

    // Local storage helpers
    storage: {
        get: function (key) {
            const value = localStorage.getItem(key);
            try {
                return JSON.parse(value);
            } catch {
                return value;
            }
        },
        set: function (key, value) {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, stringValue);
        },
        remove: function (key) {
            localStorage.removeItem(key);
        },
        clear: function () {
            localStorage.clear();
        }
    },

    // Token management
    auth: {
        getToken: function () {
            return localStorage.getItem('jwt_token');
        },
        setToken: function (token) {
            localStorage.setItem('jwt_token', token);
        },
        removeToken: function () {
            localStorage.removeItem('jwt_token');
        },
        isAuthenticated: function () {
            const token = this.getToken();
            if (!token) return false;

            // Check if token is expired
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const exp = payload.exp * 1000; // Convert to milliseconds
                return Date.now() < exp;
            } catch {
                return false;
            }
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', function () {
    window.legalRoApp.init();
});
