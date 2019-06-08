requirejs.config({
    map: {
        "*": {
            "fabric/fabric-impl": "fabric"
        }
    },
    paths: {
        "jquery": "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min",
        "popper": "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min",
        "bootstrap": "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min",
        "bootstrap-slider": "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-slider/10.6.1/bootstrap-slider.min",
        "fabric": "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/2.7.0/fabric.min",
    },
    shim: {
        "bootstrap": {
            deps: ["jquery", "popper"]
        }
    }
});

requirejs(["Footer"], function(footer) {
    footer.initFooter();
});

