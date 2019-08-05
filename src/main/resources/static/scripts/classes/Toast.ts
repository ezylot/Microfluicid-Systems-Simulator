export class Toast {
    protected title: string;
    protected mutedTitle: string;
    protected textContent: string;
    protected type: "error" | "info" = "error";

    /**
     * Represents a toast message that delivers a message to the user
     * @param title Text that is shown in the header bar of the toast
     * @param mutedTitle Text that is shown on the right side in the header bar. Very usefull for e.g. timestamps
     * @param textContent Text that is shown in the main window
     * @param type Info Toasts are shown shorter and less intrusive to the user then error toasts
     */
    public constructor(title: string, mutedTitle: string, textContent: string, type: "error" | "info" = "error") {
        this.type = type;
        this.title = title;
        this.mutedTitle = mutedTitle;
        this.textContent = textContent;
    }

    public show(): void {
        let $toastContainer = $("#toast-container");
        let $exampleToast = $("#exampleToast");
        let $newToastElement = $exampleToast.clone();

        $newToastElement.find(".primary-text").text(this.title);
        $newToastElement.find(".muted-text").text(this.mutedTitle);
        $newToastElement.find(".toast-body").text(this.textContent);

        $newToastElement.attr("id", "");
        $newToastElement.removeClass("d-none");

        $toastContainer.append($newToastElement);

        if(this.type == "info") {
            $newToastElement.data("delay", $newToastElement.data("info-delay"));
            $newToastElement.addClass("info");
        }

        $newToastElement.toast("show");
    }
}





