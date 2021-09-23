(function (){
    function disable_ads(){
        window.adsbygoogle = {
            enabled: true,
            loaded: true,
            push: function () {
                return;
            },
            google_ad_client: "",
            enable_page_level_ads: true
        }
    }
    let host = window.location.hostname;
    if (host === "localhost" || host === '127.0.0.1') {
        window.is_localhost = 1;
        disable_ads();
    }

    function search_bar(){
        (function (){
            if( window.location.pathname.startsWith('/search-news'))
            {
                $('#search_container').show();
            }
            let formatted_date = '';
            function format_date(given_date){
                let month = given_date.getMonth()+1;
                if(month<10){
                    month = '0'+month;
                }
                let date = given_date.getDate();
                if(date<10){
                    date = '0'+date;
                }
                formatted_date = given_date.getFullYear()+'-'+month+'-'+date;
                return formatted_date;
            }

            $(function (){
                function open_search(){
                    $('#search_container').show();
                }
                $('.menu-btn.search.opener:first').show().click(function (){
                    open_search();
                })
                function close_search(){
                    $('#search_container').hide();
                }
                $('#search_container .closer').click(function (){
                    close_search();
                });

                let loc = window.location.toString().replace(window.location.origin, '');
                if(loc.startsWith('/search-news'))
                {
                    let qs = loc.split('?');
                    if(qs.length < 2){
                        return;
                    }
                    qs = qs[1];
                    let params = qs.split('&');
                    let arr = [];
                    let search_form = $('#search_container form');
                    for(let p of params)
                    {
                        arr = p.split('=')[0];
                        let name = arr[0];
                        let val = arr[1];
                        search_form.find('.input[name="'+name+'"]').val(val);
                    }
                    open_search();
                }
            })
        })()
    }
    search_bar();
})()

$(function (){
    window.has_loaded = 1;
    window.lazy_load_images();
    $(document).on('touchstart mousedown', 'body', function (e){
        hide_hidables(e);
    });
    function hide_hidables(e){
        if(!$(e.target).closest('.hide_on_click_away').length)
        {
            let elm = $(e.target);
            let data_target = null;
            while (!elm.is('body'))
            {
                data_target = elm.attr('data-target');
                if(data_target)
                {
                    break;
                }
                elm = elm.parent();
            }
            $('.hide_on_click_away:visible').each(function (i, el){
                let qel = $(this);
                if(qel.is(data_target))
                {
                    return false;
                }
                if(qel.is('.collapse, .show')){
                    qel.removeClass('show');
                }
                else{
                    qel.hide();
                }
            })
        }
    }

    $('textarea:visible, input:visible, select:visible').first().focus();
});

