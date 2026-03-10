export type ToastType = 'success' | 'error' | 'info' | 'undo';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    onUndo?: () => void;
    countdown?: number; // for undo types
}

class ToastStore {
    toasts = $state<Toast[]>([]);

    add(toast: Omit<Toast, 'id'>) {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const newToast: Toast = { ...toast, id };

        if (toast.type === 'undo') {
            newToast.countdown = toast.duration ? Math.floor(toast.duration / 1000) : 10;
        }

        this.toasts.push(newToast);

        if (newToast.type === 'undo' && newToast.countdown) {
            const interval = setInterval(() => {
                const t = this.toasts.find(x => x.id === id);
                if (t && t.countdown! > 0) {
                    t.countdown! -= 1;
                } else {
                    clearInterval(interval);
                    this.remove(id);
                }
            }, 1000);

            return id;
        }

        if (toast.duration !== 0) {
            setTimeout(() => {
                this.remove(id);
            }, toast.duration || 3000);
        }
        return id;
    }

    remove(id: string) {
        this.toasts = this.toasts.filter(t => t.id !== id);
    }
}

export const toastStore = new ToastStore();
