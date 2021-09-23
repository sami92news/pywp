$(function(){
    let host_name = window.location.hostname;
    if(host_name.indexOf('adminurdu')>-1){
        $('title').html('Urdu: ' + $('title').html());
    }
    else{
        $('title').html('Eng: ' + $('title').html());
    }
});
var web_utils = {
    search_param: function(param_name, now_url = window.location + ''){
        let params = (new URL(now_url)).searchParams;
        let param_val = params.get(param_name);
        return param_val;
    },
    add_param_to_url: function(now_url, param_name, param_val){
        if(!param_name)
        {
            return now_url;
        }
        let old_kw = this.search_param(param_name, now_url);

        console.log(now_url, old_kw, param_name, param_val);
        if(!param_val){
            if(old_kw){
                if(now_url.indexOf('&'+param_name+'='+old_kw) > -1)
                {
                     now_url = now_url.replace('&'+param_name+'='+old_kw, '');
                }
                else if(now_url.indexOf(''+param_name+'='+old_kw+'&') > -1)
                {
                    now_url = now_url.replace(''+param_name+'='+old_kw+'&', '');
                }
                else{
                    now_url = now_url.replace('?'+param_name+'='+old_kw, '');
                }
            }
        }
        else{
            if(now_url.indexOf(''+param_name+'=')>-1)
            {
                if(now_url.indexOf(param_name+'='+param_val) > -1)
                {
                    return now_url;
                }
                else{
                    now_url = now_url.replace(''+param_name+'='+old_kw, ''+param_name+'='+param_val);
                }
            }
            else{
                param_val = ''+param_name+'='+param_val;
                if(now_url.indexOf('?') === -1)
                {
                    param_val = '?'+param_val;
                }
                else{
                    param_val = '&'+param_val;
                }
                now_url += param_val;
            }
        }
        return now_url;
    }
}