var ajax_utils = {
    bind_form: function(selector, form_options){
        let form = $(selector);
        let poster_btn = form.find('[type="submit"]:first');
        form.submit(function(e){
            e.preventDefault();
            if(!form_options){
                form_options = {}
            }
            if(!$(form).attr('method'))
            {
                form_options.type = 'POST';
            }
            form_options.dataType = 'JSON';
            let submit_url = form.attr('action');
            if(!submit_url){
                submit_url = form_options.url;
            }
            form_options.success = function(data){
                let message = 'Invalid status response from API';
                if(data && data.status){
                    if(data.status == 'success'){
                        if(form_options.on_success)
                        {
                            form_options.on_success(data.data);
                        }
                        else{
                            console.log(data);
                        }
                        form[0].reset();
                        return;
                    }
                    else{
                        if(data.status == 'error' && data.message)
                        {
                            message = data.message;
                        }
                    }
                }
                if(form_options.on_error)
                {
                    form_options.on_error({message: message});
                }
                else{
                    form.find('.error-message:first').html(message+' in '+submit_url).show();
                    console.log(data.detail);
                }
            }

            form_options.error = function(data){
                let message = '';
                if(data && data.responseJSON && data.responseJSON.message)
                {
                    message = data.responseJSON.message;
                }
                else{
                    message = $(data.responseText);
                    message = ajax92.parseMessage(message, 'django');
                }
                if(form_options.on_error)
                {
                    form_options.on_error({message: message});
                }
                else{
                    form.find('.error-message:first').html(message+' in '+submit_url).show();
                }
            }

            form_options.complete = function(){
                poster_btn.removeAttr('disabled');
                if(form_options.on_complete){
                    form_options.on_complete();
                }
                $('textarea:visible, input:visible, select:visible').first().focus();
            }
            if(!form_options.url){
                form_options.url = form.attr('action');
            }
            if(!form.find(".error-message").length){
                form.prepend('<h5 class="error-message"></h5>');
            }
            form.find('.error-message:first').hide();
            poster_btn.attr('disabled', 'disabled');
            form.ajaxSubmit(form_options);
        })
    },
    http: function(ajax_options){
        if(!ajax_options){
            ajax_options = {}
        }
        ajax_options.dataType = 'JSON';
        submit_url = ajax_options.url;
        ajax_options.success = function(data){
            let message = 'Invalid status response from API';
            if(data && data.status){
                if(data.status == 'success'){
                    if(ajax_options.on_success)
                    {
                        ajax_options.on_success(data.data);
                    }
                    else{
                        console.log(data);
                    }
                    return;
                }
                else{
                    if(data.detail)
                    {
                        console.log(data.detail);
                    }
                    if(data.status == 'error' && data.message)
                    {
                        message = data.message;
                    }
                }
            }
            if(ajax_options.on_error)
            {
                ajax_options.on_error({message: message});
            }
            else{
                console.log(data.detail);
            }
        }

        ajax_options.error = function(data){
            let message = '';
            if(data && data.responseJSON && data.responseJSON.message)
            {
                message = data.responseJSON.message;
            }
            else{
                message = $(data.responseText);
                message = ajax92.parseMessage(message, 'django');
            }
            if(ajax_options.on_error)
            {
                ajax_options.on_error({message: message});
            }
            else{
                console.log(message);
            }
        }

        ajax_options.complete = function(){
            if(ajax_options.on_complete){
                ajax_options.on_complete();
            }
        }
        $.ajax(ajax_options);
    },
    parseMessage: function(arr, framework){
        let error_message = 'Error not parsed';
        switch(framework){
            case 'django':
                for(let el of arr){
                    if(el.id == 'summary')
                    {
                        if(el.childNodes.length>1)
                        {
                            el.innerHTML = el.childNodes[0].outerHTML + el.childNodes[1].outerHTML;
                        }
                        error_message = el.outerHTML;
                    }
                }
            break;
        }
        return error_message;
    }
}

