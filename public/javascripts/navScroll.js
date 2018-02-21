$(document).ready(function(){
    $(window).scroll(function(){
        var scroll = $(window).scrollTop();
        if (scroll > 50) {
          $(".navigation").css("background" , "#000");
        }
  
        else{
            $(".navigation").css("background" , "rgba(0,0,0, .25)");  	
        }
    })
  })