(function () {
     var member_list,tree,no2idx;
     
     function init(){
         $('#menu0').show();
         $('#menu1').hide();
         $('#make').click(make_tournament);
         $('#just_make').click(just_make_tournament);
         $('#shuffle').click(shuffle);
         $('#reset').click(reset);
         $('#edit').click(edit_draw);
         $('#cancel').click(draw);
         $('#area').click(edit_handlers);

         check_hashcode();
     }

     function check_hashcode(){
         if (location.hash != "") {
             restore_state(location.hash);
             draw();
         }
     }

     function restore_state(base64){
         var obj = base64_to_state(base64);
         member_list = obj.member_list;
         tree = obj.tree;
         no2idx = obj.no2idx;

         $('#member')[0].value = member_list.join("\n");
     }

     function state_to_base64(){
         var obj = {
             member_list:member_list,
             tree:tree,
             no2idx:no2idx
         };
         var pack = msgpack.pack(obj);
         // to string
         var bstr = String.fromCharCode.apply(null,pack);
         var base64 = base64encode(bstr);
         return base64;
     }

     function base64_to_state(base64) {
         var bstr2 = base64decode(base64);
         var pack2 = [];
         for (var i = 0;i<bstr2.length;++i){
             pack2.push(bstr2.charCodeAt(i));
         }
         var obj2 = msgpack.unpack(pack2);
         return obj2;
     }

     function just_make_tournament(){
         _make_tournament(false);
     }

     function make_tournament(){
         _make_tournament(true);
     }

     function _make_tournament(shuffle_on) {
         //$('#member').hide();
         $('#menu0').hide();
         $('#menu1').show();
         var pre_members = $('#member')[0].value.split("\n")
         member_list = pre_members.filter(function(e) {return (e != "");});
         tree = [];
         make_tree(1,1,member_list.length);
         setup_no2idx();
         if (shuffle_on) {
             shuffle_idx();
         }
         reset();

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
     }

     function setup_no2idx(){
         if (no2idx == undefined) {
             no2idx = {};
             for (var i = 0;i < member_list.length;i++) no2idx[i+1] = i;
         }
     }

     function shuffle(){
         shuffle_idx();
         reset();
     }

     function shuffle_idx() {
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
     }

     function reset(){
         for (var i = 0;i<tree.length;i++){
             if (tree[i] == undefined || tree[i] == 0) continue;
             if (tree[i*2] == undefined && tree[i*2+1] == undefined) continue;
             tree[i] = 0;
         }
         draw();
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
         var from;
         if (tree[p*2] == no) {
             from = p*2+1;
         } else {
             from = p*2;
         }

         var old_tree = tree.slice(0); // Array copy
         move_rec(p,from);

         function move_rec(to,from){
             tree[to] = old_tree[from];
             if (tree[from] != undefined) {
                 move_rec(to*2,from*2);
                 move_rec(to*2+1,from*2+1);
             }
         }
     }

     function edit_handlers(ev){
         var tag = ev.target.tagName;
         if (tag == "A") win(ev);
         if (tag == "BUTTON") {
             if (ev.target.className == "add") {
                 add_member(parseInt(ev.target.attributes["no"].nodeValue));
                 edit_draw();
             } else if (ev.target.className == "delete") {
                 delete_member(parseInt(ev.target.attributes["no"].nodeValue));
                 edit_draw();
             } else if (ev.target.className == "edit") {
                 update_name();
                 draw();
             }
         }
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

     function draw(){ 
         _draw(normal);
         function normal(no,name){ return "<a no="+ no +">" + name + "</a>"; }
     }

     function edit_draw(){
         _draw(edit_leaf);
         function edit_leaf(no,name){
             var n = "<input type='text' no='"+ no +"' value='"+name+"'/>";
             var e = "<button class='edit'>名前保存</button>"
             var a = "<button no='"+no+"' class='add'>対戦相手追加</button>"
             var d = "<button no='"+no+"' class='delete'>削除</button>"
             return n + e + a + d;
         }
     }

     function _draw(make_leaf_func){
         var html_list = make_html(1,make_leaf_func);
         var url = make_url();
         html_list.unshift(url);
         location.hash = url;
         $('#area')[0].innerHTML = html_list.join("<br />");
     }

     function make_url(){
         //var str = "tournament.html#";
         var href = location.href + "#" + state_to_base64();
         var ar = [
             "<a href=\"",
             href,
             "\">",
             href,
             "</a>"
         ];
         return ar.join("");
     }

     function make_html(idx,make_leaf){
         var self_no = tree[idx];
         var parent = tree[Math.floor(idx/2)];
         var upper_child = tree[idx*2];
         var lower_child = tree[idx*2+1];

         // leaf
         if (self_no != 0 && 
             upper_child == undefined && lower_child == undefined) {
             var leaf_html = make_leaf(self_no,member_list[no2idx[self_no]]);
             return [(parent == self_no ? K.BH : K.H) + K.Blank + leaf_html];
         }

         // branch
         var self_is_bold = self_no != 0;
         var upper_is_bold = self_is_bold && self_no == upper_child;
         var lower_is_bold = self_is_bold && self_no == lower_child;

         var upper = make_html(idx*2,make_leaf);
         var lower = make_html(idx*2+1,make_leaf);
         var new_upper = add_vline(upper,true,upper_is_bold);
         var new_lower = add_vline(lower,false,lower_is_bold);

         var joint = [self_is_bold ? (K.BH + K.BT) : (K.H + K.T)];
         return new_upper.concat(joint,new_lower);

         function add_vline(list,upper,is_bold) {
             var result = [];
             var V = (is_bold ? K.BV : K.V);
             var L = (is_bold ? K.BL : K.L);
             var F = (is_bold ? K.BF : K.F);
             var state = "upside";
             for (var i = 0;i < list.length;i++){
                 var line = list[i];
                 if (line[0] == K.H || line[0] == K.BH) {
                     result.push(K.Blank + (upper ? F : L) + line);
                     state = "downside";
                 } else if (state == "upside") {
                     result.push(K.Blank + (upper ? K.Blank : V) + line);
                 } else if (state == "downside") {
                     result.push(K.Blank + (upper ? V : K.Blank) + line);
                 }
             }
             return result;
         }
     }
     
     init();
}());