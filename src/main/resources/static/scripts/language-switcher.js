$(document).ready(() => {
    $('.lanugage-switcher a').click(function (e) {
        if(!confirm('Your work is not automatically saved when switching the language. If you want to keep your work save it, and load it afterwards.') ) {
            e.preventDefault();
        }
    })
});
