///<reference path="../../../../../../node_modules/@types/bootstrap/index.d.ts"/>
class Toast {
    protected title: string;
    protected mutedTitle: string;
    protected textContent: string;

    /**
     * Represents a toast message that delivers a message to the user
     * @param title Text that is shown in the header bar of the toast
     * @param mutedTitle Text that is shown on the right side in the header bar. Very usefull for e.g. timestamps
     * @param textContent Text that is shown in the main window
     */
    constructor(title: string, mutedTitle: string, textContent: string) {
        this.title = title;
        this.mutedTitle = mutedTitle;
        this.textContent = textContent;
    }

    show() {
        let $toastContainer = $("#toast-container");
        let $exampleToast = $("#exampleToast");
        let $newToastElement = $exampleToast.clone();

        $newToastElement.find('.primary-text').text(this.title);
        $newToastElement.find('.muted-text').text(this.mutedTitle);
        $newToastElement.find('.toast-body').text(this.textContent);

        $newToastElement.attr('id', '');
        $newToastElement.removeClass('d-none');

        $toastContainer.append($newToastElement);

        $newToastElement.toast('show');
    }
}





