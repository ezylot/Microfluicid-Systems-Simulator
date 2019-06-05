class Toast {
    title;
    mutedTitle;
    textContent;

    /**
     * Represents a toast message that delivers a message to the user
     * @param {String} title Text that is shown in the header bar of the toast
     * @param {String} mutedTitle Text that is shown on the right side in the header bar. Very usefull for e.g. timestamps
     * @param {String} textContent Text that is shown in the main window
     */
    constructor(title, mutedTitle, textContent) {
        this._title = title;
        this._mutedTitle = mutedTitle;
        this._textContent = textContent;
    }


    show() {
        let $toastContainer = $("#toast-container");
        let $exampleToast = $("#exampleToast");
        let $newToastElement = $exampleToast.clone();

        $newToastElement.find('.primary-text').text(this._title);
        $newToastElement.find('.muted-text').text(this._mutedTitle);
        $newToastElement.find('.toast-body').text(this._textContent);

        $newToastElement.attr('id', '');
        $newToastElement.removeClass('d-none');

        $toastContainer.append($newToastElement);
        $newToastElement.toast('show');
    }
}





