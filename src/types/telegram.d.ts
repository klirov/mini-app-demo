export {};

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initDataUnsafe: any;
        MainButton: any;
        HapticFeedback: any;
        showPopup: (params: any, callback: (buttonId: string) => void) => void;
        showAlert: (message: string) => void;
        setHeaderColor: (color: string) => void;
      };
    };
  }
}
