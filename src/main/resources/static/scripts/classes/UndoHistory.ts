import {getSaveAsJson, loadSaveWithoutSnapshot} from "../save-manager";
import {Toast} from "./Toast";
import messageTranslations from "../messageTranslation";

export class UndoHistory {

    public static historySize = 100;

    private static saveStates: string[] = [];
    private static stateIndex = -1;

    private constructor() { }

    public static snapshot(): void {
        if(this.stateIndex + 1 != this.saveStates.length) {
            // We did a undo and now have a new state, so we cut the newer ones
            this.saveStates.splice(this.stateIndex + 1);
        }

        this.saveStates.push(getSaveAsJson().replace(/\s/, ''));
        if(this.saveStates.length == this.historySize + 1) {
            // Only keep the last 50 entries
            this.saveStates.splice(0, 1)
        } else {
            this.stateIndex++;
        }
    }

    public static undo() {
        if(this.stateIndex <= 0) {
            new Toast('Info', '', messageTranslations.onOldestUndoState, 'info').show()
        } else {
            this.stateIndex--;
            loadSaveWithoutSnapshot(this.saveStates[this.stateIndex]);
        }
    }

    public static redo() {
        if(this.stateIndex +1 == this.saveStates.length) {
            new Toast('Info', '', messageTranslations.onNewestRedoState, 'info').show()
        } else {
            this.stateIndex++;
            loadSaveWithoutSnapshot(this.saveStates[this.stateIndex]);
        }
    }
}
