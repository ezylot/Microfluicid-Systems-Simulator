import * as $ from 'jquery';
import 'bootstrap'
import ClickEvent = JQuery.ClickEvent;


jQuery((): void => {
    $('#languageSwitcherButton').dropdown();
    $('.language-switcher a').on('click', (e: ClickEvent): void => {
        if(!confirm('Your work is not automatically saved when switching the language. If you want to keep your work save it, and load it afterwards.')) {
            e.preventDefault();
        }
    });
});