var dt_util = {
    format_now: function(format)
    {
        let now = new Date();
        return this.format_time(now, format);
    },
    add_interval: function (interval_type, amount, dt, format){
        if(!dt || dt === 'now')
        {
            dt = new Date();
        }
        if(typeof dt === 'string')
        {
            dt = new Date(dt);
        }
        let new_dt = dt.getTime();

        let milliseconds_to_add = 0;
        switch (interval_type)
        {
            case 's':
                milliseconds_to_add = amount * 1000;
                break;
            case 'i':
                milliseconds_to_add = amount * 60 * 1000;
                break;
            case 'h':
                milliseconds_to_add = amount * 60 * 60 * 1000;
                break;
            case 'd':
                milliseconds_to_add = amount * 24 * 60 * 60 * 1000;
                break;
        }
        new_dt += milliseconds_to_add;
        new_dt = new Date(new_dt);
        // console.log(new_dt, milliseconds_to_add, interval_type, dt);
        if(format)
        {
            new_dt = dt_util.format_time(new_dt, format);
        }
        // console.log(new_dt);
        return new_dt;
    },
    is_same_date: function (dt1, dt2=new Date()) {
        if(typeof dt1 ===  'string' || !isNaN(dt1)){
            dt1 = new Date(dt1);
        }
        if(typeof dt2 ===  'string' || !isNaN(dt2)){
            dt2 = new Date(dt2);
        }
        dt1 = this.format_time(dt1, 'Y-m-d');
        dt2 = this.format_time(dt2, 'Y-m-d');
        return dt1 === dt2;
    },
    format_time: function (dt, format){
        if(!dt || dt === 'now')
        {
            dt = new Date();
        }
        if(typeof dt === 'string')
        {
            dt = new Date(dt);
        }
        if(!format)
        {
            format = 'DS MS d, Y h:mm A'
        }
        const month_names_short = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        let day_names_short = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const month_names_full = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        let day_names_full = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        let result = '';
        let year, month, monthName,  dayName, date_of_month, hour, minute, second;
        let actual_hour = dt.getHours();

        format = format.split('');

        let index = 0;
        let next_char = '';
        let skip_next = false;
        for(ch of format){
            index += 1;
            if(skip_next)
            {
                skip_next = false;
                continue;
            }
            if(index < format.length)
            {
                next_char = format[index];
            }

            switch(ch)
            {
                case 'Y':
                    year = dt.getFullYear();
                    result += year;
                    break;
                case 'y':
                    year = dt.getYear();
                    result += year;
                    break;
                case 'M':
                    monthName = 'M';
                    if(next_char === 'F'){
                        monthName = month_names_full[dt.getMonth()];
                        skip_next = true;
                    }
                    if(next_char === 'S')
                    {
                        monthName = month_names_short[dt.getMonth()];
                        skip_next = true;
                    }
                    result += monthName;
                    break;
                case 'm':
                    month = dt.getMonth() + 1;
                    if(next_char === 'm')
                    {
                        if(month<10)
                        {
                            month ='0'+month;
                        }
                        skip_next = true;
                    }
                    result += month;
                    break;

                case 'D':
                    dayName = 'D';
                    if(next_char === 'F')
                    {
                        dayName = day_names_full[dt.getDay()];
                        skip_next = true;
                    }
                    if(next_char === 'S')
                    {
                        dayName = day_names_short[dt.getDay()];
                        skip_next = true;
                    }
                    result += dayName;
                    break;
                case 'd':
                    date_of_month = dt.getDate();
                    if(next_char === 'd')
                    {
                        date_of_month = dt.getDate();
                        if(date_of_month < 10){
                            date_of_month = '0'+date_of_month;
                        }
                        skip_next = true;
                    }
                    result += date_of_month;
                    break;

                case 'h':
                    hour = actual_hour % 12;
                    if(actual_hour === 12)
                    {
                        hour = actual_hour;
                    }
                    result += hour;
                    break;
                case 'H':
                    hour = actual_hour;
                    if(hour < 10){
                        hour = '0'+hour;
                    }
                    result += hour;
                    break;
                case 'i':
                    minute = dt.getMinutes();
                    if(minute<10){
                        minute = '0'+minute;
                    }
                    result += minute;
                    break;
                case 's':
                    second = dt.getSeconds();
                    if(second<10){
                        second = '0'+second;
                    }
                    result += second;
                    break;
                case 'a':
                    if(actual_hour>11)
                    {
                        result += 'p.m.';
                    }
                    else{
                        result += 'a.m.';
                    }
                    break;
                case 'A':
                    if(actual_hour>11)
                    {
                        result += 'PM';
                    }
                    else{
                        result += 'AM';
                    }
                    break;
                default:
                    result += ch;
            }
        }
        return result;
    },
    to_publish_time: function(published_at){
        published_at = published_at.replace('T',' ');
        published_at = published_at.replace('Z','');
        published_at = new Date(published_at);
        published_at = this.format_time(published_at, 'DS MS d, Y h:i A');
        return published_at;
    },
    make_ago_str: function(time_span_minutes, span, span_name, next_span, next_span_name){
        let res = '';
        let num = 0;
        let rem =  0;
        if(time_span_minutes >= span)
        {
            num = Math.floor (time_span_minutes / span);
            if(num > 1){
                span_name += 's';
            }
            res =  num + ' ' + span_name;
            rem = time_span_minutes % span;
            if(rem >= next_span)
            {
                num = Math.floor (rem / next_span);
                if(num > 1){
                    next_span_name += 's';
                }
                res += ', ' + Math.floor(num) + ' ' + next_span_name;
            }
            res += ' ago';
        }
        return res;
    },
    time_ago_str: function(prev_dt, next_dt = Date()){
        if(typeof prev_dt == 'string')
        {
            prev_dt = new Date(prev_dt);
        }
        if(typeof next_dt == 'string')
        {
            next_dt = new Date(next_dt);
        }
        let time_span = next_dt - prev_dt;
        let time_span_minutes = Math.floor(time_span / (60 * 1000));

        let year =  60 * 24 * 365;
        let month = 60 * 24 * 30;
        let week = 60 * 24 * 7;
        let day = 60 * 24;
        let hour = 60;
        let minute = 1;

        let res = this.make_ago_str(time_span_minutes, year, 'year', month, 'month');
        if(!res){
            res = this.make_ago_str(time_span_minutes, year, 'year', month, 'month');
        }
        if(!res){
            res = this.make_ago_str(time_span_minutes, month, 'month', week, 'week');
        }
        if(!res){
            res = this.make_ago_str(time_span_minutes, week, 'week', day, 'day');
        }
        if(!res){
            res = this.make_ago_str(time_span_minutes, day, 'day', hour, 'hour');
        }
        if(!res){
            res = this.make_ago_str(time_span_minutes, hour, 'hour', minute, 'minute');
        }
        if(!res){
            res = time_span_minutes+' minutes '+ ' ago';
        }
        return res;
    }
}

