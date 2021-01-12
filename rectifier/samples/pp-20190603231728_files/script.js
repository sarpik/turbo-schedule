var _____WB$wombat$assign$function_____ = function(name) {return (self._wb_wombat && self._wb_wombat.local_init && self._wb_wombat.local_init(name)) || self[name]; };
if (!self.__WB_pmw) { self.__WB_pmw = function(obj) { this.__WB_source = obj; return this; } }
{
  let window = _____WB$wombat$assign$function_____("window");
  let self = _____WB$wombat$assign$function_____("self");
  let document = _____WB$wombat$assign$function_____("document");
  let location = _____WB$wombat$assign$function_____("location");
  let top = _____WB$wombat$assign$function_____("top");
  let parent = _____WB$wombat$assign$function_____("parent");
  let frames = _____WB$wombat$assign$function_____("frames");
  let opener = _____WB$wombat$assign$function_____("opener");

jQuery(document).ready(function(){
"use strict";

$(".responsive-contact a").on("click",function(){
    $(this).siblings().removeClass("active");
    $(this).addClass("active");
    if($(this).hasClass("phone-btn")){
        $(".responsive-phone").slideDown();
        $(".responsive-mail").slideUp();
    }else{
        $(".responsive-mail").slideDown();
        $(".responsive-phone").slideUp();
    }
})

$(".responsive-search").on("click",function(){
    $(".responsive-search > form").slideToggle();
});
if ($('.headercounter').length>0){
    $('.headercounter').downCount({
        date: '06/25/2016 12:00:00',
        offset: +10
    });
}

$('.fullwidth-carousel').parent().parent().parent().addClass("expand");        

$('.top-adds').parent().parent().parent().addClass("expand");        


	
$('.audio-btn').click(function(){
	$('.audioplayer').slideUp();		
	$(this).next('.audioplayer').slideDown();	
	return false;
})

$('.cross').click(function(){
	$(this).parent().slideUp();		
    $('.sermon-media li i.audio-btn').removeClass('active');         
})


$('.sermon-media li i.audio-btn').click(function() {
    $('.sermon-media li i.audio-btn').removeClass('active');         
    $(this).addClass('active');     
});

/*** ACCORDIONS ***/	
$(function() {
    $('#toggle .content').hide();
    $('#toggle h2:first').addClass('active').next().slideDown(500).parent().addClass("activate");
    $('#toggle h2').click(function() {
        if($(this).next().is(':hidden')) {
            $('#toggle h2').removeClass('active').next().slideUp(500).parent().removeClass("activate");
            $(this).toggleClass('active').next().slideDown(500).parent().toggleClass("activate");
        }
    });
});

/*** SCROLLER ***/ 

$('.responsive-menu').enscroll();

/*** CART PAGE PRODUCT DELETE ***/      
    $('.cart-product .dustbin').click(function() {
        $(this).parent().parent().parent().slideUp();
    });

/*** BILLING ADDRESS AND SHIPPING ADDRESS ***/      
    $('.billing-add').click(function() {
        $('.billing-address').slideDown(1000);
        $('.shipping-address').slideUp(1000);
    });
    $('.shipping-add').click(function() {
        $('.shipping-address').slideDown(1000);
        $('.billing-address').slideUp(1000);
    });
    
/*** CHECKOUT PAGE BLOCKS ***/      
    $('.checkout-block h5').click(function() {
        $(this).toggleClass('closed');
        $(this).next('.checkout-content').slideToggle();
    });


 

/*** PASTORS CAROUSEL ***/      
    $('.pastors-carousel').parent().parent().parent().removeClass("container");
    $('.pastors-carousel').parent().parent().parent().parent().removeClass("block");






/*** HEADER CART DROPDOWN ***/ 
$('.cart-dropdown > p').click(function(){
    $(this).next("ul").slideToggle("slow");     
});

/*** HEADER CART CLOSE BY CLICKING OUTSIDE ***/ 
  $('.cart-dropdown').click(function(e){
     e.stopPropagation();
  });
  $('html').click(function() {
    $('.cart-dropdown > ul').slideUp('medium', function() {
      // Animation complete.
    });
  });

/*** HEADER CART ITEM REMOVE ***/ 
$('.cart-dropdown > ul li span.remove').click(function(){
    $(this).parent().slideUp("slow");     
});



    
/*** STICKY HEADER ***/ 
$(window).scroll(function() {    
    var scroll = $(window).scrollTop();
    if (scroll >= 41) {
        $(".stick").addClass("sticky");
    }
    else{
        $(".stick").removeClass("sticky");
    }
}); 
    
    
 /*** FIXED OR STATIC HEADER ON CLICK ***/      
$(".sticky").click( function(){
    $("header").addClass("stick");
    return false;
});
$(".non-sticky").click( function(){
    $("header").removeClass("stick");
    $("header").removeClass("sticky");
    return false;
});
   


$(".header1-btn").click( function(){
    $("header").attr('class',"");
    $(".page-top").addClass('extra-gap');
    return false;
});    
$(".header2-btn").click( function(){
    $("header").attr('class',"");
    $("header").addClass('header2');
    $(".page-top").removeClass('extra-gap');
    return false;
});    
$(".header3-btn").click( function(){
    $("header").attr('class',"");
    $("header").addClass('header3');
    $(".page-top").addClass('extra-gap');
    return false;
});    
$(".header4-btn").click( function(){
    $("header").attr('class',"");
    $("header").addClass('header4');
    $(".page-top").removeClass('extra-gap');
    return false;
});    
$(".header5-btn").click( function(){
    $("header").attr('class',"");
    $("header").addClass('header5');
    $(".page-top").addClass('extra-gap');
    return false;
});    
$(".header6-btn").click( function(){
    $("header").attr('class',"");
    $("header").addClass('header6');
    $(".page-top").addClass('extra-gap');
    return false;
});    
$(".header7-btn").click( function(){
    $("header").attr('class',"");
    $("header").addClass('header7');
    $(".page-top").addClass('extra-gap');
    return false;
});    
$(".header8-btn").click( function(){
    $("header").attr('class',"");
    $("header").addClass('header8');
    $(".page-top").removeClass('extra-gap');
    return false;
});    
$(".header9-btn").click( function(){
    $("header").attr('class',"");
    $("header").addClass('header9');
    $(".page-top").addClass('extra-gap');
    return false;
});    



var e = new Date( "01/31/2015 12:00:00");
 e.setDate(e.getDate());                
    var dd = e.getDate();
    var mm = e.getMonth() + 1;
    var y = e.getFullYear();
   var h = e.getHours();
   var m = e.getMinutes();
   var s = e.getSeconds();
   
    var futureFormattedDate = mm + "/" + dd + "/" + y + " "+ h + ":" + m + ":" + s ;
//console.log(futureFormattedDate);

if ($('.headercounter').length > 0) {

    $('.headercounter').downCount({
        date: futureFormattedDate,
        offset: +5
    });
}

/*** WIDE AND BOXED LAYOUT ***/      
$('.boxed').click(function() {
    $('.theme-layout').addClass("boxed");
    $('body').css('background-image', 'url(images/pat1.png)');
    return false;
});
$('.wide').click(function() {
    $('.theme-layout').removeClass("boxed");
    $('body').css('background-image', 'none');
    return false;
});


$('.pattern1').on('click', function() {
    $('body').css('background-image', 'url(images/pat1.png)');
})
$('.pattern2').on('click', function() {
    $('body').css('background-image', 'url(images/pat2.png)');
})
$('.pattern3').on('click', function() {
    $('body').css('background-image', 'url(images/pat3.png)');
})
$('.pattern4').on('click', function() {
    $('body').css('background-image', 'url(images/pat4.png)');
})
$('.pattern5').on('click', function() {
    $('body').css('background-image', 'url(images/pat5.png)');
})


/*=================== Responsive Menu ===================*/
$(".responsive-btn").on("click",function(){
    $(".responsive-menu").addClass("slidein");
    return false;
});
$("html").on("click",function(){
    $(".responsive-menu").removeClass("slidein");
});
$(".responsive-menu").on("click",function(e){
    e.stopPropagation();
});
//$(".responsive-menu li.menu-item-has-children > a").on("click",function(){
$(".responsive-menu li.menu-item-has-children a i").on("click", function () {
    $(this).parent().parent().siblings().children("ul").slideUp();
    $(this).parent().parent().siblings().removeClass("active");
    $(this).parent().parent().children("ul").slideToggle();
    $(this).parent().parent().toggleClass("active");
    return false;
});


/*=================== LightBox ===================*/
var foo = $('.lightbox');
foo.poptrox({
    usePopupCaption: true,
    usePopupNav:                true,
});


/*** AJAX CONTACT FORM ***/ 
$('#contactform').submit(function(){
    var action = $(this).attr('action');
    $("#message").slideUp(750,function() {
    $('#message').hide();
        $('#submit')
        .after('<img src="/assets/images/ajax-loader.gif" class="loader" />')
        .attr('disabled','disabled');
    $.post(action, {
        name: $('#name').val(),
        email: $('#email').val(),
        comments: $('#comments').val(),
        verify: $('#verify').val()
    },
        function(data){
            document.getElementById('message').innerHTML = data;
            $('#message').slideDown('slow');
            $('#contactform img.loader').fadeOut('slow',function(){$(this).remove()});
            $('#submit').removeAttr('disabled');
            if(data.match('success') != null) $('#contactform').slideUp('slow');

        }
    );
    });
    return false;
});

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
    return pattern.test(emailAddress);
}

    //Contact us form
jQuery('.send-message').click(function (e) {
    //console.warn('click');
    jQuery('.thanks').hide();
    $('.validation-error').hide();
    e.preventDefault();

    var form = $('#contact-us-form'),
        name = form.find('#name'),
        email = form.find('#email'),
        message = form.find('.message'),
        button = form.find('.send-message'),
        executionError = form.find('.execution-error'),
        emailErrorLabel = form.find('.email-error'),
        validationError = form.find('.validation-error'),
        thanks = form.find('.thanks');

    var error = 0;
    var emailError = 0;

    //console.log(validationError);
    form.find('input').each(function () {
        if (jQuery(this).val() == null || jQuery(this).val() == "" || jQuery(this).val() == undefined) {
            error = 1;
            jQuery(this).addClass('error');
        }
        else {
            jQuery(this).removeClass('error');
        }
    });

    if (message.val() == null || message.val() == "" || message.val() == undefined) {
        error = 1;
        message.addClass('error');
    }
    else {
        message.removeClass('error');
    }

    if (!isValidEmailAddress(email.val())) {
        emailError = 1;
        email.addClass('error');
        emailErrorLabel.show();
    }
    else {
        email.removeClass('error');
        emailErrorLabel.hide();
    }

    if (error == 0 && emailError == 0) {
        //console.log('executing');

        validationError.hide();
        emailErrorLabel.hide();

        button.attr('disabled', 'disabled');
        var data = form.serializeArray();

        var jqxhr = jQuery.post('/Umbraco/Api/KpgApi/LeaveMessage', data)
            .success(function (data) {
                //console.log(data);
                if (data.indexOf('success') >= 0) {
                    message.val('');
                    message.show();
                    //clear all fields
                    form.find('input').each(function () {
                        if ($(this).attr('type') != 'submit') {
                            jQuery(this).val('');
                        }
                    });

                }
                button.removeAttr('disabled');
                executionError.hide();
                thanks.show();

            })
            .error(function (data) {
                //console.log(data);
                executionError.show();
                button.removeAttr('disabled');
            });
        return false;


    }
    else {
        if (error == 1) {
            validationError.show();
        }
        else {
            validationError.hide();
        }
        if (emailError == 1) {
            emailErrorLabel.show();
        }
        else {
            emailErrorLabel.hide();
        }
    }
});

    //Footer contact us miniform

jQuery('.send-message-ft').click(function (e) {
    //console.warn('click');
    jQuery('.thanks-ft').hide();
    $('.validation-error-ft').hide();
    e.preventDefault();

    var form = $('#contact-us-form-ft'),
        name = form.find('#name'),
        email = form.find('#email'),
        message = form.find('.message'),
        button = form.find('.send-message-ft'),
        executionError = form.find('.execution-error-ft'),
        emailErrorLabel = form.find('.email-error-ft'),
        validationError = form.find('.validation-error-ft'),
        thanks = form.find('.thanks-ft');

    var error = 0;
    var emailError = 0;

    //console.log(validationError);
    form.find('input').each(function () {
        if (jQuery(this).val() == null || jQuery(this).val() == "" || jQuery(this).val() == undefined) {
            error = 1;
            jQuery(this).addClass('error');
        }
        else {
            jQuery(this).removeClass('error');
        }
    });

    if (message.val() == null || message.val() == "" || message.val() == undefined) {
        error = 1;
        message.addClass('error');
    }
    else {
        message.removeClass('error');
    }

    if (!isValidEmailAddress(email.val())) {
        emailError = 1;
        email.addClass('error');
        emailErrorLabel.show();
    }
    else {
        email.removeClass('error');
        emailErrorLabel.hide();
    }

    if (error == 0 && emailError == 0) {
        //console.log('executing');

        validationError.hide();
        emailErrorLabel.hide();

        button.attr('disabled', 'disabled');
        var data = form.serializeArray();

        var jqxhr = jQuery.post('/Umbraco/Api/KpgApi/LeaveMessage', data)
            .success(function (data) {
                //console.log(data);
                if (data.indexOf('success') >= 0) {
                    message.val('');
                    message.show();
                    //clear all fields
                    form.find('input').each(function () {
                        if($(this).attr('type')!='submit'){
                            jQuery(this).val('');
                        }
                    });

                }
                button.removeAttr('disabled');
                executionError.hide();
                thanks.show();

            })
            .error(function (data) {
                //console.log(data);
                executionError.show();
                button.removeAttr('disabled');
            });
        return false;


    }
    else {
        if (error == 1) {
            validationError.show();
        }
        else {
            validationError.hide();
        }
        if (emailError == 1) {
            emailErrorLabel.show();
        }
        else {
            emailErrorLabel.hide();
        }
    }
});

    //Alumni registration form
 
jQuery('.send-message-al').click(function (e) {
    //console.warn('click');
    jQuery('.thanks').hide();
    $('.validation-error').hide();
    e.preventDefault();

    var form = $('#alumniform'),
        email = form.find('#email'),
        message = form.find('.message'),
        button = form.find('.send-message-al'),
        executionError = form.find('.execution-error'),
        emailErrorLabel = form.find('.email-error'),
        validationError = form.find('.validation-error'),
        thanks = form.find('.thanks');

    var error = 0;
    var emailError = 0;

   // console.log(validationError);
    form.find('input[data-required="true"]').each(function () {
        if (jQuery(this).val() == null || jQuery(this).val() == "" || jQuery(this).val() == undefined) {
            error = 1;
            jQuery(this).addClass('error');
        }
        else {
            jQuery(this).removeClass('error');
        }
    });

    //if (message.val() == null || message.val() == "" || message.val() == undefined) {
    //    error = 1;
    //    message.addClass('error');
    //}
    //else {
    //    message.removeClass('error');
    //}

    if (!isValidEmailAddress(email.val())) {
        emailError = 1;
        email.addClass('error');
        emailErrorLabel.show();
    }
    else {
        email.removeClass('error');
        emailErrorLabel.hide();
    }

    if (error == 0 && emailError == 0) {
        //console.log('executing');

        validationError.hide();
        emailErrorLabel.hide();

        button.attr('disabled', 'disabled');
        var data = form.serializeArray();

        var jqxhr = jQuery.post('/Umbraco/Api/KpgApi/StoreAlumni', data)
            .success(function (data) {
                //console.log(data);
                if (data.indexOf('success') >= 0) {
                    message.val('');
                    message.show();
                }
                button.removeAttr('disabled');
                executionError.hide();
                thanks.show();
                //clear all fields
                form.find('input:not(:checkbox)').each(function () {
                    if ($(this).attr('type') != 'submit') {
                        jQuery(this).val('');
                    }
                });
            })
            .error(function (data) {
                //console.log(data);
                executionError.show();
                button.removeAttr('disabled');
            });
        return false;


    }
    else {
        if (error == 1) {
            validationError.show();
        }
        else {
            validationError.hide();
        }
        if (emailError == 1) {
            emailErrorLabel.show();
        }
        else {
            emailErrorLabel.hide();
        }
    }
});


});




}
/*
     FILE ARCHIVED ON 12:16:15 May 06, 2019 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 16:55:10 Aug 15, 2020.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
/*
playback timings (ms):
  PetaboxLoader3.datanode: 826.928 (5)
  captures_list: 417.11
  exclusion.robots.policy: 0.177
  LoadShardBlock: 379.795 (3)
  load_resource: 777.763
  esindex: 0.014
  exclusion.robots: 0.192
  RedisCDXSource: 9.671
  CDXLines.iter: 23.599 (3)
  PetaboxLoader3.resolve: 98.647 (2)
*/