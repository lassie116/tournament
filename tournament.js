(function () {
     var members,map,tree;
     window.onload = init;

     function $(id) { return document.getElementById(id); };
     
     function init(){
         $('menu0').style.display = "block";
         $('menu1').style.display = "none";

         $('make').addEventListener("click",make_tournament);
         $('shuffle').addEventListener("click",shuffle);
         $('reset').addEventListener("click",reset);
         $('edit').addEventListener("click",edit_draw);
         $('add').addEventListener("click",add_draw);

         $('area').addEventListener("click",handler);
     }

     function handler(ev){
         var tag = ev.target.tagName;
         if (tag == "A") win(ev);
         if (tag == "BUTTON") {
             if (ev.target.className == "add") {
                 add_member(parseInt(ev.target.attributes["no"].nodeValue));
                 edit_draw();
             } else if (ev.target.className == "edit") {
                 edit_members();
                 draw();
             } else {
                 draw();
             }
         }
     }

     function make_html(idx,leaf_func){
         var self = tree[idx];
         var child0 = tree[idx*2];
         var child1 = tree[idx*2+1];
         if (self == 0 || child0 != undefined || child1 != undefined) {
             return merge(idx, make_html(idx*2,leaf_func), 
                          make_html(idx*2+1,leaf_func));
         }
         var name = members[map[self - 1]];
         return {pos: 0,
                 line: [(tree[Math.floor(idx/2)] == self ? K.BH : K.H) +
                        K.Blank + leaf_func(self,name)]};
     }

     function merge(node, a, b) {
         var self = tree[node];
         var new_a = merge_aux(self != 0 && self == tree[node*2], true, a);
         var new_b = merge_aux(self != 0 && self == tree[node*2+1], false, b);
         new_a.push( self != 0 ? (K.BH + K.BT) : (K.H + K.T));
         return {pos: new_a.length - 1, line: new_a.concat(new_b)};
     }

     function merge_aux(is_bold, up, elem) {
         var line,result = [];
         for (var i = 0;i < elem.line.length;i++){
             if (i < elem.pos) {
                 line = up ? K.Blank : (is_bold ? K.BV : K.V); 
             } else if (i === elem.pos) {
                 line = up ? (is_bold ? K.BF : K.F) : (is_bold ? K.BL : K.L);
             } else {
                 line = up ? (is_bold ? K.BV : K.V) : K.Blank;
             }
             result.push(K.Blank + line + elem.line[i]);
         }
         return result;
     }
     
     function make_tree(n,start,end){
         var size = end - start + 1;
         if (size == 1) { // leaf
             tree[n] = start;
         } else {
             var mid = Math.ceil(size/2);
             tree[n] = 0;
             make_tree(n*2,start,start+mid-1);
             make_tree(n*2+1,start+mid,end);
         }
     }

     function _draw(func){
         $('area').innerHTML = make_html(1,func).line.join("<br />"); 
     }

     function draw(){ 
         _draw(normal);
         function normal(no,name){ return "<a no="+ no +">" + name + "</a>"; }
     }

     function edit_draw(){
         _draw(edit_leaf);
         function edit_leaf(no,name){
             var e = "<input type='text' no='"+ no +"' value='"+name+"'/>";
             var b = "<button class='edit'>変更保存</button>"
             var c = "<button>キャンセル</button>"
             return e + b + c;
         }
     }

     function add_draw(){
         _draw(add_leaf);
         function add_leaf(no,name){
             var n = "<a no="+ no +">" + name + "</a>";
             var b = "<button no='"+no+"' class='add'>ここに追加</button>"
             var c = "<button>キャンセル</button>"
             return n + b + c;
         }
     }

     function make_tournament() {
         $('member').style.display = "none";
         $('menu0').style.display = "none";
         $('menu1').style.display = "block";
         var pre_members = $('member').value.split("\n")
         members = pre_members.filter(function(e) {return (e != "");});
         tree = [];
         make_tree(1,1,members.length);
         shuffle();
     }

     function shuffle() {
         map = [];
         for (var i = 0;i < members.length;i++) map[i] = i;
         for (var i = 0;i < members.length - 1;i++) {
             var a = Math.floor(Math.random() * (members.length - i));
             var t = map[i];
             map[i] = map[i + a];
             map[i + a] = t;
         }
         reset();
     }

     function edit_members(){
         var input_list = document.getElementsByTagName("INPUT");
         for (var i = 0;i<input_list.length;i++){
             var attr = input_list[i].attributes["no"];
             if (attr == undefined) continue;
             var no = parseInt(attr.nodeValue);
             var idx = map[no-1];
             members[idx] = input_list[i].value;
         }
     }

     function add_member(src){
         var leaf = tree.lastIndexOf(src);
         members.push("新規メンバ");
         var idx = members.length;
         tree[leaf*2] = tree[leaf];
         tree[leaf*2+1] = idx;
         tree[leaf] = 0;
         map[idx-1] = idx-1;
     }

     function win(ev) {
         var attr = ev.target.attributes;
         if (attr["no"] == undefined) return;
         var no = parseInt(attr["no"].nodeValue);
         var node = tree.lastIndexOf(no);
         for(;;){ 
             if (node == 0) break;
             if (tree[node] != no) {
                 tree[node] = no;
                 break;
             } 
             node = Math.floor(node / 2);
         }
         draw();
     }

     function reset(){
         for (var i = 0;i<tree.length;i++){
             if (tree[i] == undefined || tree[i] == 0) continue;
             if (tree[i*2] == undefined && tree[i*2+1] == undefined) continue;
             tree[i] = 0;
         }
         draw();
     }
}());