var json_utils = {
    sort_list_by_prop: function(arrayOfObjects, prop_name){
        var byDate = arrayOfObjects.slice(0);
        byDate.sort(function(a,b) {
            return a[prop_name] - b[prop_name];
        });
        return byDate;
    },

    add_delete_url_param: function(){

    }
}

var web_utils = {
    get_current_url: function(){
        let url = window.location;
        try{
            url = decodeURIComponent(url);
        }
        catch (er){

        }
        return url+'';
    },

    getLocalItemValue: function (key) {
        let item = this.getLocalItemWithExpiry(key);
        if(item && item.value)
        {
            return item.value;
        }
        else{
            return null;
        }
    },

    getLocalItemWithExpiry: function(key) {
        let itemStr = localStorage.getItem(key);
        if (!itemStr) {
            return null
        }
        let item = null;
        try{
            item = JSON.parse(itemStr);
            if(item.expiry)
            {
                return item;
            }
            else{
                item = setLocalItem(key, item);
                return item;
            }
        }
        catch (er){
            console.log(key + ' updating with expiry and value ', itemStr);
            item = this.setLocalItem(key, itemStr);
            return item;
        }
    },
    getLocalItemExpiry: function(key) {
        let itemStr = localStorage.getItem(key);
        if (!itemStr) {
            return null
        }
        let item = null;
        try{
            item = JSON.parse(itemStr);
            if(item.expiry)
            {
                return item.expiry;
            }
            else{
                item = this.setLocalItem(key, item);
                return item.expiry;
            }
        }
        catch (er){
            console.log(key + ' updating with expiry and value ', itemStr);
            item = this.setLocalItem(key, itemStr);
            return item.expiry;
        }
    },

    setLocalItem: function (key, value, duration={type: 'M', amount:1}) {
        const now = new Date().getTime();
        switch (duration.type){
            case 'M':
                duration = 1000 * 3600 * 24 * 30 * duration.amount;
                break;
            case 'd':
                duration = 1000 * 3600 * 24 * duration.amount;
                break;
            case 'h':
                duration = 1000 * 3600 * duration.amount;
                break;
            case 'm':
                duration = 1000 * 60 * duration.amount;
                break;
            case 's':
                duration = 1000 * duration.amount;
                break;
        }
        duration = now + duration;
        const item = {
            value: value,
            expiry: duration,
        }
        localStorage.setItem(key, JSON.stringify(item));
        return item;
    },

    isMobile : {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (this.Android() || this.BlackBerry() || this.iOS() || this.Opera() || this.Windows());
        }
    },

    is_mobile_device: function (){
        return this.isMobile.any();
    },

    is_local_host: function (){
        let host_name = window.location.hostname;
        // console.log('Host is ' + host);
        if(host_name.indexOf('localhost') > -1 || host_name.indexOf('127.0.0.1') > -1){
            return true;
        }
    },
    set_image_heights: function (selector){
        if(1 === 1){
            return;
        }
        let article_container = $(selector);
        let c_width = article_container.children().first().width();
        c_width *= 0.66;
        let images = article_container.children().find('a img');
        //compromising cls
        images.css('height', c_width + 'px');
    },
    what_browser :function(){
        if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 )
        {
            return ('Opera');
        }
        else if(navigator.userAgent.indexOf("Chrome") != -1 || navigator.userAgent.indexOf("Chromium") != -1)
        {
            return ('Chrome');
        }
        else if(navigator.userAgent.indexOf("Safari") != -1)
        {
            return ('Safari');
        }
        else if(navigator.userAgent.indexOf("Firefox") != -1 )
        {
            return ('Firefox');
        }
        else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) //IF IE > 10
        {
            return ('IE');
        }
        else
        {
            return ('unknown');
        }
    },
    init_image_load: function (){
        let host_url = window.location.origin + '';
        let invalid_urls = ['/null', host_url + '/', host_url + '/wp-content', '/'];
        let supportsLazyLoad = ('loading' in document.createElement('img'));

        let image_sizes = {
            'full': [823, 503],
            'feature': [428, 240],
            'iphone': [382, 233],
            'regular': [283, 173],
            'min': [199, 121]
        };

        function get_size_name(el_width){
            let key_name = '';
            if(el_width > (image_sizes['full'][0] + image_sizes['feature'][0]) /2){
                key_name = 'full';
            }
            else if(el_width > (image_sizes['feature'][0] + image_sizes['iphone'][0]) /2){
                key_name = 'feature';
            }
            else if(el_width > (image_sizes['iphone'][0] + image_sizes['regular'][0]) /2){
                key_name = 'iphone';
            }
            else if(el_width > (image_sizes['regular'][0] + image_sizes['min'][0]) /2){
                key_name = 'regular';
            }
            else{
                key_name = 'min';
            }
            return key_name;
        }

        function isScrolledIntoView(elem)
        {
            var docViewTop = $(window).scrollTop();
            var docViewBottom = docViewTop + $(window).height();
            var elemTop = $(elem).offset().top;
            return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
        }

        function apply_src(jq_el, el, actual_src){
            //let height_now = jq_el.height();
            el.src = actual_src;
            // if(!jq_el.is('.h-100'))
            // {
            //     jq_el.height(height_now);
            // }
            jq_el.removeClass('waiting-square').removeAttr('data-src');
        }

        function load_images() {
            // console.log($('.top-news-container').height(), $('#main-container').height(), 222);
            let images_to_load = $('img[src="/gui/images/waiting-image.svg"],img[src="/gui/images/waiting-image-square.svg"]');
            if (images_to_load.length) {
                all_images_loaded = 0;
                images_to_load.each(function (i, el) {
                    if(!isScrolledIntoView(el)){
                        return;
                    }
                    let jq_el = $(el);
                    let actual_src = jq_el.attr('data-src');
                    if (actual_src && invalid_urls.indexOf(actual_src) === -1) {
                        let variants = jq_el.attr('data-variants');
                        let el_width = jq_el.width();
                        if(window.is_localhost)
                        {
                            let size_name = get_size_name(el_width);
                            if(size_name !== 'min')
                            {
                                //console.log(size_name, el_width);
                            }
                        }
                        if(variants){
                            let size_name = get_size_name(el_width);
                            if(size_name !== 'full'){
                                actual_src = actual_src.substring(0, actual_src.length - 5);
                                actual_src += '__'+size_name+'.webp';
                            }
                        }
                        if(supportsLazyLoad)
                        {
                            el.loading = 'lazy';
                            //apply_src();
                            el.src = actual_src;
                            jq_el.removeClass('waiting-square').removeAttr('data-src');

                        }
                        else {
                            if(window.has_loaded)
                            {
                                apply_src();
                            }
                        }
                    }
                });
            }
            else{
                all_images_loaded = 1;
            }
        }

        let all_images_loaded = 0;
        window.lazy_load_images = function (){
            let mouse_moved = 0;
            all_images_loaded = 0;
            $(document).bind( "scroll", function( event ) {
                if(all_images_loaded){
                    $(this).unbind(event);
                    console.log('All Images loaded');
                }
                else{
                    load_images();
                }
            });
            //if(host_url.indexOf('dev.92news') === - 1)
            {
                load_images();
            }
        };
    }
}
web_utils.init_image_load();
