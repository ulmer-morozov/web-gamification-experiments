export class JawQuery {
    static addClass = (elementId: string, className: string): void => {
        const element = document.getElementById(elementId);

        if (element == undefined || element.classList.contains(className))
            return;

        element.classList.add(className);
    }

    static removeClass = (elementId: string, className: string): void => {
        const element = document.getElementById(elementId);

        if (element == undefined || !element.classList.contains(className))
            return;

        element.classList.remove(className);
    }

    static addClassHideAfterAnim = (element: HTMLElement, className: string): void => {
        if (element == undefined || element.classList.contains(className))
            return;

        element.classList.add(className);

        const options: AddEventListenerOptions = {
            once: true
        };

        const hideElement = (): void => {
            element.style.display = "none";
        }

        element.addEventListener("transitionend", hideElement, options);
    }
}