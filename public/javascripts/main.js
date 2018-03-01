$(function () {

    //confirm deletion popup
    $('a.confirmDeletion').on('click', function () {
        if (!confirm('Confirm deletion'))
            return false;
    });


    //fancybox gallery
    if ($("[data-fancybox]").length) {
        $("[data-fancybox]").fancybox();
    }




});