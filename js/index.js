(function(){

var sreach = function(){
    this.data = null;
    this.ulhtml = '<div class="title"> <h3><a target="_blank" href="$url$">$name$</a></h3> </div> <div class="tags"> $tags$ </div> <div class="description"> <p class="des">$des$</p> </div>';
    this.boxEml = document.getElementById('list-itme');
    this.input = document.getElementById('search')
    this.info = document.getElementById('info')
    this.error = document.getElementById('error')
    this.page_size = 50;
    this.page_no = 1;

    if(this.boxEml){
        this.init();   
    }
}
sreach.prototype = {
    // 搜索字符串里面是否存在关键字
    isSreachIndexOF:function(oldstr,kw){
        if(!oldstr || !kw) return false;
        return oldstr.toLowerCase().indexOf(kw.toLowerCase()) > -1 ? true : false;
    },
    //简单模版
    simple:function(str,obj){
        return str.replace(/\$\w+\$/gi, function(matchs) {
            var returns = obj[matchs.replace(/\$/g, "")];
            return typeof returns === "undefined" ? "" : returns;
        })
    },
    //获取URL上面的参数
    getQueryString:function(name) { 
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
        var r = decodeURIComponent(window.location.search.substr(1)).match(reg);
        if (r != null) return unescape(r[2]); return null; 
    },
    ajax:function(url,callback){
        var xhr; 
        try {xhr = new ActiveXObject('Msxml2.XMLHTTP');   }
        catch (e){
            try {   
                xhr = new ActiveXObject('Microsoft.XMLHTTP');    
            }catch (e2){
              try {  xhr = new XMLHttpRequest();     }
              catch (e3) {  xhr = false;   }
            }
         }
      
        xhr.onreadystatechange  = function(){ 
             if(xhr.readyState  == 4 && xhr.status  == 200){

                callback&&(callback(JSON.parse(xhr.responseText),xhr))
             }
        };
        xhr.open('GET', url,  true); 
        xhr.send(null); 
    },
    itemHTML:function(arr,type,keywolds){
        var name = arr.name,des = arr.des,
            reg = new RegExp("("+keywolds+")","ig");
        if(type === 'search'){
            name = arr.name.replace(reg,'<i class="kw">'+"$1"+"</i>");
            des = arr.des.replace(reg,'<i class="kw">'+"$1"+"</i>") || '';
        }
        return this.simple(this.ulhtml,{
            name:name,
            url:arr.url,
            des:des || '',
            icon:arr.icon,
            tags:(function(tags){
                var _tags_html = tags.join('</span><span>');
                return _tags_html&&_tags_html!='' 
                    ? '<span>' + _tags_html + '</span>' 
                    : '';
            })(arr.tags||[])
        })
    },
    creatListHTML:function(num){
        var arr = this.data,self = this,page_size = this.page_size,i=num||0;
        if(arr&&arr.length&&toString.call(arr).indexOf('Array')>-1){
            for (; i < page_size; i++) {
                if(!arr[i]) break;
                var myLi = document.createElement("LI");
                myLi.innerHTML = self.itemHTML(arr[i]);
                self.boxEml.appendChild(myLi);
            }
        }
    },
    createSreachListHTML:function(keywolds){
        var eml = this.boxEml,
            self = this,
            arr = this.data,
            page_size = this.page_size,
            keywolds = keywolds.toLowerCase(),
            total = 0;

        for (var i = 0; i < arr.length; i++) {
            if(!arr[i]) break;
            if(total>page_size) break;
            if(self.isSreachIndexOF(arr[i].name,keywolds) 
                || self.isSreachIndexOF(arr[i].des,keywolds) 
            ){
                var myLi = document.createElement("LI");
                myLi.innerHTML = self.itemHTML(arr[i],'search',keywolds);
                ++total;
                eml.appendChild(myLi);
            }
        }
        
    },
    createTagsListHTML:function(keywolds){
        var eml = this.boxEml,
            arr = this.data,
            self = this,
            page_size = this.page_size,
            total = 0;

        for (var i = 0; i < arr.length; i++) {
            if(!arr[i]) break;
            if(total>page_size) break;

            if(arr[i]&&arr[i].tags&&arr[i].tags.indexOf(keywolds)>-1){
                var myLi = document.createElement("LI");
                myLi.innerHTML = self.itemHTML(arr[i],'tags',keywolds);
                eml.appendChild(myLi);

                ++total;    
            }
            
        }
    },
    isErrorInfo:function(){
        this.boxEml.innerHTML == '' 
            ? this.error.className='error'
            : this.error.className='hide';
    },
    bindEvent:function(elm,type,handle){
        if (elm.addEventListener) {
            elm.addEventListener(type, handle, false); 
        } else if (elm.attachEvent)  {
            elm.attachEvent('on'+type, handle);
        }
    },
    // 是不是Tag搜索
    isTagSearch:function(val){
        return /^(:|：)/.test(val)?true:false;
    },
    init:function(){
        var self = this;
        this.ajax('js/data.min.json',function(dt){
            self.data = dt;
            self.info.innerHTML = '搜集到<i> '+dt.length+' </i>个站点 ｜ ';
            var kw = self.getQueryString('kw');
            
            // 绑定输入事件
            self.bindEvent(self.input,'input',function(e){
                var val = e.target.value
                self.boxEml.innerHTML='';
                val? (self.isTagSearch(val)
                        ?self.createTagsListHTML(val.replace(/^(:|：)/,''))
                        :self.createSreachListHTML(val)
                    )
                    :self.creatListHTML();

                if(window.history&&window.history.pushState)
                    history.pushState({},"jsdig","?kw="+val);

                self.isErrorInfo();
            })

            kw?(self.input.value=kw,
                (self.isTagSearch(kw)
                    ?self.createTagsListHTML(kw.replace(/^(:|：)/,''))
                    :self.createSreachListHTML(kw)
                )
            )
            :self.creatListHTML();
            self.isErrorInfo();

        })
    }
}


new sreach();



})();