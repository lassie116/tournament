(function () {
     var member_list,tree,no2idx;
     window.onload = init;
     
     function init(){
         $('#menu0').show();
         $('#menu1').hide();
         $('#make').click(make_tournament);
         $('#shuffle').click(shuffle);
         $('#reset').click(reset);
         $('#edit').click(edit_draw);
         $('#cancel').click(draw);
         $('#area').click(handler);
     }

     function handler(ev){
         var tag = ev.target.tagName;
         if (tag == "A") win(ev);
         if (tag == "BUTTON") {
             if (ev.target.className == "add") {
                 add_member(parseInt(ev.target.attributes["no"].nodeValue));
                 edit_draw();
             } else {
                 if (ev.target.className == "delete") {
                 delete_member(parseInt(ev.target.attributes["no"].nodeValue));
                 } else if (ev.target.className == "edit") {
                     update_name();
                 }
                 draw();
             }
         }
     }

     function make_html(idx,f){
         var self_no = tree[idx];
         var child0 = tree[idx*2];
         var child1 = tree[idx*2+1];
         if (self_no == 0 || child0 != undefined || child1 != undefined) {
             // branch
             return merge(idx, make_html(idx*2,f), make_html(idx*2+1,f));
         }
         // leaf
         var name = member_list[no2idx[self_no]];
         return [(tree[Math.floor(idx/2)] == self_no ? K.BH : K.H) +
                 K.Blank + f(self_no,name)];
     }

     function merge(node, a, b) {
         var self = tree[node];
         var new_a = merge_aux(self != 0 && self == tree[node*2], true, a);
         var new_b = merge_aux(self != 0 && self == tree[node*2+1], false, b);
         var joint = [self != 0 ? (K.BH + K.BT) : (K.H + K.T)];
         return new_a.concat(joint,new_b);
     }

     function merge_aux(is_bold, up, list) {
         var result = [];
         var state = "upside";
         for (var i = 0;i < list.length;i++){
             var line = list[i];
             var t;
             if (state == "downside") {
                 t = up ? (is_bold ? K.BV : K.V) : K.Blank;
             } else if (line[0] == K.H || line[0] == K.BH) {
                 t = up ? (is_bold ? K.BF : K.F) : (is_bold ? K.BL : K.L);
                 state = "downside";
             } else {
                 t = up ? K.Blank : (is_bold ? K.BV : K.V); 
             }
             result.push(K.Blank + t + line);
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
         $('#area')[0].innerHTML = make_html(1,func).join("<br />"); 
     }

     function draw(){ 
         _draw(normal);
         function normal(no,name){ return "<a no="+ no +">" + name + "</a>"; }
     }

     function edit_draw(){
         _draw(edit_leaf);
         function edit_leaf(no,name){
             var n = "<input type='text' no='"+ no +"' value='"+name+"'/>";
             var e = "<button class='edit'>更新</button>"
             var a = "<button no='"+no+"' class='add'>対戦相手追加</button>"
             var d = "<button no='"+no+"' class='delete'>削除</button>"
             return n + e + a + d;
         }
     }

     function make_tournament() {
         //$('#member').hide();
         $('#menu0').hide();
         $('#menu1').show();
         var pre_members = $('#member')[0].value.split("\n")
         member_list = [];
         for (var i = 0;i < pre_members.length;i++){
             if (pre_members[i] != "") {
                 member_list.push(pre_members[i]);
             }
         }
         tree = [];
         make_tree(1,1,member_list.length);
         shuffle();
     }

     function shuffle() {
         if (no2idx == undefined) {
             no2idx = {};
             for (var i = 0;i < member_list.length;i++) no2idx[i+1] = i;
         }
         for (var i = 0;i < member_list.length - 1;i++) {
             if (no2idx[i+1] == undefined) continue;
             var a;
             do {
                 a = Math.floor(Math.random() * (member_list.length - i));
             } while (no2idx[i+a+1] == undefined);
             var t = no2idx[i+1];
             no2idx[i+1] = no2idx[i + a + 1];
             no2idx[i + a + 1] = t;
         }
         reset();
     }

     function update_name(){
         var input_list = document.getElementsByTagName("INPUT");
         for (var i = 0;i<input_list.length;i++){
             var attr = input_list[i].attributes["no"];
             if (attr == undefined) continue;
             var idx = no2idx[parseInt(attr.nodeValue)];
             member_list[idx] = input_list[i].value;
         }
     }

     function add_member(src){
         var new_idx = member_list.length;
         var leaf = tree.lastIndexOf(src);
         member_list.push("新規参加者");
         var new_no = new_idx + 1;
         tree[leaf*2] = tree[leaf];
         tree[leaf*2+1] = new_no;
         tree[leaf] = 0;
         no2idx[new_no] = new_idx;
     }

     function delete_member(no){
         no2idx[no] = undefined;
         var leaf = tree.lastIndexOf(no);
         var p = Math.floor(leaf/2);
         tree[p] = tree[p*2] == no ? tree[p*2+1] : tree[p*2];
         tree[p*2] = undefined;
         tree[p*2+1] = undefined;
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